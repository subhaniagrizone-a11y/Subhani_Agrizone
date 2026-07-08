"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, Heart, MessageCircle, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  getCompareIds,
  getWishlistIds,
  subscribeToCommerceStore,
  toggleCompare,
  toggleWishlist,
} from "@/lib/commerce-store";
import type { Product } from "@/types";
import {
  formatCurrency,
  getDiscountPercent,
  toWhatsappLink,
} from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = getDiscountPercent(product.price, product.salePrice);

  useEffect(() => {
    const sync = () => {
      setLiked(getWishlistIds().includes(product.id));
      setCompared(getCompareIds().includes(product.id));
    };

    sync();
    return subscribeToCommerceStore(sync);
  }, [product.id]);

  const share = async () => {
    const url = `${window.location.origin}/products/${product.slug}`;
    if (navigator.share) {
      await navigator.share({ title: product.title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <article className="group grid h-full overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-soft">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={product.badge === "Organic" ? "gold" : "default"}>
            {product.badge}
          </Badge>
          {discount > 0 && <Badge variant="dark">{discount}% off</Badge>}
        </div>
      </Link>

      <div className="grid gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{product.brand}</span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {product.rating} ({product.reviews})
            </span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-[2.8rem] font-semibold leading-snug transition hover:text-primary"
          >
            {product.title}
          </Link>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="grid gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {formatCurrency(product.salePrice)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Dealer {formatCurrency(product.dealerPrice)}</span>
            <span>Farmer {formatCurrency(product.farmerPrice)}</span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
          <Button
            variant="luxury"
            size="lg"
            className="min-w-0 text-base font-bold shadow-soft hover:shadow-glow"
            onClick={() => {
              addToCart(product.id, 1);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1200);
            }}
          >
            {added ? "Added" : "Add to cart"}
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Add to wishlist"
            title="Wishlist"
            onClick={() => setLiked(toggleWishlist(product.id))}
          >
            <Heart
              className={
                liked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"
              }
            />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Compare"
            title="Compare"
            onClick={() => setCompared(toggleCompare(product.id))}
          >
            <BarChart3
              className={compared ? "h-4 w-4 text-primary" : "h-4 w-4"}
            />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Share"
            title="Share"
            onClick={share}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <Button asChild variant="outline" className="w-full">
          <a
            href={toWhatsappLink(
              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "03007172382",
              `I want to ask about ${product.title}`,
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp inquiry
          </a>
        </Button>
      </div>
    </article>
  );
}
