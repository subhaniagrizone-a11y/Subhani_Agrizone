"use client";

import { useMemo, useState } from "react";
import { Mic, Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    webkitSpeechRecognition?: new () => {
      lang: string;
      start: () => void;
      onresult: (event: { results: { 0: { transcript: string } }[] }) => void;
    };
  };

export function ProductExplorer({
  products,
  categories,
  initialCategory
}: {
  products: Product[];
  categories: string[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "All");
  const [sort, setSort] = useState("featured");
  const [onlyInStock, setOnlyInStock] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return products
      .filter((product) => {
        const matchesQuery =
          !query ||
          [
            product.title,
            product.brand,
            product.category,
            product.subcategory,
            product.sku,
            product.description
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized);
        const matchesCategory = category === "All" || product.category === category;
        const matchesStock = !onlyInStock || product.stock > 0;
        return matchesQuery && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.salePrice - b.salePrice;
        if (sort === "price-high") return b.salePrice - a.salePrice;
        if (sort === "rating") return b.rating - a.rating;
        return b.reviews - a.reviews;
      });
  }, [category, onlyInStock, products, query, sort]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-PK";
    recognition.onresult = (event) => {
      setQuery(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <section className="section-padding">
      <div className="container space-y-8">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Instant search by product, brand, SKU, category..."
                className="pl-9"
                aria-label="Search catalog"
              />
            </div>
            <Button type="button" variant="outline" onClick={startVoiceSearch}>
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
            <Button
              type="button"
              variant={onlyInStock ? "default" : "outline"}
              onClick={() => setOnlyInStock((value) => !value)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              In stock
            </Button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {["All", ...categories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`min-h-9 whitespace-nowrap rounded-md border px-3 text-sm font-semibold transition ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{filtered.length} products</Badge>
            {query && (
              <Button size="sm" variant="ghost" onClick={() => setQuery("")}>
                <X className="h-4 w-4" />
                Clear search
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Built for quick farm purchasing and confident product comparison.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
