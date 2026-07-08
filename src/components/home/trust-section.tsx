import Image from "next/image";
import { CheckCircle2, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Verified product data",
    text: "Clear SKU, barcode, safety notes, dosage, specifications, and labels help buyers choose confidently."
  },
  {
    icon: Truck,
    title: "Shipping rules ready",
    text: "Zones, charges, free shipping thresholds, order tracking, and notifications are modeled."
  },
  {
    icon: PackageCheck,
    title: "Inventory clarity",
    text: "Low stock alerts, purchase history, supplier management, and reports are built into the architecture."
  },
  {
    icon: CheckCircle2,
    title: "Customer confidence",
    text: "Wishlists, compare, reviews, rewards, invoices, and saved addresses support repeat buying."
  }
];

export function TrustSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-muted shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85"
            alt="Farmer inspecting crop field"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/20 bg-white/86 p-5 text-slate-950 shadow-soft backdrop-blur-md">
            <p className="text-sm font-semibold text-emerald-800">
              Farmer-first commerce
            </p>
            <p className="mt-1 text-2xl font-bold">Fast answers before checkout</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="eyebrow">Built for trust</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              A premium store that still feels practical in the field
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
