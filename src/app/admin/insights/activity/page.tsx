import Link from "next/link";
import type { Metadata } from "next";
import { Activity, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Recent Activity Insights",
};

export default async function AdminActivityInsightsPage() {
  const recentInquiries = await prisma.inquiry
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        name: true,
        type: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  const latest = recentInquiries[0]?.createdAt
    ? new Date(recentInquiries[0].createdAt)
    : null;

  const now = new Date();
  const mins = latest
    ? Math.floor((now.getTime() - latest.getTime()) / (1000 * 60))
    : null;

  const state = !latest
    ? "No activity"
    : mins !== null && mins <= 60
      ? "Live"
      : mins !== null && mins <= 1440
        ? "Tracked"
        : "Stale";

  const byStatus = recentInquiries.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Insights</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              Recent Activity Details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Live log of inquiry-based customer activity and status
              progression.
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
              State
            </p>
            <p className="mt-2 text-3xl font-bold">{state}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Records
            </p>
            <p className="mt-2 text-3xl font-bold">{recentInquiries.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Last update
            </p>
            <p className="mt-2 text-3xl font-bold">
              {latest
                ? latest.toLocaleTimeString("en-PK", {
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
            <h2 className="text-xl font-bold tracking-normal">
              Status Breakdown
            </h2>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-md bg-muted p-3 text-sm"
              >
                <span className="font-semibold">{status}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
            {Object.keys(byStatus).length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                No status data yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-normal">Activity Log</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 font-semibold">When</th>
                  <th className="py-3 font-semibold">User</th>
                  <th className="py-3 font-semibold">Type</th>
                  <th className="py-3 font-semibold">Subject</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3">
                      {new Date(item.createdAt).toLocaleString("en-PK")}
                    </td>
                    <td className="py-3 font-semibold">{item.name}</td>
                    <td className="py-3">{item.type}</td>
                    <td className="py-3">{item.subject || "-"}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          item.status === "RESOLVED" ? "secondary" : "gold"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recentInquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No recent activity.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
