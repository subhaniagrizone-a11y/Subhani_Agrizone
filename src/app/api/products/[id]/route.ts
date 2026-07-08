import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { productWriteSchema } from "@/lib/validators";

const DB_TIMEOUT_MS = 8000;

class DbTimeoutError extends Error {
  constructor() {
    super("Database timeout");
    this.name = "DbTimeoutError";
  }
}

function withDbTimeout<T>(promise: Promise<T>, ms = DB_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError()), ms);
  });

  return Promise.race<T>([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

function isDbConnectivityError(error: unknown) {
  if (error instanceof DbTimeoutError) return true;
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("server selection timeout") ||
    message.includes("no available servers") ||
    message.includes("replicasetnoprimary") ||
    message.includes("received fatal alert") ||
    message.includes("transactions are not supported")
  );
}

type ProductIdProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: ProductIdProps) {
  const { id } = await params;
  try {
    const product = await withDbTimeout(
      prisma.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          images: true,
          variants: true,
          reviews: true,
        },
      }),
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Unable to fetch product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: ProductIdProps) {
  const blocked = await requireApiPermission("products:write");
  if (blocked) return blocked;

  const { id } = await params;
  const payload = await request.json();
  const parsed = productWriteSchema.partial().safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product payload", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const hasImageUrls = Object.prototype.hasOwnProperty.call(
      payload,
      "imageUrls",
    );
    const hasActiveIngredients = Object.prototype.hasOwnProperty.call(
      payload,
      "activeIngredients",
    );
    const hasSpecifications = Object.prototype.hasOwnProperty.call(
      payload,
      "specifications",
    );

    const { imageUrls, activeIngredients, specifications, ...productData } =
      parsed.data;

    let resolvedCategoryId: string | undefined;
    if (productData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: productData.categoryId },
            { slug: productData.categoryId },
          ],
        },
        select: { id: true },
      });

      if (category) {
        resolvedCategoryId = category.id;
      }
    }

    const mergedSpecifications =
      hasSpecifications || hasActiveIngredients
        ? {
            ...(specifications ?? {}),
            ...(hasActiveIngredients
              ? { activeIngredients: activeIngredients ?? [] }
              : {}),
          }
        : undefined;

    const product = await withDbTimeout(
      prisma.product.update({
        where: { id },
        data: {
          ...productData,
          ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
          ...(mergedSpecifications
            ? { specifications: mergedSpecifications as any }
            : {}),
          ...(hasImageUrls
            ? {
                images: {
                  deleteMany: {},
                  create: (imageUrls ?? []).map((url, index) => ({
                    url,
                    alt: productData.title?.trim() || "Product image",
                    sortOrder: index,
                  })),
                },
              }
            : {}),
        },
      }),
    );

    return NextResponse.json({ product });
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Unable to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: ProductIdProps) {
  const blocked = await requireApiPermission("products:write");
  if (blocked) return blocked;

  const { id } = await params;
  try {
    await withDbTimeout(
      prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Unable to archive product" },
      { status: 500 },
    );
  }
}
