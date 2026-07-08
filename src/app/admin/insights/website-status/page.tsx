import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Gauge, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Website Status Insights",
};

export default async function AdminWebsiteStatusInsightsPage() {
  const [
    ordersCount,
    productsCount,
    customersCount,
    inquiriesCount,
    pendingOrdersCount,
    openInquiriesCount,
    lowStockProductsCount,
    latestInquiry,
  ] = await Promise.all([
    prisma.order.count().catch(() => 0),
    prisma.product.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.inquiry.count().catch(() => 0),
    prisma.order
      .count({ where: { status: { in: ["PENDING", "PROCESSING"] } } })
      .catch(() => 0),
    prisma.inquiry
      .count({ where: { status: { in: ["NEW", "OPEN"] } } })
      .catch(() => 0),
    prisma.product
      .count({ where: { status: "ACTIVE", stock: { lte: 10 } } })
      .catch(() => 0),
    prisma.inquiry
      .findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
      .catch(() => null),
  ]);

  const latestActivity = latestInquiry?.createdAt
    ? new Date(latestInquiry.createdAt)
    : null;

  const checks = [
    {
      label: "Pending orders",
      value: pendingOrdersCount,
      ok: pendingOrdersCount <= 25,
      threshold: "<= 25",
    },
    {
      label: "Open inquiries",
      value: openInquiriesCount,
      ok: openInquiriesCount <= 25,
      threshold: "<= 25",
    },
    {
      label: "Low stock products",
      value: lowStockProductsCount,
      ok: lowStockProductsCount <= 10,
      threshold: "<= 10",
    },
  ];

  const unhealthy = checks.filter((item) => !item.ok).length;
  const state =
    unhealthy === 0 ? "Stable" : unhealthy === 1 ? "Needs review" : "Attention";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Insights</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              Website Status Details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Operational health checks with live threshold-based signals.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </p>
            <p className="mt-2 text-3xl font-bold">{state}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Orders
            </p>
            <p className="mt-2 text-3xl font-bold">{ordersCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inquiries
            </p>
            <p className="mt-2 text-3xl font-bold">{inquiriesCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Latest activity
            </p>
            <p className="mt-2 text-3xl font-bold">
              {latestActivity
                ? latestActivity.toLocaleTimeString("en-PK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-normal">Health Checks</h2>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            {checks.map((check) => (
              <div
                key={check.label}
                className="flex items-center justify-between rounded-md bg-muted p-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{check.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Threshold {check.threshold}
                  </p>
                </div>
                <Badge variant={check.ok ? "secondary" : "gold"}>
                  {check.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-normal">Core Counters</h2>
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Products
              </p>
              <p className="mt-2 text-2xl font-bold">{productsCount}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Customers
              </p>
              <p className="mt-2 text-2xl font-bold">{customersCount}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Pending orders
              </p>
              <p className="mt-2 text-2xl font-bold">{pendingOrdersCount}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Open inquiries
              </p>
              <p className="mt-2 text-2xl font-bold">{openInquiriesCount}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
