"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type InquiryRow = {
  id: string;
  type: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  updatedAt: string;
};

export function AdminInquiriesManager({
  type,
  title,
  description,
}: {
  type?: string;
  title: string;
  description: string;
}) {
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    const response = await fetch(`/api/admin/inquiries${query}`, {
      cache: "no-store",
    });
    const data = await response.json();
    setItems(data.inquiries ?? []);
  }

  useEffect(() => {
    void loadItems();
  }, [type]);

  const stats = useMemo(() => {
    const open = items.filter(
      (item) => item.status === "NEW" || item.status === "OPEN",
    ).length;
    return { total: items.length, open };
  }, [items]);

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(false);
    await loadItems();
  }

  async function remove(id: string) {
    setLoading(true);
    await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
    setLoading(false);
    await loadItems();
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-normal">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-right text-sm">
          <p>
            Total: <span className="font-semibold">{stats.total}</span>
          </p>
          <p>
            Open: <span className="font-semibold">{stats.open}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-semibold">Name</th>
              <th className="py-3 font-semibold">Contact</th>
              <th className="py-3 font-semibold">Subject</th>
              <th className="py-3 font-semibold">Type</th>
              <th className="py-3 font-semibold">Status</th>
              <th className="py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0"
              >
                <td className="py-4 font-semibold">{item.name}</td>
                <td className="py-4">
                  <p>{item.email || "-"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.phone || "-"}
                  </p>
                </td>
                <td className="py-4">
                  <p>{item.subject || "No subject"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.message}
                  </p>
                </td>
                <td className="py-4">{item.type}</td>
                <td className="py-4">{item.status}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => updateStatus(item.id, "RESOLVED")}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Resolve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loading}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
