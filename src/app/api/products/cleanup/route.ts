import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const blocked = await requireApiPermission("products:write");
  if (blocked) return blocked;

  const payload = await request.json().catch(() => ({}));
  const mode = String(payload?.mode ?? "archive").toLowerCase();

  if (mode !== "archive") {
    return NextResponse.json(
      { error: "Only archive mode is supported." },
      { status: 422 },
    );
  }

  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true },
  });

  if (!products.length) {
    return NextResponse.json({
      ok: true,
      message: "No products to archive.",
      archived: 0,
    });
  }

  await prisma.product.updateMany({
    where: { id: { in: products.map((product) => product.id) } },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({
    ok: true,
    message: "Products archived successfully.",
    archived: products.length,
  });
}
