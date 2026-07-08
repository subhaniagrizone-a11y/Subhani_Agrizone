"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
};

type ItemRecord = Record<string, unknown> & { id: string };

export function AdminHomepageItemsManager({
  sectionKey,
  title,
  description,
  fieldDefs,
}: {
  sectionKey: string;
  title: string;
  description: string;
  fieldDefs: FieldDef[];
}) {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(
      fieldDefs.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {}),
    );
  }, [fieldDefs]);

  async function loadItems() {
    const response = await fetch(
      `/api/admin/homepage-items?key=${sectionKey}`,
      {
        cache: "no-store",
      },
    );
    const data = await response.json();
    const loaded = (data.items ?? []) as ItemRecord[];
    setItems(loaded);
  }

  useEffect(() => {
    void loadItems();
  }, [sectionKey]);

  const summary = useMemo(() => ({ total: items.length }), [items]);

  function resetForm() {
    setEditingId(null);
    setForm(
      fieldDefs.reduce<Record<string, string>>(
        (acc, field) => {
          acc[field.key] = "";
          return acc;
        },
        { id: `item_${Math.random().toString(36).slice(2, 8)}` },
      ),
    );
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const item = fieldDefs.reduce<Record<string, unknown>>(
      (acc, field) => {
        acc[field.key] = form[field.key] ?? "";
        return acc;
      },
      { id: editingId || `item_${Math.random().toString(36).slice(2, 8)}` },
    );

    const nextItems = editingId
      ? items.map((current) =>
          current.id === editingId ? { ...current, ...item } : current,
        )
      : [...items, item as ItemRecord];

    const response = await fetch(`/api/admin/homepage-items`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: sectionKey,
        title,
        items: nextItems,
        active: true,
        sortOrder: 0,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save item.");
      return;
    }

    setMessage(editingId ? "Item updated." : "Item added.");
    setEditingId(null);
    resetForm();
    await loadItems();
  }

  function startEdit(item: ItemRecord) {
    setEditingId(item.id);
    setForm(
      fieldDefs.reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = String(item[field.key] ?? "");
        return acc;
      }, {}),
    );
  }

  async function removeItem(id: string) {
    const response = await fetch(
      `/api/admin/homepage-items?key=${sectionKey}&id=${id}`,
      {
        method: "DELETE",
      },
    );
    if (response.ok) {
      await loadItems();
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
            Add new
          </Button>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-muted/35 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Items
          </p>
          <p className="mt-2 text-3xl font-bold">{summary.total}</p>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {String(
                      item["title"] ?? item["name"] ?? item["crop"] ?? "Item",
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.id}</p>
                </div>
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
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        onSubmit={saveItem}
      >
        <h3 className="text-xl font-bold tracking-normal">
          {editingId ? "Edit item" : "Add item"}
        </h3>
        <div className="mt-5 grid gap-4">
          {fieldDefs.map((field) => (
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
            {loading ? "Saving..." : editingId ? "Update item" : "Save item"}
          </Button>
        </div>
      </form>
    </section>
  );
}
