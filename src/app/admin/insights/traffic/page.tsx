import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, LineChart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Traffic Insights",
};

export default async function AdminTrafficInsightsPage() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 13);

  const orders = await prisma.order
    .findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    })
    .catch(() => []);

  const buckets = Array.from({ length: 14 }, (_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    return { day, count: 0 };
  });

  for (const row of orders) {
    const dayKey = new Date(row.createdAt).toDateString();
    const bucket = buckets.find((item) => item.day.toDateString() === dayKey);
    if (bucket) bucket.count += 1;
  }

  const currentWeek = buckets.slice(7);
  const previousWeek = buckets.slice(0, 7);
  const currentTotal = currentWeek.reduce((sum, item) => sum + item.count, 0);
  const previousTotal = previousWeek.reduce((sum, item) => sum + item.count, 0);
  const delta =
    previousTotal > 0
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
      : currentTotal > 0
        ? 100
        : 0;

  const maxCount = Math.max(1, ...buckets.map((item) => item.count));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Insights</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              Traffic Graph Details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Live order activity trend over the last 14 days.
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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Current 7d
            </p>
            <p className="mt-2 text-3xl font-bold">{currentTotal}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Previous 7d
            </p>
            <p className="mt-2 text-3xl font-bold">{previousTotal}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Trend
            </p>
            <p className="mt-2 text-3xl font-bold">
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-normal">Daily Activity</h2>
          <LineChart className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-6 grid h-72 grid-cols-14 items-end gap-2">
          {buckets.map((item) => (
            <div key={item.day.toISOString()} className="grid h-full items-end">
              <span
                className="rounded-t-md bg-gradient-to-t from-emerald-700 to-lime-400"
                style={{
                  height: `${Math.max(10, Math.round((item.count / maxCount) * 100))}%`,
                }}
                title={`${item.day.toLocaleDateString("en-PK")}: ${item.count}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 font-semibold">Date</th>
                <th className="py-3 font-semibold">Orders</th>
                <th className="py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {buckets
                .slice()
                .reverse()
                .map((item) => (
                  <tr
                    key={`row-${item.day.toISOString()}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3">
                      {item.day.toLocaleDateString("en-PK")}
                    </td>
                    <td className="py-3 font-semibold">{item.count}</td>
                    <td className="py-3">
                      <Badge
                        variant={item.count === 0 ? "outline" : "secondary"}
                      >
                        {item.count === 0 ? "No traffic" : "Active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
