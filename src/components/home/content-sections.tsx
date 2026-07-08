import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/data";
import { getHomepageManagedContent } from "@/lib/homepage-sections";

export async function ContentSections() {
  const managed = await getHomepageManagedContent();
  const posts = managed.blogs.length
    ? managed.blogs
    : blogPosts.slice(0, 3).map((post) => ({
        id: post.slug,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        image: post.image,
        category: post.category,
        readTime: post.readTime,
        date: post.date,
      }));

  return (
    <section className="section-padding bg-muted/45">
      <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">Blog</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
            Latest farming guides and crop insights
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Practical posts to help farmers with timing, nutrition, spray
            safety, and better purchasing decisions.
          </p>
          <Button asChild className="mt-6" variant="luxury">
            <Link href="/blog">
              Visit full blog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative h-40">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <Badge variant="secondary">{post.category}</Badge>
                <h3 className="mt-3 line-clamp-2 min-h-[3rem] font-semibold leading-6">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
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
