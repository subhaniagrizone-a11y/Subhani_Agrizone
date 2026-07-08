import type { Metadata } from "next";

import { ProductExplorer } from "@/components/product/product-explorer";
import { getLiveProducts } from "@/lib/products-server";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Products",
  description:
    "Shop seeds, fertilizers, pesticides, herbicides, fungicides, micronutrients, equipment, sprayers, organic products, and animal feed.",
  alternates: {
    canonical: absoluteUrl("/products"),
  },
};

export default async function ProductsPage() {
  const products = await getLiveProducts();
  const categoryNames = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  );

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-16 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
        <div className="container max-w-4xl">
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            Agriculture products with the details buyers actually need
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Compare trusted product information, pricing tiers, stock, safety
            instructions, dosage, benefits, and downloadable labels.
          </p>
        </div>
      </section>
      <ProductExplorer products={products} categories={categoryNames} />
    </>
  );
}
