"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DiseaseRow = {
  id: string;
  crop: string;
  disease: string;
  symptoms: string;
  action: string;
  image: string;
};

const emptyForm = {
  crop: "",
  disease: "",
  symptoms: "",
  action: "",
  image: "",
};

export function AdminDiseaseManager() {
  const [items, setItems] = useState<DiseaseRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    const response = await fetch(
      "/api/admin/homepage-items?key=home_diseases",
      {
        cache: "no-store",
      },
    );
    const data = await response.json();
    setItems((data.items ?? []) as DiseaseRow[]);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const stats = useMemo(() => {
    const crops = new Set(items.map((item) => item.crop).filter(Boolean));
    return { total: items.length, crops: crops.size };
  }, [items]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const item = {
      id: editingId || `disease_${Math.random().toString(36).slice(2, 8)}`,
      ...form,
    };

    const nextItems = editingId
      ? items.map((current) => (current.id === editingId ? item : current))
      : [...items, item];

    const response = await fetch("/api/admin/homepage-items", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: "home_diseases",
        title: "Crop Disease Intelligence",
        items: nextItems,
        active: true,
        sortOrder: 0,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save disease record.");
      return;
    }

    setMessage(editingId ? "Disease updated." : "Disease added.");
    resetForm();
    await loadItems();
  }

  function startEdit(item: DiseaseRow) {
    setEditingId(item.id);
    setForm({
      crop: item.crop,
      disease: item.disease,
      symptoms: item.symptoms,
      action: item.action,
      image: item.image,
    });
  }

  async function removeItem(id: string) {
    const response = await fetch(
      `/api/admin/homepage-items?key=home_diseases&id=${id}`,
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
            <p className="eyebrow">Problem mapping</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">
              Disease Intelligence
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Maintain crop disease entries that power the homepage and future
              agronomy workflows.
            </p>
          </div>
          <Button variant="outline" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            New disease
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Records
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Crops covered
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.crops}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {item.crop} - {item.disease}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.symptoms}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Action: {item.action}
                  </p>
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
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        onSubmit={submit}
      >
        <h3 className="text-xl font-bold tracking-normal">
          {editingId ? "Edit disease" : "Add disease"}
        </h3>
        <div className="mt-5 grid gap-4">
          <Input
            placeholder="Crop"
            value={form.crop}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, crop: e.target.value }))
            }
          />
          <Input
            placeholder="Disease"
            value={form.disease}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, disease: e.target.value }))
            }
          />
          <Input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, image: e.target.value }))
            }
          />
          <textarea
            className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Symptoms"
            value={form.symptoms}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, symptoms: e.target.value }))
            }
          />
          <textarea
            className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Recommended action"
            value={form.action}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, action: e.target.value }))
            }
          />
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
                ? "Update disease"
                : "Save disease"}
          </Button>
        </div>
      </form>
    </section>
  );
}
