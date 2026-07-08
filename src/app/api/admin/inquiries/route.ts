import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const blocked = await requireApiPermission("customers:read");
  if (blocked) return blocked;

  const type = request.nextUrl.searchParams.get("type")?.trim();
  const inquiries = await prisma.inquiry.findMany({
    where: type ? { type: type as any } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ inquiries });
}

export async function PATCH(request: NextRequest) {
  const blocked = await requireApiPermission("customers:read");
  if (blocked) return blocked;

  const payload = await request.json();
  const id = String(payload.id ?? "").trim();
  const status = String(payload.status ?? "").trim();
  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 422 },
    );
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ inquiry });
}

export async function DELETE(request: NextRequest) {
  const blocked = await requireApiPermission("customers:read");
  if (blocked) return blocked;

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
