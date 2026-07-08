import { blogPosts as fallbackBlogPosts } from "@/lib/data";
import { prisma } from "@/lib/db";

export type LiveBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  content?: string;
  authorName?: string;
  published?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

function fallbackToLive() {
  return fallbackBlogPosts.map((post) => ({
    id: post.slug,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    readTime: post.readTime,
    date: post.date,
  }));
}

export async function getLiveBlogPosts() {
  try {
    const rows = await prisma.blogPost.findMany({
      orderBy: [{ published: "desc" }, { updatedAt: "desc" }],
    });

    if (!rows.length) return fallbackToLive();

    return rows.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      image:
        item.coverImage ||
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      category: item.published ? "Published" : "Draft",
      readTime: "5 min",
      date: item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString("en-PK")
        : new Date(item.updatedAt).toLocaleDateString("en-PK"),
      content: item.content,
      authorName: item.authorName,
      published: item.published,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
    }));
  } catch {
    return fallbackToLive();
  }
}

export async function getLiveBlogPostBySlug(slug: string) {
  try {
    const row = await prisma.blogPost.findUnique({ where: { slug } });
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      image:
        row.coverImage ||
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      category: row.published ? "Published" : "Draft",
      readTime: "5 min",
      date: row.publishedAt
        ? new Date(row.publishedAt).toLocaleDateString("en-PK")
        : new Date(row.updatedAt).toLocaleDateString("en-PK"),
      content: row.content,
      authorName: row.authorName,
      published: row.published,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
    };
  } catch {
    return fallbackBlogPosts.find((item) => item.slug === slug) ?? null;
  }
}
