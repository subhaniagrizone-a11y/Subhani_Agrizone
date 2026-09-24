import { NextResponse } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

function toCsvValue(value: unknown) {
  if (value == null) return "";
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export async function GET(request: Request) {
  const blocked = await requireApiPermission("products:write");
  if (blocked) return blocked;

  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("includeArchived") === "1";

  const products = await prisma.product.findMany({
    where: includeArchived ? {} : { status: { not: "ARCHIVED" } },
    include: {
      category: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "id",
    "title",
    "slug",
    "sku",
    "barcode",
    "category",
    "brand",
    "price",
    "salePrice",
    "stock",
    "status",
    "description",
  ];

  const rows = products.map((product) => [
    product.id,
    product.title,
    product.slug,
    product.sku,
    product.barcode ?? "",
    product.category?.name ?? "",
    product.brand?.name ?? "",
    product.price,
    product.salePrice ?? "",
    product.stock,
    product.status,
    product.description ?? "",
  ]);

  const csv = [
    header.join(","),
    ...rows.map((row) => row.map((value) => toCsvValue(value)).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subhani-products-backup-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
