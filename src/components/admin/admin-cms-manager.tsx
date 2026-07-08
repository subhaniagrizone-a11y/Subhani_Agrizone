"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CmsSectionItem = {
  key: string;
  title: string;
  sortOrder: number;
  active: boolean;
  content: {
    items?: Record<string, unknown>[];
    [key: string]: unknown;
  };
};

type WorkstationConfig = {
  key: string;
  title: string;
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "number";
  }[];
};

const WORKSTATIONS: WorkstationConfig[] = [
  {
    key: "home_blog",
    title: "Blog Workstation",
    fields: [
      { key: "title", label: "Title", placeholder: "Post title" },
      { key: "slug", label: "Slug", placeholder: "post-slug" },
      { key: "excerpt", label: "Excerpt", placeholder: "Short summary" },
      { key: "image", label: "Cover Image URL", placeholder: "https://..." },
      { key: "category", label: "Category", placeholder: "Crop care" },
      { key: "readTime", label: "Read time", placeholder: "5 min" },
      { key: "date", label: "Date", placeholder: "08 Jul 2026" },
    ],
  },
  {
    key: "home_gallery",
    title: "Gallery Workstation",
    fields: [
      { key: "title", label: "Title", placeholder: "Image title" },
      { key: "image", label: "Image URL", placeholder: "https://..." },
    ],
  },
  {
    key: "home_testimonials",
    title: "Testimonials Workstation",
    fields: [
      { key: "name", label: "Name", placeholder: "Customer name" },
      { key: "role", label: "Role", placeholder: "Farmer, Punjab" },
      { key: "quote", label: "Quote", placeholder: "Feedback quote" },
      { key: "rating", label: "Rating", type: "number", placeholder: "5" },
      { key: "image", label: "Profile Image URL", placeholder: "https://..." },
    ],
  },
  {
    key: "home_diseases",
    title: "Crop Disease Workstation",
    fields: [
      { key: "crop", label: "Crop", placeholder: "Wheat" },
      { key: "disease", label: "Disease", placeholder: "Yellow Rust" },
      { key: "symptoms", label: "Symptoms", placeholder: "Symptoms detail" },
      { key: "action", label: "Action", placeholder: "Recommended action" },
      { key: "image", label: "Image URL", placeholder: "https://..." },
    ],
  },
];

const PRESET_SECTIONS: CmsSectionItem[] = WORKSTATIONS.map((item, index) => ({
  key: item.key,
  title: item.title,
  sortOrder: (index + 1) * 10,
  active: true,
  content: { items: [] },
}));

function mergePresetSections(items: CmsSectionItem[]) {
  const map = new Map(items.map((item) => [item.key, item]));

  PRESET_SECTIONS.forEach((preset) => {
    if (!map.has(preset.key)) {
      map.set(preset.key, preset);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

function toId() {
  return `item_${Math.random().toString(36).slice(2, 10)}`;
}

export function AdminCmsManager() {
  const [sections, setSections] = useState<CmsSectionItem[]>([]);
  const [selectedKey, setSelectedKey] = useState("home_blog");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/cms/homepage", { cache: "no-store" });
      const data = await response.json();
      const loaded: CmsSectionItem[] = mergePresetSections(data.sections ?? []);
      setSections(loaded);
      setSelectedKey(loaded[0]?.key ?? "home_blog");
    }

    void load();
  }, []);

  const selected = useMemo(
    () => sections.find((item) => item.key === selectedKey),
    [sections, selectedKey],
  );

  const workstation = useMemo(
    () => WORKSTATIONS.find((item) => item.key === selectedKey),
    [selectedKey],
  );

  const items = Array.isArray(selected?.content?.items)
    ? (selected?.content?.items as Record<string, unknown>[])
    : [];

  function patchSection(partial: Partial<CmsSectionItem>) {
    if (!selected) return;
    setSections((prev) =>
      prev.map((item) =>
        item.key === selected.key
          ? {
              ...item,
              ...partial,
              content: {
                ...(item.content ?? {}),
                ...(partial.content ?? {}),
              },
            }
          : item,
      ),
    );
  }

  function updateItem(index: number, key: string, value: string) {
    if (!selected) return;
    const nextItems = items.map((item, idx) =>
      idx === index
        ? {
            ...item,
            [key]: key === "rating" ? Number(value) || 0 : value,
          }
        : item,
    );

    patchSection({
      content: { ...(selected.content ?? {}), items: nextItems },
    });
  }

  function addItem() {
    if (!selected || !workstation) return;

    const next = workstation.fields.reduce<Record<string, unknown>>(
      (acc, field) => {
        acc[field.key] = field.type === "number" ? 0 : "";
        return acc;
      },
      { id: toId() },
    );

    patchSection({
      content: {
        ...(selected.content ?? {}),
        items: [...items, next],
      },
    });
  }

  function removeItem(index: number) {
    if (!selected) return;
    patchSection({
      content: {
        ...(selected.content ?? {}),
        items: items.filter((_, idx) => idx !== index),
      },
    });
  }

  async function saveSection() {
    if (!selected) return;
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/cms/homepage", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        key: selected.key,
        title: selected.title,
        active: selected.active,
        sortOrder: selected.sortOrder,
        content: {
          ...(selected.content ?? {}),
          items,
        },
      }),
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Save failed");
      return;
    }

    setMessage(`${selected.title} saved successfully.`);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Content Workstations</p>
        </div>

        <div className="mt-3 grid gap-2">
          {sections.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${
                selectedKey === item.key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.key}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {!selected || !workstation ? (
          <p className="text-sm text-muted-foreground">
            No workstation selected.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{workstation.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, remove content with image URLs and publish
                  instantly.
                </p>
              </div>
              <Button variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4" />
                Add new
              </Button>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={selected.active}
                onChange={(event) =>
                  patchSection({ active: event.target.checked })
                }
              />
              Active section on homepage
            </label>

            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  No content yet. Click Add new.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={String(item.id ?? index)}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Item #{index + 1}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {workstation.fields.map((field) => (
                        <label
                          key={field.key}
                          className="grid gap-1 text-sm font-medium"
                        >
                          {field.label}
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={String(item[field.key] ?? "")}
                            onChange={(event) =>
                              updateItem(index, field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {message ? (
              <p className="rounded-md bg-muted px-3 py-2 text-sm">{message}</p>
            ) : null}

            <Button
              type="button"
              variant="luxury"
              disabled={saving}
              onClick={saveSection}
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save workstation"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
