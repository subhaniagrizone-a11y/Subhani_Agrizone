import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { categories } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import { getLiveProducts } from "@/lib/products-server";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse agriculture product categories: seeds, fertilizers, pesticides, herbicides, fungicides, micronutrients, equipment, and more.",
  alternates: {
    canonical: absoluteUrl("/categories"),
  },
};

export default async function CategoriesPage() {
  const products = await getLiveProducts();

  // Count products per category
  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.name).length,
  }));

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
        <div className="container max-w-4xl">
          <p className="eyebrow">Browse</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            Shop by agriculture category
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Find seeds, fertilizers, crop protection, equipment, and growing
            solutions organized by crop need and product type.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCounts.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-lg border border-border bg-background/50 transition-all hover:border-emerald-400 hover:shadow-lg dark:hover:border-emerald-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
                </div>

                <div className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white">
                        {category.name}
                      </h2>
                      <p className="mt-2 text-sm text-gray-200">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                      {category.count} product{category.count !== 1 ? "s" : ""}
                    </span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
