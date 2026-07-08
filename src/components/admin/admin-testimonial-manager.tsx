"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TestimonialRow = {
  id: string;
  name: string;
  role?: string | null;
  quote: string;
  rating: number;
  imageUrl?: string | null;
  active: boolean;
  updatedAt: string;
};

const emptyForm = {
  name: "",
  role: "",
  quote: "",
  rating: 5,
  imageUrl: "",
  active: true,
};

export function AdminTestimonialManager() {
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    const response = await fetch("/api/admin/testimonials", {
      cache: "no-store",
    });
    const data = await response.json();
    setItems(data.testimonials ?? []);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.active).length;
    return { active, hidden: items.length - active };
  }, [items]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { ...form };
    const response = editingId
      ? await fetch("/api/admin/testimonials", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save testimonial.");
      return;
    }

    setMessage(editingId ? "Testimonial updated." : "Testimonial added.");
    setEditingId(null);
    setForm(emptyForm);
    void loadItems();
  }

  function startEdit(item: TestimonialRow) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role ?? "",
      quote: item.quote,
      rating: item.rating,
      imageUrl: item.imageUrl ?? "",
      active: item.active,
    });
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/admin/testimonials?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      void loadItems();
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-normal">Testimonials</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit, hide, and remove customer quotes.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            <Plus className="h-4 w-4" />
            New testimonial
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Active
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Hidden
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.hidden}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 font-semibold">Name</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Rating</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.role ?? "Customer"}
                    </p>
                  </td>
                  <td className="py-4">{item.active ? "Active" : "Hidden"}</td>
                  <td className="py-4">{item.rating}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
                      >
                        <Save className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
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
      </div>

      <form
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        onSubmit={submit}
      >
        <h3 className="text-xl font-bold tracking-normal">
          {editingId ? "Edit testimonial" : "Add testimonial"}
        </h3>
        <div className="mt-5 grid gap-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            placeholder="Role"
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value }))
            }
          />
          <Input
            placeholder="Profile image URL"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
            }
          />
          <Input
            type="number"
            min="1"
            max="5"
            placeholder="Rating"
            value={String(form.rating)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                rating: Number(e.target.value) || 5,
              }))
            }
          />
          <textarea
            className="min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Quote"
            value={form.quote}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, quote: e.target.value }))
            }
          />
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
            />
            Active
          </label>
          {message ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">{message}</p>
          ) : null}
          <Button type="submit" variant="luxury" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading
              ? "Saving..."
              : editingId
                ? "Update testimonial"
                : "Save testimonial"}
          </Button>
        </div>
      </form>
    </section>
  );
}
