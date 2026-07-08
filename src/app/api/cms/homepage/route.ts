import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { cmsSections, heroSlides } from "@/lib/data";
import { prisma } from "@/lib/db";
import { homepageSectionSchema } from "@/lib/validators";

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({
      sections: cmsSections,
      heroSlides,
      source: "fallback",
    });
  }
}

export async function PUT(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const parsed = homepageSectionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid homepage section", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const section = await prisma.homepageSection.upsert({
    where: { key: parsed.data.key },
    update: {
      title: parsed.data.title,
      content: parsed.data.content as any,
      active: parsed.data.active,
      sortOrder: parsed.data.sortOrder,
    },
    create: {
      key: parsed.data.key,
      title: parsed.data.title,
      content: parsed.data.content as any,
      active: parsed.data.active,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return NextResponse.json({ section });
}

export async function DELETE(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!key) {
    return NextResponse.json({ error: "Section key is required" }, { status: 422 });
  }

  await prisma.homepageSection.deleteMany({
    where: { key },
  });

  return NextResponse.json({ ok: true });
}
