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

function normalizeBulkRow(row: Record<string, string>) {
  const title = row.title || row.Name || row.name || "";
  const slug = row.slug || row.Slug || "";
  const sku = row.sku || row.SKU || row.ID || "";
  const price = row.price || row["Regular price"] || row["Sale price"] || "";
  const salePrice = row["Sale price"] || row["Regular price"] || "";
  const stock = row.stock || row.Stock || row["Stock"] || "";
  const description =
    row.description || row.Description || row["Short description"] || "";
  const categoryId = row.categoryId || row.Categories || row.Category || "";
  const brandId = row.brandId || row.Brands || row.Brand || "";
  const images = row.images || row.Images || "";
  const status = row.status || "ACTIVE";

  return {
    title,
    slug,
    sku,
    price,
    salePrice,
    stock,
    description,
    categoryId,
    brandId,
    images,
    status,
  };
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
    duplicates: 0,
    errors: [] as string[],
    details: [] as Array<{
      rowNumber: number;
      status: "success" | "duplicate" | "failed";
      message: string;
      identifier?: string;
    }>,
  };

  rows.forEach((row, index) => {
    const normalizedRow = normalizeBulkRow(row);
    const rowNumber = index + 2;
    const identifier =
      row.id || normalizedRow.slug || normalizedRow.sku || "unknown";
    if (
      !normalizedRow.title &&
      !normalizedRow.slug &&
      !normalizedRow.sku &&
      mode !== "delete"
    ) {
      results.errors.push(`Missing required fields for row ${rowNumber}`);
      results.details.push({
        rowNumber,
        status: "failed",
        message: "Missing required fields",
        identifier,
      });
    }
  });

  for (const [index, row] of rows.entries()) {
    const normalizedRow = normalizeBulkRow(row);
    const rowNumber = index + 2;
    const identifier =
      row.id || normalizedRow.slug || normalizedRow.sku || "unknown";
    try {
      if (mode === "delete") {
        const identifier = row.id || row.slug || row.sku;
        if (!identifier) {
          results.errors.push(`Missing id/slug/sku for row ${rowNumber}`);
          results.details.push({
            rowNumber,
            status: "failed",
            message: "Missing id/slug/sku for delete row",
            identifier,
          });
          continue;
        }

        const existing = await prisma.product.findFirst({
          where: {
            OR: [{ id: identifier }, { slug: identifier }, { sku: identifier }],
          },
        });

        if (!existing) {
          results.errors.push(`Product not found for delete: ${identifier}`);
          results.details.push({
            rowNumber,
            status: "failed",
            message: `Product not found for delete: ${identifier}`,
            identifier,
          });
          continue;
        }

        await prisma.product.update({
          where: { id: existing.id },
          data: { status: "ARCHIVED" },
        });
        results.archived += 1;
        results.details.push({
          rowNumber,
          status: "success",
          message: `Archived ${identifier}`,
          identifier,
        });
        continue;
      }

      const candidate = {
        title: normalizedRow.title || undefined,
        slug: normalizedRow.slug || undefined,
        sku: normalizedRow.sku || undefined,
        barcode: row.barcode || undefined,
        categoryId: normalizedRow.categoryId || undefined,
        brandId: normalizedRow.brandId || undefined,
        price: normalizedRow.price || undefined,
        salePrice: normalizedRow.salePrice || undefined,
        wholesalePrice: row.wholesalePrice || undefined,
        dealerPrice: row.dealerPrice || undefined,
        farmerPrice: row.farmerPrice || undefined,
        stock: normalizedRow.stock || undefined,
        description: normalizedRow.description || undefined,
        usage: row.usage || undefined,
        dosage: row.dosage || undefined,
      };

      const parsed = productWriteSchema.safeParse(candidate);
      if (!parsed.success) {
        results.errors.push(
          `Invalid row (${row.sku || row.slug || "unknown"})`,
        );
        results.details.push({
          rowNumber,
          status: "failed",
          message: "Invalid values or missing required fields",
          identifier,
        });
        continue;
      }

      const { imageUrls, activeIngredients, specifications, ...productData } =
        parsed.data;

      const { relatedProducts, ...restProductData } =
        productData as typeof productData & {
          relatedProducts?: string[];
        };

      const mergedSpecifications = {
        ...(specifications ?? {}),
        activeIngredients: activeIngredients ?? [],
        ...(relatedProducts?.length ? { relatedProducts } : {}),
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
        results.details.push({
          rowNumber,
          status: "failed",
          message: "Category not found",
          identifier,
        });
        continue;
      }

      const existing = await prisma.product.findFirst({
        where: {
          OR: [
            ...(row.id ? [{ id: row.id }] : []),
            ...(normalizedRow.slug ? [{ slug: normalizedRow.slug }] : []),
            ...(normalizedRow.sku ? [{ sku: normalizedRow.sku }] : []),
          ],
        },
      });

      if (existing && mode === "create") {
        results.duplicates += 1;
        results.details.push({
          rowNumber,
          status: "duplicate",
          message: `Duplicate product detected for ${identifier}`,
          identifier,
        });
        continue;
      }

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
            ...restProductData,
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
        results.details.push({
          rowNumber,
          status: "success",
          message: `Created ${title}`,
          identifier,
        });
      } else {
        const safeImageUrls = imageUrls ?? [];
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...restProductData,
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
        results.details.push({
          rowNumber,
          status: "success",
          message: `Updated ${existing.slug}`,
          identifier,
        });
      }
    } catch (error) {
      results.errors.push(`Row failed: ${(error as Error).message}`);
      results.details.push({
        rowNumber,
        status: "failed",
        message: (error as Error).message,
        identifier,
      });
    }
  }

  return NextResponse.json({ ok: true, mode, ...results });
}
