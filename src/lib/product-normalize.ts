import type { Product } from "@/types";

import { products as fallbackProducts } from "@/lib/data";

type AnyRecord = Record<string, unknown>;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getImageList(raw: AnyRecord) {
  const images = raw.images;
  if (!Array.isArray(images) || images.length === 0) {
    return [
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  const parsed = images
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) {
        return toStringValue((item as AnyRecord).url, "");
      }
      return "";
    })
    .filter(Boolean);

  return parsed.length
    ? parsed
    : [
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
      ];
}

function getVariants(raw: AnyRecord) {
  const variants = raw.variants;
  if (!Array.isArray(variants) || variants.length === 0) {
    return [] as Product["variants"];
  }

  const grouped = new Map<string, string[]>();

  variants.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const row = item as AnyRecord;
    const name = toStringValue(row.name, "Option");
    const value =
      toStringValue(row.value, "") ||
      toStringValue(row.label, "") ||
      toStringValue(row.name, "");

    if (!grouped.has(name)) grouped.set(name, []);
    if (value && !grouped.get(name)?.includes(value)) {
      grouped.get(name)?.push(value);
    }
  });

  return Array.from(grouped.entries()).map(([name, values]) => ({
    name,
    values: values.length ? values : ["Standard"],
  }));
}

function toActiveIngredientRows(value: unknown) {
  if (!Array.isArray(value))
    return [] as { name: string; percentage: string }[];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as AnyRecord;
      const name = toStringValue(
        row.name ?? row.ingredient ?? row.title,
        "",
      ).trim();
      const percentage = toStringValue(
        row.percentage ?? row.percent ?? row.value ?? row.amount,
        "",
      ).trim();

      if (!name && !percentage) return null;
      return { name, percentage };
    })
    .filter((item): item is { name: string; percentage: string } =>
      Boolean(item),
    );
}

function toFaqRows(value: unknown) {
  if (!Array.isArray(value))
    return [] as { question: string; answer: string }[];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as AnyRecord;
      const question = toStringValue(
        row.question ?? row.q ?? row.title,
        "",
      ).trim();
      const answer = toStringValue(row.answer ?? row.a ?? row.body, "").trim();

      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item),
    );
}

function normalizeSpecifications(record: AnyRecord) {
  const specs =
    record.specifications && typeof record.specifications === "object"
      ? ({ ...(record.specifications as Record<string, unknown>) } as AnyRecord)
      : ({} as AnyRecord);

  const candidates = [
    specs.activeIngredients,
    specs.activeingredients,
    specs.active_ingredients,
    specs["active ingredients"],
    record.activeIngredients,
    record.activeingredients,
    record.active_ingredients,
  ];

  const normalizedRows =
    candidates
      .map((candidate) => toActiveIngredientRows(candidate))
      .find((rows) => rows.length > 0) ?? [];

  if (normalizedRows.length > 0) {
    specs.activeIngredients = normalizedRows;
  }

  const aboutCandidates = [
    specs.aboutProduct,
    specs.about,
    specs.about_product,
    specs.aboutThisProduct,
    record.aboutProduct,
  ];

  const normalizedAbout =
    aboutCandidates
      .map((item) => toStringValue(item, "").trim())
      .find((item) => Boolean(item)) ?? "";

  if (normalizedAbout) {
    specs.aboutProduct = normalizedAbout;
  }

  const faqCandidates = [
    specs.faqs,
    specs.faq,
    specs.faqItems,
    record.faqs,
    record.faq,
  ];

  const normalizedFaqs =
    faqCandidates
      .map((candidate) => toFaqRows(candidate))
      .find((rows) => rows.length > 0) ?? [];

  if (normalizedFaqs.length > 0) {
    specs.faqs = normalizedFaqs;
  }

  return specs as Record<string, unknown>;
}

export function normalizeProduct(raw: unknown): Product {
  if (!raw || typeof raw !== "object") {
    return fallbackProducts[0];
  }

  const record = raw as AnyRecord;
  const fallback =
    fallbackProducts.find((item) => item.id === toStringValue(record.id)) ??
    fallbackProducts[0];

  const category = record.category as AnyRecord | undefined;
  const brand = record.brand as AnyRecord | undefined;
  const specs = normalizeSpecifications(record);

  return {
    id: toStringValue(record.id, fallback.id),
    title: toStringValue(record.title, fallback.title),
    slug: toStringValue(record.slug, fallback.slug),
    sku: toStringValue(record.sku, fallback.sku),
    barcode: toStringValue(record.barcode, fallback.barcode),
    brand: toStringValue(brand?.name ?? record.brand, fallback.brand),
    category: toStringValue(
      category?.name ?? record.category,
      fallback.category,
    ),
    subcategory: toStringValue(
      (record.subcategory as AnyRecord | undefined)?.name ?? record.subcategory,
      fallback.subcategory,
    ),
    price: toNumber(record.price, fallback.price),
    salePrice: toNumber(record.salePrice, fallback.salePrice),
    wholesalePrice: toNumber(record.wholesalePrice, fallback.wholesalePrice),
    dealerPrice: toNumber(record.dealerPrice, fallback.dealerPrice),
    farmerPrice: toNumber(record.farmerPrice, fallback.farmerPrice),
    rating: toNumber(record.rating, fallback.rating),
    reviews: toNumber(record.reviewCount ?? record.reviews, fallback.reviews),
    stock: toNumber(record.stock, fallback.stock),
    badge:
      toStringValue(record.status, "") === "ACTIVE"
        ? "Available"
        : fallback.badge,
    images: getImageList(record),
    videoUrl: toStringValue(record.videoUrl, fallback.videoUrl),
    shortDescription: toStringValue(
      record.shortDescription,
      fallback.shortDescription,
    ),
    description: toStringValue(record.description, fallback.description),
    specifications: specs,
    usage: toStringValue(record.usage, fallback.usage),
    dosage: toStringValue(record.dosage, fallback.dosage),
    benefits: Array.isArray(record.benefits)
      ? record.benefits.map((item) => String(item))
      : fallback.benefits,
    safetyInstructions: Array.isArray(record.safetyInstructions)
      ? record.safetyInstructions.map((item) => String(item))
      : fallback.safetyInstructions,
    downloads: Array.isArray(record.downloads)
      ? (record.downloads as Product["downloads"])
      : fallback.downloads,
    variants: getVariants(record),
    related: Array.isArray(record.related)
      ? record.related.map((item) => String(item))
      : fallback.related,
  };
}

export async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) return [] as Product[];

  try {
    const response = await fetch(
      `/api/products?ids=${encodeURIComponent(ids.join(","))}`,
    );
    if (!response.ok) return [] as Product[];

    const data = (await response.json()) as { products?: unknown[] };
    const normalized = Array.isArray(data.products)
      ? data.products.map((item) => normalizeProduct(item))
      : [];
    return normalized;
  } catch {
    return [] as Product[];
  }
}
