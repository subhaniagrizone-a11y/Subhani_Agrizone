import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/data";
import { absoluteUrl, normalizePkPhone, toWhatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Subhani Agrizone for dealer registration, farmer registration, bulk inquiry, quotation request, or support.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

const inquiryTypes = [
  ["CONTACT", "Contact"],
  ["DEALER_REGISTRATION", "Dealer registration"],
  ["FARMER_REGISTRATION", "Farmer registration"],
  ["BULK_INQUIRY", "Bulk inquiry"],
  ["QUOTATION_REQUEST", "Quotation request"],
  ["SUPPORT_TICKET", "Support ticket"],
];

export default function ContactPage() {
  return (
    <section className="section-padding">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-8">
          <div>
            <p className="eyebrow">Support</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Talk to Subhani Agrizone
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Get crop input support, dealer pricing, bulk quotations, and order
              assistance from one place.
            </p>
          </div>

          <div className="grid gap-3">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <Phone className="h-5 w-5 text-primary" />
              <span>{siteConfig.contact.phone}</span>
            </a>
            <a
              href={`tel:${siteConfig.contact.phone2}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <Phone className="h-5 w-5 text-primary" />
              <span>{siteConfig.contact.phone2}</span>
            </a>
            <a
              href={toWhatsappLink(siteConfig.contact.whatsapp)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>{normalizePkPhone(siteConfig.contact.whatsapp)}</span>
            </a>
            <a
              href={toWhatsappLink(siteConfig.contact.whatsapp2)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>{normalizePkPhone(siteConfig.contact.whatsapp2)}</span>
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <Mail className="h-5 w-5 text-primary" />
              <span>{siteConfig.contact.email}</span>
            </a>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <a
                href={siteConfig.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {siteConfig.contact.address}
              </a>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Working Hours</p>
              <p className="mt-1">{siteConfig.contact.workingHours}</p>
            </div>
          </div>
        </div>

        <form
          action="/api/inquiries"
          method="post"
          className="rounded-lg border border-border bg-card p-6 shadow-soft"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Name
              <Input name="name" required placeholder="Full name" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Phone
              <Input name="phone" required placeholder="+92..." />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <Input name="email" type="email" placeholder="you@example.com" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Company or farm
              <Input name="company" placeholder="Optional" />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Inquiry type
              <select
                name="type"
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                {inquiryTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Subject
              <Input
                name="subject"
                placeholder="Product, crop, quotation, order..."
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
              Message
              <textarea
                name="message"
                required
                rows={7}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tell us what you need."
              />
            </label>
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            variant="luxury"
            type="submit"
          >
            Send inquiry
          </Button>
        </form>
      </div>
    </section>
  );
}
