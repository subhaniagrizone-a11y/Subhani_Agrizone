import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductExplorer } from "@/components/product/product-explorer";
import {
  categories,
  getCategoryBySlug,
  getProductsByCategory
} from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: absoluteUrl(`/categories/${category.slug}`)
    },
    openGraph: {
      title: category.name,
      description: category.description,
      images: [{ url: category.image, alt: category.name }]
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(category.slug);

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-16 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
        <div className="container max-w-4xl">
          <p className="eyebrow">{category.productCount} products</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {category.description}
          </p>
        </div>
      </section>
      <ProductExplorer
        products={categoryProducts}
        categories={categories.map((item) => item.name)}
        initialCategory={category.name}
      />
    </>
  );
}
