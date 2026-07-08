import { prisma } from "@/lib/db";
import { blogPosts } from "@/lib/data";

const DEFAULT_HOME_SECTIONS: Record<string, boolean> = {
  home_categories: true,
  home_products: true,
  home_gallery: true,
  home_diseases: true,
  home_testimonials: true,
  home_blog: true,
  home_faq: true,
};

export async function getHomepageSectionVisibility() {
  const visibility = { ...DEFAULT_HOME_SECTIONS };

  try {
    const rows = await prisma.homepageSection.findMany({
      where: {
        key: {
          in: Object.keys(DEFAULT_HOME_SECTIONS),
        },
      },
      select: {
        key: true,
        active: true,
      },
    });

    rows.forEach((row) => {
      visibility[row.key] = row.active;
    });
  } catch {
    return visibility;
  }

  return visibility;
}

export type HomepageBlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
};

export type HomepageGalleryItem = {
  id: string;
  title: string;
  image: string;
};

export type HomepageTestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
};

export type HomepageDiseaseItem = {
  id: string;
  crop: string;
  disease: string;
  symptoms: string;
  action: string;
  image: string;
};

type HomepageManagedContent = {
  blogs: HomepageBlogItem[];
  gallery: HomepageGalleryItem[];
  testimonials: HomepageTestimonialItem[];
  diseases: HomepageDiseaseItem[];
};

function readItems(content: unknown) {
  if (!content || typeof content !== "object")
    return [] as Record<string, unknown>[];
  const items = (content as { items?: unknown }).items;
  return Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getHomepageManagedContent(): Promise<HomepageManagedContent> {
  const fallback: HomepageManagedContent = {
    blogs: blogPosts.slice(0, 3).map((item) => ({
      id: item.slug,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      image: item.image,
      category: item.category,
      readTime: item.readTime,
      date: item.date,
    })),
    gallery: [],
    testimonials: [],
    diseases: [],
  };

  try {
    const [blogRows, testimonialRows, rows] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: [{ published: "desc" }, { updatedAt: "desc" }],
        take: 12,
      }),
      prisma.testimonial.findMany({
        where: { active: true },
        orderBy: { updatedAt: "desc" },
        take: 12,
      }),
      prisma.homepageSection.findMany({
        where: {
          key: {
            in: [
              "home_blog",
              "home_gallery",
              "home_testimonials",
              "home_diseases",
            ],
          },
        },
        select: {
          key: true,
          content: true,
        },
      }),
    ]);

    const dbBlogs = blogRows.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      image:
        item.coverImage ||
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      category: "Blog",
      readTime: "5 min",
      date: item.publishedAt
        ? new Date(item.publishedAt).toLocaleDateString("en-PK")
        : new Date(item.updatedAt).toLocaleDateString("en-PK"),
    }));

    const dbTestimonials = testimonialRows.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role ?? "Customer",
      quote: item.quote,
      rating: item.rating,
      image:
        item.imageUrl ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=subhaniagrizone",
    }));

    const byKey = new Map(rows.map((row) => [row.key, readItems(row.content)]));

    const blogs = dbBlogs.length
      ? dbBlogs
      : (byKey.get("home_blog") ?? [])
          .map((item) => ({
            id: asString(
              item.id,
              asString(item.slug, Math.random().toString(36).slice(2)),
            ),
            title: asString(item.title),
            slug: asString(item.slug),
            excerpt: asString(item.excerpt),
            image: asString(item.image),
            category: asString(item.category, "General"),
            readTime: asString(item.readTime, "5 min"),
            date: asString(item.date, new Date().toLocaleDateString("en-PK")),
          }))
          .filter((item) => item.title && item.slug && item.image);

    const gallery = (byKey.get("home_gallery") ?? [])
      .map((item) => ({
        id: asString(item.id, Math.random().toString(36).slice(2)),
        title: asString(item.title),
        image: asString(item.image),
      }))
      .filter((item) => item.title && item.image);

    const testimonials = dbTestimonials.length
      ? dbTestimonials
      : (byKey.get("home_testimonials") ?? [])
          .map((item) => ({
            id: asString(item.id, Math.random().toString(36).slice(2)),
            name: asString(item.name),
            role: asString(item.role),
            quote: asString(item.quote),
            rating: asNumber(item.rating, 5),
            image: asString(item.image),
          }))
          .filter((item) => item.name && item.quote);

    const diseases = (byKey.get("home_diseases") ?? [])
      .map((item) => ({
        id: asString(item.id, Math.random().toString(36).slice(2)),
        crop: asString(item.crop),
        disease: asString(item.disease),
        symptoms: asString(item.symptoms),
        action: asString(item.action),
        image: asString(item.image),
      }))
      .filter((item) => item.crop && item.disease);

    return {
      blogs: blogs.length ? blogs : fallback.blogs,
      gallery,
      testimonials,
      diseases,
    };
  } catch {
    return fallback;
  }
}
