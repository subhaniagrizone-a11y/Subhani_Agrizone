import { getProductBySlug, products as fallbackProducts } from "@/lib/data";
import { prisma } from "@/lib/db";
import { normalizeProduct } from "@/lib/product-normalize";

import type { Product } from "@/types";

function toProductModel(row: any): Product {
  return normalizeProduct({
    ...row,
    reviews: row.reviewCount,
  });
}

export async function getLiveProducts(limit?: number) {
  try {
    const rows = await prisma.product.findMany({
      where: { status: { in: ["ACTIVE", "DRAFT"] } },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: { updatedAt: "desc" },
      ...(typeof limit === "number" ? { take: limit } : {}),
    });

    if (!rows.length) {
      return typeof limit === "number"
        ? fallbackProducts.slice(0, limit)
        : fallbackProducts;
    }

    return rows.map(toProductModel);
  } catch {
    return typeof limit === "number"
      ? fallbackProducts.slice(0, limit)
      : fallbackProducts;
  }
}

export async function getLiveProductBySlug(slug: string) {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, status: { in: ["ACTIVE", "DRAFT"] } },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    });

    if (!row) {
      return getProductBySlug(slug) ?? null;
    }

    return toProductModel(row);
  } catch {
    return getProductBySlug(slug) ?? null;
  }
}
