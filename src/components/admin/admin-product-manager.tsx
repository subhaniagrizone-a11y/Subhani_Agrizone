"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Barcode,
  FileSpreadsheet,
  ImagePlus,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { categories } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type ActiveIngredientRow = {
  name: string;
  percentage: string;
};

type FaqRow = {
  question: string;
  answer: string;
};

type ProductItem = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  categoryId?: string;
  brandId?: string | null;
  price: number;
  salePrice?: number | null;
  wholesalePrice?: number | null;
  dealerPrice?: number | null;
  farmerPrice?: number | null;
  stock: number;
  shortDescription?: string | null;
  description: string;
  status: string;
  specifications?: Record<string, unknown>;
  images?: { id: string; url: string; alt: string; sortOrder: number }[];
  category?: { name?: string };
};

const emptyForm = {
  title: "",
  slug: "",
  sku: "",
  barcode: "",
  categoryId: categories[0]?.slug ?? "",
  brandId: "",
  price: "",
  salePrice: "",
  wholesalePrice: "",
  dealerPrice: "",
  farmerPrice: "",
  stock: "",
  shortDescription: "",
  description: "",
  imageUrlInput: "",
  imageUrls: [] as string[],
  activeIngredients: [{ name: "", percentage: "" }] as ActiveIngredientRow[],
  aboutProduct: "",
  faqs: [{ question: "", answer: "" }] as FaqRow[],
};

function formatApiValidationError(details: unknown) {
  if (!details || typeof details !== "object") return null;
  const flattened = details as {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };

  const lines: string[] = [];
  if (Array.isArray(flattened.formErrors) && flattened.formErrors.length) {
    lines.push(...flattened.formErrors);
  }

  if (flattened.fieldErrors) {
    Object.entries(flattened.fieldErrors).forEach(([field, errors]) => {
      if (!errors?.length) return;
      lines.push(`${field}: ${errors.join(", ")}`);
    });
  }

  return lines.length ? lines.join(" | ") : null;
}

export function AdminProductManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bulkMode, setBulkMode] = useState<"create" | "update" | "delete">(
    "create",
  );
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  async function loadProducts() {
    const response = await fetch("/api/products?all=1");
    const data = await response.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const normalizedActiveIngredients = useMemo(
    () =>
      form.activeIngredients.filter(
        (row) => row.name.trim() && row.percentage.trim(),
      ),
    [form.activeIngredients],
  );

  const normalizedFaqs = useMemo(
    () => form.faqs.filter((row) => row.question.trim() && row.answer.trim()),
    [form.faqs],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku: form.sku,
      barcode: form.barcode || undefined,
      categoryId: form.categoryId,
      brandId: form.brandId || undefined,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      wholesalePrice: form.wholesalePrice
        ? Number(form.wholesalePrice)
        : undefined,
      dealerPrice: form.dealerPrice ? Number(form.dealerPrice) : undefined,
      farmerPrice: form.farmerPrice ? Number(form.farmerPrice) : undefined,
      stock: Number(form.stock),
      shortDescription: form.shortDescription || undefined,
      description: form.description,
      imageUrls: form.imageUrls,
      activeIngredients: normalizedActiveIngredients,
      specifications: {
        aboutProduct: form.aboutProduct,
        activeIngredients: normalizedActiveIngredients,
        faqs: normalizedFaqs,
      },
    };

    const response = editingId
      ? await fetch(`/api/products/${editingId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      const validationMessage = formatApiValidationError(result.details);
      setMessage(
        validationMessage
          ? `${result.error ?? "Product save failed."} (${validationMessage})`
          : (result.error ?? "Product save failed."),
      );
      return;
    }

    setMessage(editingId ? "Product updated." : "Product created.");
    setForm(emptyForm);
    setEditingId(null);
    void loadProducts();
  }

  async function removeProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (response.ok) {
      void loadProducts();
    }
  }

  function startEdit(product: ProductItem) {
    const rawIngredients =
      product.specifications?.activeIngredients ??
      product.specifications?.activeingredients ??
      product.specifications?.active_ingredients ??
      product.specifications?.["active ingredients"];
    const mappedIngredients = Array.isArray(rawIngredients)
      ? rawIngredients
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as { name?: string; percentage?: string };
            return {
              name: String(row.name ?? ""),
              percentage: String(row.percentage ?? ""),
            };
          })
          .filter((item): item is ActiveIngredientRow => Boolean(item))
      : [];

    const rawFaqs =
      product.specifications?.faqs ??
      product.specifications?.faq ??
      product.specifications?.faqItems;

    const mappedFaqs = Array.isArray(rawFaqs)
      ? rawFaqs
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as {
              question?: string;
              q?: string;
              title?: string;
              answer?: string;
              a?: string;
              body?: string;
            };
            return {
              question: String(row.question ?? row.q ?? row.title ?? ""),
              answer: String(row.answer ?? row.a ?? row.body ?? ""),
            };
          })
          .filter((item): item is FaqRow => Boolean(item))
      : [];

    const aboutProduct = String(
      product.specifications?.aboutProduct ??
        product.specifications?.about ??
        product.specifications?.about_product ??
        "",
    );

    setEditingId(product.id);
    setForm({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode ?? "",
      categoryId: product.categoryId ?? categories[0]?.slug ?? "",
      brandId: product.brandId ?? "",
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      wholesalePrice: product.wholesalePrice
        ? String(product.wholesalePrice)
        : "",
      dealerPrice: product.dealerPrice ? String(product.dealerPrice) : "",
      farmerPrice: product.farmerPrice ? String(product.farmerPrice) : "",
      stock: String(product.stock),
      shortDescription: product.shortDescription ?? "",
      description: product.description,
      imageUrlInput: "",
      imageUrls: (product.images ?? []).map((img) => img.url),
      activeIngredients:
        mappedIngredients.length > 0
          ? mappedIngredients
          : [{ name: "", percentage: "" }],
      aboutProduct,
      faqs: mappedFaqs.length > 0 ? mappedFaqs : [{ question: "", answer: "" }],
    });
  }

  async function handleBulkUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!bulkFile) {
      setMessage("Please select a CSV file first.");
      return;
    }

    setBulkLoading(true);
    setMessage("");
    const csv = await bulkFile.text();

    const response = await fetch("/api/products/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: bulkMode, csv }),
    });
    const result = await response.json();
    setBulkLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Bulk operation failed.");
      return;
    }

    setMessage(
      `Bulk ${bulkMode} finished: +${result.created ?? 0} created, ${result.updated ?? 0} updated, ${result.archived ?? 0} archived, ${result.errors?.length ?? 0} errors.`,
    );
    setBulkFile(null);
    void loadProducts();
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        onSubmit={submit}
        className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-normal">Product content</h2>
          <ImagePlus className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Product title
            <Input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Hybrid Maize Seed Premium 10kg"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            SKU
            <Input
              value={form.sku}
              onChange={(event) =>
                setForm({ ...form, sku: event.target.value })
              }
              placeholder="SAG-SEED-001"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Barcode
            <Input
              value={form.barcode}
              onChange={(event) =>
                setForm({ ...form, barcode: event.target.value })
              }
              placeholder="8964001000010"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Category
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm({ ...form, categoryId: event.target.value })
              }
              className="h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Retail price
            <Input
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
              placeholder="12800"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Sale price
            <Input
              value={form.salePrice}
              onChange={(event) =>
                setForm({ ...form, salePrice: event.target.value })
              }
              placeholder="11950"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Wholesale price
            <Input
              value={form.wholesalePrice}
              onChange={(event) =>
                setForm({ ...form, wholesalePrice: event.target.value })
              }
              placeholder="11100"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Dealer price
            <Input
              value={form.dealerPrice}
              onChange={(event) =>
                setForm({ ...form, dealerPrice: event.target.value })
              }
              placeholder="10650"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Farmer price
            <Input
              value={form.farmerPrice}
              onChange={(event) =>
                setForm({ ...form, farmerPrice: event.target.value })
              }
              placeholder="11400"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Stock
            <Input
              value={form.stock}
              onChange={(event) =>
                setForm({ ...form, stock: event.target.value })
              }
              placeholder="86"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Short description
            <Input
              value={form.shortDescription}
              onChange={(event) =>
                setForm({ ...form, shortDescription: event.target.value })
              }
              placeholder="One-line highlight for product card"
            />
          </label>

          <div className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Product description (Word-style editor)
            <RichTextEditor
              value={form.description}
              onChange={(next) => setForm({ ...form, description: next })}
              minHeight={320}
            />
          </div>

          <div className="grid gap-2 text-sm font-semibold sm:col-span-2">
            About this product
            <RichTextEditor
              value={form.aboutProduct}
              onChange={(next) => setForm({ ...form, aboutProduct: next })}
              minHeight={220}
            />
          </div>

          <div className="grid gap-3 text-sm font-semibold lg:col-span-2">
            <p>Active Ingredients</p>
            {form.activeIngredients.map((item, index) => (
              <div
                key={index}
                className="grid gap-2 md:grid-cols-[1fr_180px_auto]"
              >
                <Input
                  value={item.name}
                  onChange={(event) => {
                    const next = [...form.activeIngredients];
                    next[index] = { ...next[index], name: event.target.value };
                    setForm({ ...form, activeIngredients: next });
                  }}
                  placeholder="Phosphorus"
                />
                <Input
                  value={item.percentage}
                  onChange={(event) => {
                    const next = [...form.activeIngredients];
                    next[index] = {
                      ...next[index],
                      percentage: event.target.value,
                    };
                    setForm({ ...form, activeIngredients: next });
                  }}
                  placeholder="7%"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const next = form.activeIngredients.filter(
                      (_, i) => i !== index,
                    );
                    setForm({
                      ...form,
                      activeIngredients:
                        next.length > 0 ? next : [{ name: "", percentage: "" }],
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm({
                  ...form,
                  activeIngredients: [
                    ...form.activeIngredients,
                    { name: "", percentage: "" },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add active ingredient
            </Button>
          </div>

          <div className="grid gap-3 text-sm font-semibold lg:col-span-2">
            <p>FAQs</p>
            {form.faqs.map((item, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-md border border-border p-3"
              >
                <Input
                  value={item.question}
                  onChange={(event) => {
                    const next = [...form.faqs];
                    next[index] = {
                      ...next[index],
                      question: event.target.value,
                    };
                    setForm({ ...form, faqs: next });
                  }}
                  placeholder="FAQ question"
                />
                <textarea
                  value={item.answer}
                  onChange={(event) => {
                    const next = [...form.faqs];
                    next[index] = {
                      ...next[index],
                      answer: event.target.value,
                    };
                    setForm({ ...form, faqs: next });
                  }}
                  placeholder="FAQ answer"
                  rows={4}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const next = form.faqs.filter((_, i) => i !== index);
                    setForm({
                      ...form,
                      faqs:
                        next.length > 0 ? next : [{ question: "", answer: "" }],
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setForm({
                  ...form,
                  faqs: [...form.faqs, { question: "", answer: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </div>

          <div className="grid gap-3 text-sm font-semibold lg:col-span-2">
            <p>Product images</p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={form.imageUrlInput}
                onChange={(event) =>
                  setForm({ ...form, imageUrlInput: event.target.value })
                }
                placeholder="Paste image URL and click Add"
              />
              <Button
                type="button"
                variant="outline"
                className="sm:w-auto"
                onClick={() => {
                  const url = form.imageUrlInput.trim();
                  if (!url) return;
                  setForm({
                    ...form,
                    imageUrls: [...form.imageUrls, url],
                    imageUrlInput: "",
                  });
                }}
              >
                Add
              </Button>
            </div>

            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
              Upload images (URL upload only)
              <input
                type="file"
                accept="image/*"
                multiple
                className="text-xs"
                onChange={(event) => {
                  const input = event.currentTarget;
                  const files = Array.from(event.target.files ?? []);
                  if (files.length) {
                    setMessage(
                      "Direct file upload disabled for memory safety. Please upload files to storage/CDN and paste image URLs.",
                    );
                  }
                  input.value = "";
                }}
              />
            </label>

            {form.imageUrls.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {form.imageUrls.map((url, index) => (
                  <div
                    key={`${url.slice(0, 18)}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <span className="truncate text-xs">Image {index + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageUrls: form.imageUrls.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        ) : null}

        <Button className="mt-5 w-full" variant="luxury" disabled={loading}>
          <Save className="h-4 w-4" />
          {loading
            ? "Saving..."
            : editingId
              ? "Update product"
              : "Save product"}
        </Button>
      </form>

      <div className="min-w-0 space-y-6">
        <form
          onSubmit={handleBulkUpload}
          className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">
              Bulk CSV operations
            </h2>
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Operation mode
              <select
                value={bulkMode}
                onChange={(event) =>
                  setBulkMode(
                    event.target.value as "create" | "update" | "delete",
                  )
                }
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete/Archive</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              CSV file
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) =>
                  setBulkFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Required headers for create/update: title, slug, sku, categoryId,
            price, stock, description. Optional: id, barcode, brandId,
            salePrice, wholesalePrice, dealerPrice, farmerPrice, usage, dosage.
            For delete mode, provide one of: id, slug, or sku.
          </p>
          <Button
            className="mt-4 w-full"
            variant="luxury"
            disabled={bulkLoading}
          >
            <PackagePlus className="h-4 w-4" />
            {bulkLoading ? "Processing CSV..." : `Run bulk ${bulkMode}`}
          </Button>
        </form>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-normal">Catalog table</h2>
            <Barcode className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 font-semibold">Product</th>
                  <th className="py-3 font-semibold">SKU</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Price</th>
                  <th className="py-3 font-semibold">Stock</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4 font-semibold">{product.title}</td>
                    <td className="py-4">{product.sku}</td>
                    <td className="py-4">
                      {product.category?.name ?? product.categoryId}
                    </td>
                    <td className="py-4">
                      {formatCurrency(product.salePrice ?? product.price)}
                    </td>
                    <td className="py-4">{product.stock}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
