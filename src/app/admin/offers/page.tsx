import type { Metadata } from "next";
import { Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const offers = [
  { title: "Kharif Season Deal", code: "KHARIF20", discount: "20%", status: "ACTIVE" },
  { title: "Dealer Bulk Bonus", code: "DEALER15", discount: "15%", status: "SCHEDULED" },
  { title: "Micronutrient Pack", code: "MICRO10", discount: "10%", status: "ACTIVE" },
];

export const metadata: Metadata = {
  title: "Offers",
};

export default function AdminOffersPage() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">Offers & Coupons</h1>
        <Megaphone className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 grid gap-3">
        {offers.map((offer) => (
          <div key={offer.code} className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{offer.title}</p>
              <Badge>{offer.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Code: {offer.code}</p>
            <p className="mt-1 text-sm text-primary">Discount: {offer.discount}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
