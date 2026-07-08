"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Heart,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import {
  addToCart,
  getCompareIds,
  getWishlistIds,
  subscribeToCommerceStore,
  toggleCompare,
  toggleWishlist,
} from "@/lib/commerce-store";
import type { Product } from "@/types";
import { formatCurrency, toWhatsappLink } from "@/lib/utils";

function cleanHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "");
}

function extractActiveIngredients(product: Product) {
  const specifications = (
    product as unknown as { specifications?: Record<string, unknown> }
  ).specifications;

  const raw =
    specifications?.activeIngredients ??
    specifications?.activeingredients ??
    specifications?.active_ingredients ??
    specifications?.["active ingredients"];

  if (!Array.isArray(raw)) return [] as { name: string; percentage: string }[];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as {
        name?: string;
        ingredient?: string;
        title?: string;
        percentage?: string;
        percent?: string;
        value?: string;
        amount?: string;
      };

      const name = String(row.name ?? row.ingredient ?? row.title ?? "").trim();
      const percentage = String(
        row.percentage ?? row.percent ?? row.value ?? row.amount ?? "",
      ).trim();

      if (!name && !percentage) return null;
      return { name, percentage };
    })
    .filter((item): item is { name: string; percentage: string } =>
      Boolean(item),
    );
}

function extractAboutProduct(product: Product) {
  const specs = (
    product as unknown as { specifications?: Record<string, unknown> }
  ).specifications;

  const about =
    specs?.aboutProduct ??
    specs?.about ??
    specs?.about_product ??
    specs?.aboutThisProduct;

  return typeof about === "string" ? about : "";
}

function extractFaqs(product: Product) {
  const specs = (
    product as unknown as { specifications?: Record<string, unknown> }
  ).specifications;

  const raw = specs?.faqs ?? specs?.faq ?? specs?.faqItems;
  if (!Array.isArray(raw)) return [] as { question: string; answer: string }[];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as {
        question?: string;
        q?: string;
        title?: string;
        answer?: string;
        a?: string;
        body?: string;
      };

      const question = String(row.question ?? row.q ?? row.title ?? "").trim();
      const answer = String(row.answer ?? row.a ?? row.body ?? "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item),
    );
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const activeIngredients = extractActiveIngredients(product);
  const aboutProduct = extractAboutProduct(product);
  const faqs = extractFaqs(product);
  const visibleSpecifications = Object.entries(product.specifications).filter(
    ([key, value]) => {
      const normalizedKey = key.toLowerCase().replace(/[\s_-]/g, "");
      if (
        [
          "activeingredients",
          "aboutproduct",
          "about",
          "aboutthisproduct",
          "faqs",
          "faq",
          "faqitems",
        ].includes(normalizedKey)
      ) {
        return false;
      }
      if (Array.isArray(value)) return false;
      return value === null || typeof value !== "object";
    },
  );
  const [image, setImage] = useState(product.images[0]);
  const [liked, setLiked] = useState(false);
  const [compared, setCompared] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLiked(getWishlistIds().includes(product.id));
      setCompared(getCompareIds().includes(product.id));
    };

    sync();
    return subscribeToCommerceStore(sync);
  }, [product.id]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="section-padding">
      <div className="container space-y-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted shadow-soft">
              <Image
                src={image}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <Badge className="absolute left-4 top-4">{product.badge}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setImage(item)}
                  className={`relative aspect-square overflow-hidden rounded-md border ${
                    item === image ? "border-primary" : "border-border"
                  }`}
                  aria-label="Select product image"
                >
                  <Image
                    src={item}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-7">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.brand}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal sm:text-5xl">
                  {product.title}
                </h1>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {product.shortDescription}
                </p>
              </div>
              <div className="grid gap-2 rounded-lg border border-border bg-card p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    {formatCurrency(product.salePrice)}
                  </span>
                  <span className="text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <span>
                    Wholesale {formatCurrency(product.wholesalePrice)}
                  </span>
                  <span>Dealer {formatCurrency(product.dealerPrice)}</span>
                  <span>Farmer {formatCurrency(product.farmerPrice)}</span>
                </div>
              </div>

              {activeIngredients.length > 0 ? (
                <div className="rounded-lg border border-emerald-300/60 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
                    Active Ingredients
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    {activeIngredients
                      .map((item) =>
                        item.percentage
                          ? `${item.name} ${item.percentage}`.trim()
                          : item.name,
                      )
                      .join(" + ")}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  SKU
                </p>
                <p className="mt-1 font-semibold">{product.sku}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Barcode
                </p>
                <p className="mt-1 font-semibold">{product.barcode}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Stock
                </p>
                <p className="mt-1 font-semibold">{product.stock} units</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Subcategory
                </p>
                <p className="mt-1 font-semibold">{product.subcategory}</p>
              </div>
            </div>

            <div className="space-y-3">
              {product.variants.map((variant) => (
                <div key={variant.name}>
                  <p className="text-sm font-semibold">{variant.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variant.values.map((value, index) => (
                      <button
                        key={value}
                        type="button"
                        className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                          index === 0
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-accent"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="luxury"
                size="lg"
                onClick={() => {
                  addToCart(product.id, 1);
                  setCartAdded(true);
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartAdded ? "Added to cart" : "Add to cart"}
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/contact?product=${product.slug}`}>Inquiry</Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={toWhatsappLink(
                    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "03007172382",
                    `I want to ask about ${product.title}`,
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "03007172382"}`}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => setLiked(toggleWishlist(product.id))}
              >
                <Heart className="h-4 w-4" />
                {liked ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCompared(toggleCompare(product.id))}
              >
                <BarChart3 className="h-4 w-4" />
                {compared ? "Compared" : "Compare"}
              </Button>
              <Button variant="ghost" onClick={share}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold tracking-normal">
              Product details
            </h2>
            <div
              className="prose prose-sm mt-4 max-w-none leading-7 text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: cleanHtml(product.description),
              }}
            />

            {aboutProduct ? (
              <div className="mt-8">
                <h3 className="relative inline-block text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem]">
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-primary/80 via-emerald-400/70 to-transparent" />
                  <span className="relative">About this product</span>
                </h3>
                <div
                  className="prose prose-sm mt-4 max-w-none leading-7 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(aboutProduct),
                  }}
                />
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Usage</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.usage}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Dosage</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.dosage}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Benefits</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  {product.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Safety instructions</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  {product.safetyInstructions.map((instruction) => (
                    <li key={instruction} className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {faqs.length > 0 ? (
              <div className="mt-8 space-y-3">
                <h3 className="relative inline-block text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem]">
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-primary/80 via-emerald-400/70 to-transparent" />
                  <span className="relative">Frequently Asked Questions</span>
                </h3>
                {faqs.map((item, index) => (
                  <details
                    key={`${item.question}-${index}`}
                    className="rounded-md border border-border bg-background p-4"
                  >
                    <summary className="cursor-pointer list-none font-medium">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold tracking-normal">
                Specifications
              </h2>
              <dl className="mt-4 grid gap-3">
                {visibleSpecifications.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-semibold text-right">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-bold tracking-normal">Downloads</h2>
              <div className="mt-4 grid gap-2">
                {product.downloads.map((download) => (
                  <Button
                    key={download.href}
                    asChild
                    variant="outline"
                    className="justify-start"
                  >
                    <a href={download.href}>
                      <Download className="h-4 w-4" />
                      {download.label}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {relatedProducts.length > 0 && (
          <section className="space-y-6">
            <div>
              <p className="eyebrow">Related products</p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal">
                Frequently bought together
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
