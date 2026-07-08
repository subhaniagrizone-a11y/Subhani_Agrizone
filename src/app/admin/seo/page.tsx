"use client";

import { useEffect, useState } from "react";
import { Save, SearchCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SeoForm = {
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  openGraphImage: string;
  noIndex: boolean;
};

const initialForm: SeoForm = {
  entityType: "page",
  entityId: "homepage",
  title: "",
  description: "",
  keywords: "",
  canonicalUrl: "",
  openGraphImage: "",
  noIndex: false,
};

export default function AdminSeoPage() {
  const [form, setForm] = useState<SeoForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch(
        "/api/admin/seo-settings?entityType=page&entityId=homepage",
        {
          cache: "no-store",
        },
      );
      const data = await response.json();
      const setting = data.setting;
      setForm({
        entityType: setting.entityType || "page",
        entityId: setting.entityId || "homepage",
        title: setting.title || "",
        description: setting.description || "",
        keywords: Array.isArray(setting.keywords)
          ? setting.keywords.join(", ")
          : "",
        canonicalUrl: setting.canonicalUrl || "",
        openGraphImage: setting.openGraphImage || "",
        noIndex: Boolean(setting.noIndex),
      });
    }

    void load();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/seo-settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entityType: form.entityType,
        entityId: form.entityId,
        title: form.title,
        description: form.description,
        keywords: form.keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        canonicalUrl: form.canonicalUrl,
        openGraphImage: form.openGraphImage,
        noIndex: form.noIndex,
        structuredData: {},
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save SEO settings.");
      return;
    }

    setMessage("SEO settings saved.");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">SEO Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage homepage metadata with persistent storage.
          </p>
        </div>
        <SearchCheck className="h-5 w-5 text-primary" />
      </div>

      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <Input
          placeholder="Meta title"
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <textarea
          className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Meta description"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
        />
        <Input
          placeholder="Keywords (comma separated)"
          value={form.keywords}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, keywords: event.target.value }))
          }
        />
        <Input
          placeholder="Canonical URL"
          value={form.canonicalUrl}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))
          }
        />
        <Input
          placeholder="Open Graph image URL"
          value={form.openGraphImage}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              openGraphImage: event.target.value,
            }))
          }
        />
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.noIndex}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                noIndex: event.target.checked,
              }))
            }
          />
          No Index
        </label>

        {message ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">{message}</p>
        ) : null}

        <Button type="submit" variant="luxury" disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save SEO"}
        </Button>
      </form>
    </section>
  );
}
