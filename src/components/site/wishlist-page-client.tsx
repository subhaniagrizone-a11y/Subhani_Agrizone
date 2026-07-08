"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getWishlistIds,
  subscribeToCommerceStore,
  toggleWishlist,
} from "@/lib/commerce-store";
import { fetchProductsByIds } from "@/lib/product-normalize";
import type { Product } from "@/types";

export function WishlistPageClient() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      const ids = getWishlistIds();
      setWishlistIds(ids);
      if (!ids.length) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const rows = await fetchProductsByIds(ids);
      const order = new Map(ids.map((id, index) => [id, index]));
      rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      setProducts(rows);
      setLoading(false);
    };

    sync();
    return subscribeToCommerceStore(() => {
      sync();
    });
  }, []);

  return (
    <section className="section-padding">
      <div className="container space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Saved picks</p>
            <h1 className="mt-2 text-4xl font-bold tracking-normal sm:text-5xl">
              Wishlist
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Aap ne jo products save kiye hain woh yahan show honge. Ek click
              se remove karo ya cart me shift karo.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Browse more products</Link>
          </Button>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            Loading wishlist...
          </div>
        ) : null}

        {!loading && products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Wishlist empty hai</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Products page se heart icon dabayen aur items yahan aa jayenge.
            </p>
            <Button asChild variant="luxury" className="mt-6">
              <Link href="/products">Go to products</Link>
            </Button>
          </div>
        ) : null}

        {products.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group animate-in fade-in duration-500"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4">
              <Button asChild variant="luxury">
                <Link href="/cart">
                  <ShoppingBag className="h-4 w-4" />
                  Open cart
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => wishlistIds.forEach((id) => toggleWishlist(id))}
              >
                Clear wishlist
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
