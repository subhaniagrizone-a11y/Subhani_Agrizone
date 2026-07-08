"use client";

import Link from "next/link";
import { Clock3, Flame } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

function getRemaining() {
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const diff = Math.max(0, tomorrow.getTime() - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { hours, minutes, seconds };
}

export function FlashSale() {
  const [remaining, setRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const saleProducts = products.slice(1, 4);

  useEffect(() => {
    setRemaining(getRemaining());
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="bg-slate-950 py-12 text-white">
      <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="space-y-5">
          <Badge className="bg-white/10 text-lime-100">
            <Flame className="mr-1 h-3.5 w-3.5" />
            Flash sale
          </Badge>
          <div>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
              Seasonal deals before midnight
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Limited seasonal pricing on high-demand farm inputs, curated for
              fast restocking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              ["Hours", remaining.hours],
              ["Minutes", remaining.minutes],
              ["Seconds", remaining.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-20 rounded-lg border border-white/10 bg-white/10 p-3 text-center"
              >
                <p className="text-2xl font-bold tabular-nums">
                  {String(value).padStart(2, "0")}
                </p>
                <p className="text-xs text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {saleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="rounded-lg border border-white/10 bg-white/8 p-4 transition hover:-translate-y-1 hover:bg-white/12"
            >
              <Clock3 className="h-5 w-5 text-lime-300" />
              <p className="mt-4 line-clamp-2 min-h-[2.5rem] font-semibold">
                {product.title}
              </p>
              <p className="mt-3 text-sm text-white/55 line-through">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xl font-bold text-lime-200">
                {formatCurrency(product.salePrice)}
              </p>
            </Link>
          ))}
        </div>

        <Button asChild variant="luxury" className="w-fit lg:col-start-1">
          <Link href="/products?offer=flash-sale">Shop sale</Link>
        </Button>
      </div>
    </section>
  );
}
