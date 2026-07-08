import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

const ALLOWED_KEYS = new Set([
  "home_gallery",
  "home_diseases",
  "home_faq",
  "home_blog",
  "home_testimonials",
]);

function getItems(content: unknown) {
  if (!content || typeof content !== "object")
    return [] as Record<string, unknown>[];
  const items = (content as { items?: unknown }).items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

export async function GET(request: NextRequest) {
  const blocked = await requireApiPermission("cms:read");
  if (blocked) return blocked;

  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: "Valid section key is required" },
      { status: 422 },
    );
  }

  const section = await prisma.homepageSection.findUnique({ where: { key } });
  return NextResponse.json({ section, items: getItems(section?.content) });
}

export async function PUT(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const key = String(payload.key ?? "").trim();
  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: "Valid section key is required" },
      { status: 422 },
    );
  }

  const title = String(payload.title ?? "").trim() || key;
  const items = Array.isArray(payload.items) ? payload.items : [];

  const section = await prisma.homepageSection.upsert({
    where: { key },
    update: {
      title,
      active: payload.active !== undefined ? Boolean(payload.active) : true,
      sortOrder: Number(payload.sortOrder ?? 0) || 0,
      content: { items } as any,
    },
    create: {
      key,
      title,
      active: payload.active !== undefined ? Boolean(payload.active) : true,
      sortOrder: Number(payload.sortOrder ?? 0) || 0,
      content: { items } as any,
    },
  });

  return NextResponse.json({ section });
}

export async function PATCH(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const key = String(payload.key ?? "").trim();
  const id = String(payload.id ?? "").trim();
  if (!key || !id || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: "key and id are required" },
      { status: 422 },
    );
  }

  const section = await prisma.homepageSection.findUnique({ where: { key } });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const items = getItems(section.content).map((item) =>
    item.id === id ? { ...item, ...payload.item, id } : item,
  );

  const updated = await prisma.homepageSection.update({
    where: { key },
    data: { content: { items } as any },
  });

  return NextResponse.json({ section: updated });
}

export async function DELETE(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const key = request.nextUrl.searchParams.get("key")?.trim();
  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!key || !id || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { error: "key and id are required" },
      { status: 422 },
    );
  }

  const section = await prisma.homepageSection.findUnique({ where: { key } });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const items = getItems(section.content).filter((item) => item.id !== id);
  const updated = await prisma.homepageSection.update({
    where: { key },
    data: { content: { items } as any },
  });

  return NextResponse.json({ section: updated });
}
