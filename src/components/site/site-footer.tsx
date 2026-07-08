import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, navigation, siteConfig } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-slate-950 text-white">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xl font-bold">{siteConfig.name}</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
              {siteConfig.description}
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/75">
            <a
              className="flex items-center gap-2"
              href={`tel:${siteConfig.contact.phone}`}
            >
              <Phone className="h-4 w-4 text-lime-300" />
              {siteConfig.contact.phone}
            </a>
            <a
              className="flex items-center gap-2"
              href={`tel:${siteConfig.contact.phone2}`}
            >
              <Phone className="h-4 w-4 text-lime-300" />
              {siteConfig.contact.phone2}
            </a>
            <a
              className="flex items-center gap-2"
              href={`mailto:${siteConfig.contact.email}`}
            >
              <Mail className="h-4 w-4 text-lime-300" />
              {siteConfig.contact.email}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-lime-300" />
              <a
                href={siteConfig.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-lime-200"
              >
                {siteConfig.contact.address}
              </a>
            </span>
            <span className="text-xs text-white/60">
              {siteConfig.contact.workingHours}
            </span>
          </div>
          <div className="flex gap-2">
            <Button asChild size="icon" variant="outline">
              <a href={siteConfig.socials.facebook} aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="icon" variant="outline">
              <a href={siteConfig.socials.instagram} aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="icon" variant="outline">
              <a href={siteConfig.socials.youtube} aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-white/75">
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-lime-200"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.socials.tiktok}
              target="_blank"
              rel="noreferrer"
              className="hover:text-lime-200"
            >
              TikTok
            </a>
            <a
              href={siteConfig.socials.x}
              target="_blank"
              rel="noreferrer"
              className="hover:text-lime-200"
            >
              X (Twitter)
            </a>
          </div>
        </div>

        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            {categories.slice(0, 8).map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold">Company</p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/shipping-policy">Shipping Policy</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/dashboard">Customer Dashboard</Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-lime-300" />
            <div>
              <p className="font-semibold">Verified supply chain</p>
              <p className="mt-1 text-sm leading-6 text-white/65">
                Verified specifications, dosage notes, safety guidance, and
                product labels help every buyer move with confidence.
              </p>
            </div>
          </div>
          <form className="flex gap-2" action="/api/inquiries" method="post">
            <Input
              name="email"
              type="email"
              placeholder="Email for offers"
              className="border-white/15 bg-white/10 text-white placeholder:text-white/45"
              aria-label="Newsletter email"
            />
            <input type="hidden" name="type" value="NEWSLETTER" />
            <input type="hidden" name="name" value="Newsletter subscriber" />
            <input type="hidden" name="message" value="Newsletter signup" />
            <Button
              type="submit"
              variant="luxury"
              size="icon"
              aria-label="Subscribe"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 Subhani Agrizone. All rights reserved.</p>
          <p>
            Stripe, PayPal, COD, bank transfer, JazzCash, and EasyPaisa ready.
          </p>
        </div>
      </div>
    </footer>
  );
}
