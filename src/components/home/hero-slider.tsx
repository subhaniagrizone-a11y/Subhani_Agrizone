"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { heroSlides, homepageStats } from "@/lib/data";

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: 1 | -1) => {
    setActive((current) => {
      const next = current + direction;
      if (next < 0) return heroSlides.length - 1;
      return next % heroSlides.length;
    });
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.div
            key={slide.title}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.7)_42%,rgba(2,6,23,0.28)_100%)]" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="container relative grid min-h-[720px] items-center py-20 lg:min-h-[760px]">
        <div className="max-w-3xl space-y-8">
          <Badge className="border border-white/15 bg-white/10 text-lime-100">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            {slide.eyebrow}
          </Badge>
          <AnimatePresence>
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55 }}
              className="space-y-6"
            >
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-normal sm:text-5xl lg:text-7xl">
                {slide.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/76 sm:text-lg">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="luxury">
              <Link href={slide.href}>
                Shop products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Get quotation</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {homepageStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur-md"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-white/65">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-7 right-4 flex gap-2 sm:right-8">
          <Button
            size="icon"
            variant="outline"
            aria-label="Previous slide"
            onClick={() => move(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Next slide"
            onClick={() => move(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
