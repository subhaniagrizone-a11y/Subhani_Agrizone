import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const blocked = await requireApiPermission("seo:write");
  if (blocked) return blocked;

  const entityType = request.nextUrl.searchParams.get("entityType")?.trim() || "page";
  const entityId = request.nextUrl.searchParams.get("entityId")?.trim() || "homepage";

  const setting = await prisma.seoSetting.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
  });

  return NextResponse.json({
    setting: setting ?? {
      entityType,
      entityId,
      title: "",
      description: "",
      keywords: [],
      canonicalUrl: "",
      openGraphImage: "",
      noIndex: false,
      structuredData: {},
    },
  });
}

export async function PUT(request: NextRequest) {
  const blocked = await requireApiPermission("seo:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const entityType = String(payload.entityType ?? "page").trim() || "page";
  const entityId = String(payload.entityId ?? "homepage").trim() || "homepage";

  const setting = await prisma.seoSetting.upsert({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
    update: {
      title: String(payload.title ?? "").trim(),
      description: String(payload.description ?? "").trim(),
      keywords: Array.isArray(payload.keywords)
        ? payload.keywords.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
      canonicalUrl: String(payload.canonicalUrl ?? "").trim() || null,
      openGraphImage: String(payload.openGraphImage ?? "").trim() || null,
      noIndex: Boolean(payload.noIndex),
      structuredData:
        payload.structuredData && typeof payload.structuredData === "object"
          ? (payload.structuredData as any)
          : {},
    },
    create: {
      entityType,
      entityId,
      title: String(payload.title ?? "").trim(),
      description: String(payload.description ?? "").trim(),
      keywords: Array.isArray(payload.keywords)
        ? payload.keywords.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
      canonicalUrl: String(payload.canonicalUrl ?? "").trim() || null,
      openGraphImage: String(payload.openGraphImage ?? "").trim() || null,
      noIndex: Boolean(payload.noIndex),
      structuredData:
        payload.structuredData && typeof payload.structuredData === "object"
          ? (payload.structuredData as any)
          : {},
    },
  });

  return NextResponse.json({ ok: true, setting });
}