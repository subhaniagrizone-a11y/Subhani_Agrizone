import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BellRing,
  Boxes,
  FileText,
  Gauge,
  LineChart,
  PlusCircle,
  SearchCheck,
  Sparkles,
  Truck,
  ArrowRight,
} from "lucide-react";

import { MetricCard } from "@/components/admin/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminActivityFeed,
  adminDashboardStats,
  adminHealthChecks,
  adminOverviewLinks,
  adminTrafficSeries,
} from "@/lib/admin-config";
import { recentOrders } from "@/lib/data";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  const [
    ordersCount,
    productsCount,
    customersCount,
    inquiriesCount,
    recentInquiries,
  ] = await Promise.all([
    prisma.order.count().catch(() => 0),
    prisma.product.count().catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.inquiry.count().catch(() => 0),
    prisma.inquiry
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { name: true, subject: true, type: true, createdAt: true },
      })
      .catch(() => []),
  ]);

  const trafficSeed = await prisma.order
    .findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    })
    .catch(() => []);

  const dailyBuckets = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    return { day: day.toDateString(), count: 0 };
  });

  for (const row of trafficSeed) {
    const key = new Date(row.createdAt).toDateString();
    const bucket = dailyBuckets.find((entry) => entry.day === key);
    if (bucket) bucket.count += 1;
  }

  const maxTraffic = Math.max(1, ...dailyBuckets.map((item) => item.count));
  const liveTrafficSeries = dailyBuckets.map((item) =>
    Math.max(12, Math.round((item.count / maxTraffic) * 100)),
  );

  const dashboardStats = adminDashboardStats.map((item) => {
    if (item.label.toLowerCase().includes("order")) {
      return { ...item, value: String(ordersCount) };
    }
    if (item.label.toLowerCase().includes("customer")) {
      return { ...item, value: String(customersCount) };
    }
    if (item.label.toLowerCase().includes("product")) {
      return { ...item, value: String(productsCount) };
    }
    if (item.label.toLowerCase().includes("inquir")) {
      return { ...item, value: String(inquiriesCount) };
    }
    return item;
  });

  const liveActivity = recentInquiries.length
    ? recentInquiries.map((item) => ({
        title: item.subject || item.type,
        detail: `${item.name} sent a ${item.type.toLowerCase().replace(/_/g, " ")} request`,
        time: new Date(item.createdAt).toLocaleString("en-PK"),
      }))
    : adminActivityFeed;

  const websiteStatus = [
    { label: "Orders", value: String(ordersCount) },
    { label: "Products", value: String(productsCount) },
    { label: "Customers", value: String(customersCount) },
    { label: "Inquiries", value: String(inquiriesCount) },
    ...adminHealthChecks,
  ];

  const topProducts: {
    id: string;
    title: string;
    category: string;
    stock: number;
  }[] = [];
  const quickActions = [
    {
      label: "Create product",
      description: "Add new inventory quickly",
      href: "/admin/products",
      icon: PlusCircle,
    },
    {
      label: "Update homepage",
      description: "Edit hero and sections",
      href: "/admin/cms",
      icon: FileText,
    },
    {
      label: "Review orders",
      description: "Track pending shipments",
      href: "/admin/orders",
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Command center</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Agriculture commerce operations cockpit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Monitor inventory, publishing, traffic, customer interactions, and
              operational health from one premium control surface.
            </p>
          </div>
          <Button variant="luxury" asChild>
            <Link href="/admin/products">
              <Activity className="h-4 w-4" />
              Open inventory
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {quickActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-border bg-muted/60 p-4 transition hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <item.icon className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-4 font-semibold">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-3">
          {[
            { label: "Traffic graph", value: "Live", icon: LineChart },
            { label: "Recent activity", value: "Tracked", icon: Activity },
            { label: "Website status", value: "Stable", icon: Gauge },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-muted/40 p-4"
            >
              <div className="flex items-center justify-between">
                <item.icon className="h-5 w-5 text-primary" />
                <Badge variant="secondary">{item.value}</Badge>
              </div>
              <p className="mt-4 font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section id="analytics" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">Traffic graph</h2>
            <LineChart className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-6 grid h-72 grid-cols-12 items-end gap-2">
            {(liveTrafficSeries.length
              ? liveTrafficSeries
              : adminTrafficSeries
            ).map((value, index) => (
              <div key={index} className="grid h-full items-end">
                <span
                  className="rounded-t-md bg-gradient-to-t from-emerald-700 to-lime-400"
                  style={{ height: `${value}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">
              Website status
            </h2>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            {websiteStatus.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-md bg-muted p-3"
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <BellRing className="h-4 w-4 text-primary" />
                  {item.label}
                </span>
                <Badge>{item.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          id="orders"
          className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">Recent orders</h2>
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 font-semibold">Order</th>
                  <th className="py-3 font-semibold">Customer</th>
                  <th className="py-3 font-semibold">City</th>
                  <th className="py-3 font-semibold">Total</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4 font-semibold">{order.id}</td>
                    <td className="py-4">{order.customer}</td>
                    <td className="py-4">{order.city}</td>
                    <td className="py-4">{order.total}</td>
                    <td className="py-4">
                      <Badge variant="secondary">{order.status}</Badge>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">
              Recent activities
            </h2>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {liveActivity.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/70 bg-muted/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
              </div>
            ))}
            {liveActivity.length === 0 ? (
              <p className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                No activity yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section id="inventory" className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-normal">Top products</h2>
            <Boxes className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.category}
                  </p>
                </div>
                <Badge variant="outline">{product.stock} stock</Badge>
              </div>
            ))}
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-normal">
              Module shortcuts
            </h2>
            <SearchCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            {adminOverviewLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 font-semibold transition hover:bg-accent"
              >
                <span>{item.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
