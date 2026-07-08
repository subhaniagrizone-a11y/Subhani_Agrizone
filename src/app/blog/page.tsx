import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getLiveBlogPosts } from "@/lib/blogs-server";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Agriculture Blog",
  description:
    "Agriculture buying guides, crop nutrition notes, field safety articles, and seasonal farming advice.",
  alternates: {
    canonical: absoluteUrl("/blog"),
  },
};

export default async function BlogPage() {
  const blogPosts = await getLiveBlogPosts();

  return (
    <section className="section-padding">
      <div className="container space-y-10">
        <div className="max-w-3xl">
          <p className="eyebrow">Field notes</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            Practical agriculture guides for better buying decisions
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Seasonal crop advice, product education, safety habits, and farm
            management insights.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative h-56">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-5">
                <Badge variant="secondary">{post.category}</Badge>
                <h2 className="text-xl font-bold tracking-normal">
                  {post.title}
                </h2>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {post.readTime} - {post.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
