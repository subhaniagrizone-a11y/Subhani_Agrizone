"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  clearCart,
  getCart,
  removeFromCart,
  setCartQuantity,
  subscribeToCommerceStore,
} from "@/lib/commerce-store";
import { fetchProductsByIds } from "@/lib/product-normalize";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      const currentCart = getCart();
      setCart(currentCart);
      const ids = Object.keys(currentCart).filter((id) => currentCart[id] > 0);
      if (!ids.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const rows = await fetchProductsByIds(ids);
      setProducts(rows);
      setLoading(false);
    };

    sync();
    return subscribeToCommerceStore(() => {
      sync();
    });
  }, []);

  const subtotal = useMemo(
    () =>
      products.reduce((sum, product) => {
        const qty = cart[product.id] ?? 0;
        return sum + (product.salePrice || product.price) * qty;
      }, 0),
    [cart, products],
  );

  const shipping = subtotal > 0 && subtotal < 5000 ? 250 : 0;
  const grandTotal = subtotal + shipping;

  return (
    <section className="section-padding">
      <div className="container space-y-7">
        <div>
          <p className="eyebrow">Basket</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal sm:text-5xl">
            Shopping cart
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Quantity adjust karen, total dekhen, aur checkout proceed karen.
          </p>
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            Loading cart...
          </div>
        ) : null}

        {!loading && products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Cart empty hai</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Product detail se Add to cart dabayen aur items yahan aa jayenge.
            </p>
            <Button asChild variant="luxury" className="mt-6">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
            <div className="space-y-4">
              {products.map((product, index) => {
                const quantity = cart[product.id] ?? 1;
                const lineTotal =
                  (product.salePrice || product.price) * quantity;

                return (
                  <article
                    key={product.id}
                    className="grid gap-4 rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-soft sm:grid-cols-[120px_1fr_auto]"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="line-clamp-2 font-semibold hover:text-primary"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(product.salePrice || product.price)}{" "}
                        each
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setCartQuantity(product.id, quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setCartQuantity(product.id, quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-right text-lg font-bold">
                      {formatCurrency(lineTotal)}
                    </p>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-5">
              <h2 className="text-xl font-bold">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{shipping ? formatCurrency(shipping) : "Free"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              <Button asChild variant="luxury" className="mt-5 w-full">
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => clearCart()}
              >
                Clear cart
              </Button>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
