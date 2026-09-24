import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  Leaf,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Subhani Agrizone — our mission, values, and how we support farmers across Pakistan with quality agriculture products.",
};

const stats = [
  { label: "Years of Experience", value: "10+" },
  { label: "Products Available", value: "500+" },
  { label: "Happy Farmers", value: "5,000+" },
  { label: "Districts Served", value: "30+" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description:
      "Every product we sell is sourced from certified manufacturers and verified for efficacy before reaching the farmer.",
  },
  {
    icon: TrendingUp,
    title: "Farmer-First Pricing",
    description:
      "Transparent retail, wholesale, dealer, and farmer pricing so every buyer gets the right rate for their purchase volume.",
  },
  {
    icon: Leaf,
    title: "Crop-Wise Guidance",
    description:
      "Our team provides practical advice on dosage, application timing, and crop compatibility for every product we offer.",
  },
  {
    icon: Users,
    title: "Trusted by Dealers",
    description:
      "Hundreds of dealers across Punjab, Sindh, and KPK rely on Subhani Agrizone for consistent stock and competitive margins.",
  },
  {
    icon: Award,
    title: "Certified Products",
    description:
      "All crop protection, fertilizer, and seed products carry official certifications from relevant agricultural authorities.",
  },
  {
    icon: Sprout,
    title: "Sustainable Farming",
    description:
      "We actively promote responsible use of crop inputs to protect soil health, water quality, and long-term farm productivity.",
  },
];

const offers = [
  "Hybrid and certified seeds for all major crops",
  "Granular, liquid, and specialty fertilizers",
  "Pesticides, herbicides, and fungicides with safety guidance",
  "Micronutrients and growth promoters",
  "Agriculture equipment and sprayers",
  "Organic and bio-control products",
  "Animal feed and livestock supplements",
  "Seasonal bundles and dosage consultation",
];

export default function AboutUsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-20 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
        <div className="container max-w-4xl">
          <p className="eyebrow">About Subhani Agrizone</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-6xl">
            Trusted partner for smarter farming
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Subhani Agrizone is a leading agriculture supply company based in
            Pakistan, dedicated to helping farmers, dealers, and nurseries grow
            better crops with certified inputs, expert guidance, and fair
            pricing. We are committed to making professional agriculture
            accessible at every level.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="luxury" size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-emerald-700 py-12 text-white">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-emerald-200">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding border-b border-border">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Built from the ground up for Pakistani farmers
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Subhani Agrizone was founded with a single goal: to bridge the gap
              between quality agriculture inputs and the farmers who need them
              most. Starting from a small storefront in Gujranwala, we have
              grown into a trusted supplier serving thousands of farmers,
              dealers, and agri-businesses across Pakistan.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Our founder, Sikandar Subhani, spent years working closely with
              farmers to understand their real challenges — inconsistent product
              quality, lack of dosage guidance, and unfair pricing. That
              experience shaped everything about how Subhani Agrizone operates
              today.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Today we carry 500+ products across seeds, fertilizers, crop
              protection, equipment, and organic inputs — all backed by
              transparent pricing tiers for retail, wholesale, dealer, and
              farmer buyers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {offers.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding border-b border-border bg-muted/30">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">Our Values</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Why farmers choose Subhani Agrizone
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-lg border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950">
                    <Icon className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding">
        <div className="container max-w-3xl text-center">
          <p className="eyebrow">Get in Touch</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
            Talk to our agriculture experts
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Whether you need product advice, bulk pricing, or dealer
            registration — our team is available on call, WhatsApp, and email.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="luxury" size="lg">
              <a href={`tel:${siteConfig.contact.phone}`}>
                <Phone className="h-4 w-4" />
                {siteConfig.contact.phone}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}?text=Hello, I want to know more about Subhani Agrizone`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp us
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Send Inquiry</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {siteConfig.contact.workingHours}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {siteConfig.contact.address}
          </p>
        </div>
      </section>
    </main>
  );
}
