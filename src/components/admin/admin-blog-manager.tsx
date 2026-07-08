"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  authorName: string;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string;
  publishedAt?: string | null;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  authorName: "",
  published: false,
  metaTitle: "",
  metaDescription: "",
};

export function AdminBlogManager() {
  const [items, setItems] = useState<BlogRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    const response = await fetch("/api/admin/blogs", { cache: "no-store" });
    const data = await response.json();
    setItems(data.posts ?? []);
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const stats = useMemo(() => {
    const published = items.filter((item) => item.published).length;
    return { published, drafts: items.length - published };
  }, [items]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { ...form };
    const response = editingId
      ? await fetch("/api/admin/blogs", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      : await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save blog post.");
      return;
    }

    setMessage(editingId ? "Blog updated." : "Blog created.");
    setEditingId(null);
    setForm(emptyForm);
    void loadItems();
  }

  function startEdit(item: BlogRow) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImage: item.coverImage ?? "",
      authorName: item.authorName,
      published: item.published,
      metaTitle: item.metaTitle ?? "",
      metaDescription: item.metaDescription ?? "",
    });
  }

  async function removeItem(id: string) {
    const response = await fetch(`/api/admin/blogs?id=${id}`, {
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
            <h2 className="text-2xl font-bold tracking-normal">Blog Posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload, edit, publish, and remove field articles.
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
            New post
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Published
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.published}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-bold">{stats.drafts}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 font-semibold">Title</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Updated</th>
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
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /{item.slug}
                    </p>
                  </td>
                  <td className="py-4">
                    {item.published ? "Published" : "Draft"}
                  </td>
                  <td className="py-4 text-xs text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleString()}
                  </td>
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
          {editingId ? "Edit blog post" : "Create blog post"}
        </h3>
        <div className="mt-5 grid gap-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }
          />
          <Input
            placeholder="Cover image URL"
            value={form.coverImage}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, coverImage: e.target.value }))
            }
          />
          <Input
            placeholder="Author name"
            value={form.authorName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, authorName: e.target.value }))
            }
          />
          <Input
            placeholder="Meta title"
            value={form.metaTitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
            }
          />
          <Input
            placeholder="Meta description"
            value={form.metaDescription}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, metaDescription: e.target.value }))
            }
          />
          <textarea
            className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Excerpt"
            value={form.excerpt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, excerpt: e.target.value }))
            }
          />
          <textarea
            className="min-h-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Blog content"
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
          />
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, published: e.target.checked }))
              }
            />
            Published
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
            {loading ? "Saving..." : editingId ? "Update post" : "Publish post"}
          </Button>
        </div>
      </form>
    </section>
  );
}
