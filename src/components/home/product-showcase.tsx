import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { getLiveProducts } from "@/lib/products-server";

export async function ProductShowcase() {
  const products = await getLiveProducts(4);

  return (
    <section className="section-padding bg-muted/45">
      <div className="container space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Featured products</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              High-trust inputs for serious growers
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary transition hover:text-primary/70"
          >
            Open catalog
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
