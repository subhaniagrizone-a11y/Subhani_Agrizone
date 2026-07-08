import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let candidate = base || `blog-${Date.now()}`;

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base || "blog"}-${attempt + 1}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${base || "blog"}-${Date.now()}`;
}

export async function GET() {
  const blocked = await requireApiPermission("cms:read");
  if (blocked) return blocked;

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const excerpt = String(payload.excerpt ?? "").trim();
  const content = String(payload.content ?? "").trim();
  const authorName = String(payload.authorName ?? "").trim();
  const slug = await ensureUniqueSlug(slugify(String(payload.slug ?? title)));

  if (!title || !excerpt || !content || !authorName) {
    return NextResponse.json(
      { error: "Missing required blog fields" },
      { status: 422 },
    );
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: String(payload.coverImage ?? "").trim() || null,
      authorName,
      published: Boolean(payload.published),
      publishedAt: payload.published ? new Date() : null,
      metaTitle: String(payload.metaTitle ?? "").trim() || null,
      metaDescription: String(payload.metaDescription ?? "").trim() || null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const id = String(payload.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  const title =
    payload.title !== undefined
      ? String(payload.title ?? "").trim()
      : existing.title;
  const excerpt =
    payload.excerpt !== undefined
      ? String(payload.excerpt ?? "").trim()
      : existing.excerpt;
  const content =
    payload.content !== undefined
      ? String(payload.content ?? "").trim()
      : existing.content;
  const authorName =
    payload.authorName !== undefined
      ? String(payload.authorName ?? "").trim()
      : existing.authorName;
  const nextSlug =
    payload.slug !== undefined
      ? await ensureUniqueSlug(slugify(String(payload.slug ?? title)), id)
      : existing.slug;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug: nextSlug,
      excerpt,
      content,
      coverImage:
        payload.coverImage !== undefined
          ? String(payload.coverImage ?? "").trim() || null
          : existing.coverImage,
      authorName,
      published:
        payload.published !== undefined
          ? Boolean(payload.published)
          : existing.published,
      publishedAt:
        payload.published !== undefined
          ? Boolean(payload.published)
            ? new Date()
            : null
          : existing.publishedAt,
      metaTitle:
        payload.metaTitle !== undefined
          ? String(payload.metaTitle ?? "").trim() || null
          : existing.metaTitle,
      metaDescription:
        payload.metaDescription !== undefined
          ? String(payload.metaDescription ?? "").trim() || null
          : existing.metaDescription,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(request: NextRequest) {
  const blocked = await requireApiPermission("cms:write");
  if (blocked) return blocked;

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
