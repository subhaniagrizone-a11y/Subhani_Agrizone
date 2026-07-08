import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

function collectionKey(module: string) {
  return `admin_collection_${module}`;
}

function normalizeItems(value: unknown) {
  if (!value || typeof value !== "object")
    return [] as Record<string, unknown>[];
  const items = (value as { items?: unknown }).items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

export async function GET(request: NextRequest) {
  const blocked = await requireApiPermission("admin:access");
  if (blocked) return blocked;

  const module = request.nextUrl.searchParams.get("module")?.trim();
  if (!module) {
    return NextResponse.json({ error: "module is required" }, { status: 422 });
  }

  const row = await prisma.siteSetting.findUnique({
    where: { key: collectionKey(module) },
  });

  return NextResponse.json({
    module,
    items: normalizeItems(row?.value),
  });
}

export async function PUT(request: NextRequest) {
  const blocked = await requireApiPermission("admin:access");
  if (blocked) return blocked;

  const payload = await request.json();
  const module = String(payload.module ?? "").trim();
  if (!module) {
    return NextResponse.json({ error: "module is required" }, { status: 422 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];

  const row = await prisma.siteSetting.upsert({
    where: { key: collectionKey(module) },
    update: {
      value: { items } as any,
      group: "adminCollections",
    },
    create: {
      key: collectionKey(module),
      value: { items } as any,
      group: "adminCollections",
    },
  });

  return NextResponse.json({
    ok: true,
    module,
    items: normalizeItems(row.value),
  });
}
