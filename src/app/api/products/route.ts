import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { products as fallbackProducts } from "@/lib/data";
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

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const idsParam = request.nextUrl.searchParams.get("ids")?.trim();
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const includeAllRequested = request.nextUrl.searchParams.get("all") === "1";

  let includeAll = false;
  if (includeAllRequested) {
    const blocked = await requireApiPermission("products:write");
    includeAll = !blocked;
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(ids.length ? { id: { in: ids } } : {}),
        ...(includeAll ? {} : { status: { in: ["ACTIVE", "DRAFT"] as const } }),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(category
          ? {
              category: {
                slug: category,
              },
            }
          : {}),
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: { updatedAt: "desc" },
      take: ids.length ? Math.max(48, ids.length) : 48,
    });

    return NextResponse.json({ products });
  } catch {
    const normalized = search?.toLowerCase();
    const products = fallbackProducts.filter((product) => {
      const matchesSearch =
        !normalized ||
        [product.title, product.sku, product.brand, product.category]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory =
        !category ||
        product.category.toLowerCase().replace(/\s+/g, "-") === category;
      return matchesSearch && matchesCategory;
    });
    return NextResponse.json({ products, source: "fallback" });
  }
}

export async function POST(request: NextRequest) {
  const blocked = await requireApiPermission("products:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const parsed = productWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { imageUrls, activeIngredients, specifications, ...productData } =
    parsed.data;

  const title = productData.title?.trim() || "Untitled Product";
  const slugBase = slugify(productData.slug?.trim() || title);
  const skuBase = productData.sku?.trim() || "SKU";
  const slug = await ensureUniqueSlug(slugBase);
  const sku = await ensureUniqueSku(skuBase);

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
    return NextResponse.json(
      { error: "No category available. Please create a category first." },
      { status: 422 },
    );
  }

  const safeImageUrls = imageUrls ?? [];
  const safeActiveIngredients = activeIngredients ?? [];

  const product = await prisma.product.create({
    data: {
      ...productData,
      title,
      slug,
      sku,
      categoryId: category.id,
      description:
        productData.description?.trim() ||
        "Product details will be updated soon.",
      price: productData.price ?? 0,
      stock: productData.stock ?? 0,
      benefits: productData.benefits ?? [],
      safetyInstructions: productData.safetyInstructions ?? [],
      specifications: {
        ...(specifications ?? {}),
        activeIngredients: safeActiveIngredients,
      } as any,
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

  return NextResponse.json({ product }, { status: 201 });
}
