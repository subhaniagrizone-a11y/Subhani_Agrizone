import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function absoluteUrl(path = "") {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiscountPercent(price: number, salePrice: number) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function normalizePkPhone(value: string) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  let local = digits;
  if (local.startsWith("92")) {
    local = local.slice(2);
  } else if (local.startsWith("0")) {
    local = local.slice(1);
  }

  if (local.length !== 10) {
    return `+${digits}`;
  }

  return `+92${local}`;
}

export function toWhatsappNumber(value: string) {
  return normalizePkPhone(value).replace(/\D/g, "");
}

export function toWhatsappLink(value: string, text?: string) {
  const number = toWhatsappNumber(value);
  const base = `https://wa.me/${number}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
