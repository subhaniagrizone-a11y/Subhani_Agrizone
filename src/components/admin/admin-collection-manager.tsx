"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CollectionField = {
  key: string;
  label: string;
  placeholder?: string;
};

type CollectionItem = Record<string, unknown> & { id: string };

export function AdminCollectionManager({
  module,
  title,
  description,
  fields,
}: {
  module: string;
  title: string;
  description: string;
  fields: CollectionField[];
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function emptyForm() {
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
  }

  useEffect(() => {
    setForm(emptyForm());
  }, [module]);

  async function loadItems() {
    const response = await fetch(`/api/admin/collections?module=${module}`, {
      cache: "no-store",
    });
    const data = await response.json();
    setItems((data.items ?? []) as CollectionItem[]);
  }

  useEffect(() => {
    void loadItems();
  }, [module]);

  const stats = useMemo(() => ({ total: items.length }), [items]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const item = fields.reduce<Record<string, unknown>>(
      (acc, field) => {
        acc[field.key] = form[field.key] ?? "";
        return acc;
      },
      {
        id: editingId || `${module}_${Math.random().toString(36).slice(2, 8)}`,
      },
    );

    const nextItems = editingId
      ? items.map((current) =>
          current.id === editingId ? { ...current, ...item } : current,
        )
      : [...items, item as CollectionItem];

    const response = await fetch("/api/admin/collections", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ module, items: nextItems }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save item.");
      return;
    }

    setMessage(editingId ? "Record updated." : "Record created.");
    resetForm();
    await loadItems();
  }

  function edit(item: CollectionItem) {
    setEditingId(item.id);
    setForm(
      fields.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = String(item[field.key] ?? "");
        return acc;
      }, {}),
    );
  }

  async function remove(id: string) {
    const nextItems = items.filter((item) => item.id !== id);
    const response = await fetch("/api/admin/collections", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ module, items: nextItems }),
    });
    if (response.ok) {
      setItems(nextItems);
      if (editingId === id) resetForm();
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-normal">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/35 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Records
          </p>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {String(item[fields[0]?.key] ?? "Record")}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => edit(item)}
                  >
                    <Save className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No records yet. Create your first one from the form.
            </p>
          ) : null}
        </div>
      </div>

      <form
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        onSubmit={save}
      >
        <h3 className="text-xl font-bold tracking-normal">
          {editingId ? "Edit record" : "Create record"}
        </h3>
        <div className="mt-5 grid gap-4">
          {fields.map((field) => (
            <Input
              key={field.key}
              placeholder={field.placeholder || field.label}
              value={form[field.key] ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  [field.key]: event.target.value,
                }))
              }
            />
          ))}
          {message ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">{message}</p>
          ) : null}
          <Button type="submit" variant="luxury" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </section>
  );
}
