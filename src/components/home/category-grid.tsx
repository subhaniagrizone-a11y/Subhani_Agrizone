import Image from "next/image";
import Link from "next/link";
import {
  Atom,
  BadgeCheck,
  FlaskConical,
  Flower2,
  Leaf,
  Recycle,
  ShieldCheck,
  SprayCan,
  Sprout,
  Tractor,
  TrendingUp,
  Wheat,
  type LucideIcon
} from "lucide-react";

import { categories } from "@/lib/data";

const icons: Record<string, LucideIcon> = {
  Atom,
  BadgeCheck,
  FlaskConical,
  Flower2,
  Leaf,
  Recycle,
  ShieldCheck,
  SprayCan,
  Sprout,
  Tractor,
  TrendingUp,
  Wheat
};

export function CategoryGrid() {
  return (
    <section className="section-padding bg-background">
      <div className="container space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Complete agriculture range</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Shop by crop need, not by confusion
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary transition hover:text-primary/70"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = icons[category.icon] ?? Sprout;
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative h-40 overflow-hidden bg-muted">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-62 mix-blend-multiply`}
                  />
                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-md bg-white/92 text-primary shadow-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{category.name}</h3>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {category.productCount}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
