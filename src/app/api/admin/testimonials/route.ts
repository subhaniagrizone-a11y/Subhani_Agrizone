import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const blocked = await requireApiPermission("cms:read");
  if (blocked) return blocked;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const name = String(payload.name ?? "").trim();
  const quote = String(payload.quote ?? "").trim();
  if (!name || !quote) {
    return NextResponse.json(
      { error: "Name and quote are required" },
      { status: 422 },
    );
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name,
      role: String(payload.role ?? "").trim() || null,
      quote,
      rating: Math.max(1, Math.min(5, Number(payload.rating ?? 5) || 5)),
      imageUrl: String(payload.imageUrl ?? "").trim() || null,
      active: Boolean(payload.active ?? true),
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const id = String(payload.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Testimonial not found" },
      { status: 404 },
    );
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      name:
        payload.name !== undefined
          ? String(payload.name ?? "").trim()
          : existing.name,
      role:
        payload.role !== undefined
          ? String(payload.role ?? "").trim() || null
          : existing.role,
      quote:
        payload.quote !== undefined
          ? String(payload.quote ?? "").trim()
          : existing.quote,
      rating:
        payload.rating !== undefined
          ? Math.max(1, Math.min(5, Number(payload.rating ?? 5) || 5))
          : existing.rating,
      imageUrl:
        payload.imageUrl !== undefined
          ? String(payload.imageUrl ?? "").trim() || null
          : existing.imageUrl,
      active:
        payload.active !== undefined
          ? Boolean(payload.active)
          : existing.active,
    },
  });

  return NextResponse.json({ testimonial });
}

export async function DELETE(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
