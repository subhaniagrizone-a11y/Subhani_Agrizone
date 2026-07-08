import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { productWriteSchema } from "@/lib/validators";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(base: string) {
  let candidate = base || `product-${Date.now()}`;
  const maxAttempts = 50;

  for (let counter = 1; counter <= maxAttempts; counter += 1) {
    const existing = await prisma.product.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base || "product"}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${base || "product"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureUniqueSku(base: string) {
  let candidate = base || `SKU-${Date.now()}`;
  const maxAttempts = 50;

  for (let counter = 1; counter <= maxAttempts; counter += 1) {
    const existing = await prisma.product.findFirst({
      where: { sku: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base || "SKU"}-${counter}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  return `${base || "SKU"}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

export async function POST(request: NextRequest) {
  const blocked = await requireApiPermission("products:bulk");
  if (blocked) return blocked;

  const payload = await request.json();
  const mode = String(payload.mode ?? "create").toLowerCase() as
    | "create"
    | "update"
    | "delete";
  const csv = String(payload.csv ?? "");

  if (!["create", "update", "delete"].includes(mode)) {
    return NextResponse.json({ error: "Invalid bulk mode" }, { status: 422 });
  }

  if (!csv.trim()) {
    return NextResponse.json(
      { error: "CSV content is required" },
      { status: 422 },
    );
  }

  const rows = parseCsv(csv);
  if (!rows.length) {
    return NextResponse.json(
      { error: "No rows found in CSV" },
      { status: 422 },
    );
  }

  const results = {
    created: 0,
    updated: 0,
    archived: 0,
    errors: [] as string[],
  };

  for (const row of rows) {
    try {
      if (mode === "delete") {
        const identifier = row.id || row.slug || row.sku;
        if (!identifier) {
          results.errors.push("Missing id/slug/sku for delete row");
          continue;
        }

        const existing = await prisma.product.findFirst({
          where: {
            OR: [{ id: identifier }, { slug: identifier }, { sku: identifier }],
          },
        });

        if (!existing) {
          results.errors.push(`Product not found for delete: ${identifier}`);
          continue;
        }

        await prisma.product.update({
          where: { id: existing.id },
          data: { status: "ARCHIVED" },
        });
        results.archived += 1;
        continue;
      }

      const candidate = {
        title: row.title || undefined,
        slug: row.slug || undefined,
        sku: row.sku || undefined,
        barcode: row.barcode || undefined,
        categoryId: row.categoryId || undefined,
        brandId: row.brandId || undefined,
        price: row.price || undefined,
        salePrice: row.salePrice || undefined,
        wholesalePrice: row.wholesalePrice || undefined,
        dealerPrice: row.dealerPrice || undefined,
        farmerPrice: row.farmerPrice || undefined,
        stock: row.stock || undefined,
        description: row.description || undefined,
        usage: row.usage || undefined,
        dosage: row.dosage || undefined,
      };

      const parsed = productWriteSchema.safeParse(candidate);
      if (!parsed.success) {
        results.errors.push(
          `Invalid row (${row.sku || row.slug || "unknown"})`,
        );
        continue;
      }

      const { imageUrls, activeIngredients, specifications, ...productData } =
        parsed.data;

      const mergedSpecifications = {
        ...(specifications ?? {}),
        activeIngredients: activeIngredients ?? [],
      };

      const explicitCategoryId = productData.categoryId?.trim();

      let category = explicitCategoryId
        ? await prisma.category.findFirst({
            where: {
              OR: [{ id: explicitCategoryId }, { slug: explicitCategoryId }],
            },
            select: { id: true },
          })
        : null;

      if (!category) {
        category = await prisma.category.findFirst({
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
      }

      if (!category) {
        results.errors.push(
          `Category not found for row (${row.sku || row.slug || "unknown"})`,
        );
        continue;
      }

      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            ...(row.id ? [{ id: row.id }] : []),
            ...(row.slug ? [{ slug: row.slug }] : []),
            ...(row.sku ? [{ sku: row.sku }] : []),
          ],
        },
      });

      if (!existing || mode === "create") {
        const title =
          productData.title?.trim() || row.title || "Untitled Product";
        const slug = await ensureUniqueSlug(
          slugify(productData.slug?.trim() || row.slug || title),
        );
        const sku = await ensureUniqueSku(
          productData.sku?.trim() || row.sku || "SKU",
        );
        const safeImageUrls = imageUrls ?? [];

        await prisma.product.create({
          data: {
            ...productData,
            title,
            slug,
            sku,
            categoryId: category.id,
            description:
              productData.description?.trim() ||
              row.description ||
              "Product details will be updated soon.",
            price: productData.price ?? Number(row.price || 0),
            stock: productData.stock ?? Number(row.stock || 0),
            benefits: productData.benefits ?? [],
            safetyInstructions: productData.safetyInstructions ?? [],
            specifications: mergedSpecifications as any,
            ...(safeImageUrls.length
              ? {
                  images: {
                    create: safeImageUrls.map((url, index) => ({
                      url,
                      alt: title,
                      sortOrder: index,
                    })),
                  },
                }
              : {}),
            status: "ACTIVE",
          },
        });
        results.created += 1;
      } else {
        const safeImageUrls = imageUrls ?? [];
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            categoryId: category.id,
            specifications: mergedSpecifications as any,
            images: {
              deleteMany: {},
              create: safeImageUrls.map((url, index) => ({
                url,
                alt: productData.title?.trim() || existing.title,
                sortOrder: index,
              })),
            },
          },
        });
        results.updated += 1;
      }
    } catch (error) {
      results.errors.push(`Row failed: ${(error as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true, mode, ...results });
}
