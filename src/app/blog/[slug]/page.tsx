import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`)
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image, alt: post.title }]
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="section-padding">
      <div className="container max-w-4xl">
        <Badge variant="secondary">{post.category}</Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-normal sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {post.readTime} - {post.date}
        </p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg border border-border shadow-soft">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
        <div className="mt-10 space-y-6 text-base leading-7 text-muted-foreground">
          <p>
            Good agriculture buying decisions start with timing, product fit, and
            accurate field observation. This guide gives farmers and dealers a
            practical lens for comparing crop inputs before placing an order.
          </p>
          <h2 className="text-2xl font-bold tracking-normal text-foreground">
            Start with the crop stage
          </h2>
          <p>
            Match the product to the crop stage, soil condition, weather pattern,
            and expected pressure from pests, diseases, or nutrient deficiency.
          </p>
          <h2 className="text-2xl font-bold tracking-normal text-foreground">
            Check label, dosage, and compatibility
          </h2>
          <p>
            Always follow label instructions, use recommended protective
            equipment, and confirm tank mix compatibility before application.
          </p>
          <h2 className="text-2xl font-bold tracking-normal text-foreground">
            Keep purchase records
          </h2>
          <p>
            Store invoices, batch numbers, and application notes so repeat orders
            and performance comparisons become easier next season.
          </p>
        </div>
      </div>
    </article>
  );
}
