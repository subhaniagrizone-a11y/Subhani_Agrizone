import { siteConfig } from "@/lib/data";

export type PaymentMethodId =
  | "BANK_TRANSFER"
  | "COD"
  | "JAZZCASH"
  | "EASYPAISA"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "VISA"
  | "MASTERCARD";

export type DeliveryMethodId = "STANDARD" | "EXPRESS" | "PRIORITY";

export type CheckoutAddress = {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
  country: string;
  saveAsDefault?: boolean;
};

export type CheckoutItem = {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};

export type ShippingQuote = {
  method: DeliveryMethodId;
  label: string;
  charge: number;
  estimatedDays: string;
  freeShippingThreshold: number | null;
  threshold?: number | null;
  description: string;
};

export type CouponQuote = {
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  amount: number;
};

export type CheckoutQuote = {
  items: CheckoutItem[];
  subtotal: number;
  discountTotal: number;
  shippingCharge: number;
  taxTotal: number;
  grandTotal: number;
  coupon: CouponQuote | null;
  shipping: ShippingQuote;
  paymentMethod: PaymentMethodId;
  paymentProvider: string;
  estimatedDelivery: string;
  stockIssues: string[];
};

export type ShippingZoneLike = {
  name: string;
  cities: string[];
  baseCharge: number;
  freeShippingAbove: number | null;
  estimatedDays: string;
  active: boolean;
};

export type CouponLike = {
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export type PaymentMethodMeta = {
  id: PaymentMethodId;
  label: string;
  provider: string;
  description: string;
  accent: string;
  badge: string;
  settlement: "offline" | "manual" | "online";
  supportsSavedToken: boolean;
  requiresReference: boolean;
  instructions: string;
};

export const paymentMethods: PaymentMethodMeta[] = [
  {
    id: "COD",
    label: "Cash on Delivery",
    provider: "offline",
    description: "Pay the courier when the parcel reaches your door.",
    accent: "from-slate-900 to-slate-600",
    badge: "Most trusted",
    settlement: "offline",
    supportsSavedToken: false,
    requiresReference: false,
    instructions:
      "No online payment is required. Keep the order number ready for delivery verification.",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank Transfer",
    provider: "bank-transfer",
    description: "Transfer directly to our UBL account and add your reference.",
    accent: "from-emerald-900 to-emerald-600",
    badge: "Manual verification",
    settlement: "manual",
    supportsSavedToken: false,
    requiresReference: true,
    instructions: siteConfig.payment.instructions,
  },
  {
    id: "JAZZCASH",
    label: "JazzCash",
    provider: "jazzcash",
    description: "Wallet transfer prepared for gateway integration.",
    accent: "from-orange-700 to-rose-600",
    badge: "Wallet",
    settlement: "online",
    supportsSavedToken: false,
    requiresReference: true,
    instructions:
      "Pay with JazzCash and paste the transaction reference before placing the order.",
  },
  {
    id: "EASYPAISA",
    label: "Easypaisa",
    provider: "easypaisa",
    description: "Wallet transfer prepared for gateway integration.",
    accent: "from-cyan-700 to-sky-500",
    badge: "Wallet",
    settlement: "online",
    supportsSavedToken: false,
    requiresReference: true,
    instructions:
      "Pay with Easypaisa and paste the transaction reference before placing the order.",
  },
  {
    id: "DEBIT_CARD",
    label: "Debit Card",
    provider: "card",
    description: "Reusable card gateway slot for future processor integration.",
    accent: "from-indigo-700 to-violet-500",
    badge: "Card",
    settlement: "online",
    supportsSavedToken: true,
    requiresReference: false,
    instructions:
      "Card gateway integration can be attached without changing checkout flows.",
  },
  {
    id: "CREDIT_CARD",
    label: "Credit Card",
    provider: "card",
    description:
      "Securely prepared for hosted checkout or tokenized card capture.",
    accent: "from-blue-700 to-cyan-500",
    badge: "Card",
    settlement: "online",
    supportsSavedToken: true,
    requiresReference: false,
    instructions:
      "Card gateway integration can be attached without changing checkout flows.",
  },
  {
    id: "VISA",
    label: "Visa",
    provider: "card",
    description: "Card-network specific slot for Visa payments.",
    accent: "from-sky-700 to-blue-500",
    badge: "Network",
    settlement: "online",
    supportsSavedToken: true,
    requiresReference: false,
    instructions:
      "Visa payments can be wired into the card gateway adapter later.",
  },
  {
    id: "MASTERCARD",
    label: "Mastercard",
    provider: "card",
    description: "Card-network specific slot for Mastercard payments.",
    accent: "from-amber-700 to-red-500",
    badge: "Network",
    settlement: "online",
    supportsSavedToken: true,
    requiresReference: false,
    instructions:
      "Mastercard payments can be wired into the card gateway adapter later.",
  },
];

export const deliveryMethods: Record<DeliveryMethodId, ShippingQuote> = {
  STANDARD: {
    method: "STANDARD",
    label: "Standard delivery",
    charge: 250,
    estimatedDays: "3-5 business days",
    freeShippingThreshold: 5000,
    description: "Best value for non-urgent deliveries.",
  },
  EXPRESS: {
    method: "EXPRESS",
    label: "Express delivery",
    charge: 450,
    estimatedDays: "1-3 business days",
    freeShippingThreshold: 8000,
    description:
      "Priority delivery for active crop seasons and urgent restocks.",
  },
  PRIORITY: {
    method: "PRIORITY",
    label: "Priority delivery",
    charge: 750,
    estimatedDays: "Same or next business day",
    freeShippingThreshold: 15000,
    description: "Premium dispatch for large or time-sensitive orders.",
  },
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function getPaymentMethodMeta(method: PaymentMethodId) {
  return paymentMethods.find((item) => item.id === method) ?? paymentMethods[0];
}

export function getDeliveryMethod(method: DeliveryMethodId) {
  return deliveryMethods[method] ?? deliveryMethods.STANDARD;
}

export function parseEstimatedDays(value: string) {
  const matches =
    value
      .match(/(\d+)/g)
      ?.map((item) => Number(item))
      .filter((item) => Number.isFinite(item)) ?? [];
  if (matches.length === 0) return { min: 3, max: 5 };
  if (matches.length === 1) return { min: matches[0], max: matches[0] + 1 };
  return {
    min: Math.min(matches[0], matches[1]),
    max: Math.max(matches[0], matches[1]),
  };
}

function addBusinessDays(baseDate: Date, days: number) {
  const result = new Date(baseDate);
  let remaining = Math.max(0, days);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

export function buildEstimatedDeliveryWindow(
  method: DeliveryMethodId,
  zoneDays?: string,
) {
  const days = parseEstimatedDays(
    zoneDays ?? getDeliveryMethod(method).estimatedDays,
  );
  const start = addBusinessDays(new Date(), days.min);
  const end = addBusinessDays(new Date(), days.max);

  return {
    label: `${start.toLocaleDateString("en-PK", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`,
    from: start,
    to: end,
  };
}

export function resolveShippingZone(
  city: string,
  province: string,
  zones: ShippingZoneLike[],
) {
  const normalizedCity = normalizeText(city);
  const normalizedProvince = normalizeText(province);

  return (
    zones.find(
      (zone) =>
        zone.active &&
        zone.cities.some((item) => {
          const normalizedItem = normalizeText(item);
          return (
            normalizedItem === normalizedCity ||
            normalizedItem === normalizedProvince
          );
        }),
    ) ?? null
  );
}

export function calculateCouponDiscount(
  coupon: CouponLike | null,
  subtotal: number,
) {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.discountType === "PERCENT") {
    return Math.min(subtotal, (subtotal * coupon.discountValue) / 100);
  }

  return Math.min(subtotal, coupon.discountValue);
}

export function calculateTax(subtotalAfterDiscount: number, rate: number) {
  if (rate <= 0) return 0;
  return Math.round(subtotalAfterDiscount * rate * 100) / 100;
}

export function calculateShippingCharge(params: {
  subtotal: number;
  deliveryMethod: DeliveryMethodId;
  shippingZone?: ShippingZoneLike | null;
}) {
  const delivery = getDeliveryMethod(params.deliveryMethod);
  const zoneCharge = params.shippingZone?.baseCharge ?? delivery.charge;
  const threshold =
    params.shippingZone?.freeShippingAbove ?? delivery.freeShippingThreshold;
  const charge =
    threshold !== null && params.subtotal >= threshold ? 0 : zoneCharge;

  return {
    method: params.deliveryMethod,
    freeShippingThreshold: threshold,
    charge,
    threshold,
    estimatedDays: params.shippingZone?.estimatedDays ?? delivery.estimatedDays,
    description: params.shippingZone?.name ?? delivery.description,
    label: params.shippingZone?.name
      ? `${params.shippingZone.name} shipping`
      : delivery.label,
  } satisfies ShippingQuote;
}

export function buildQuote(params: {
  items: CheckoutItem[];
  coupon: CouponLike | null;
  shippingZone?: ShippingZoneLike | null;
  deliveryMethod: DeliveryMethodId;
  paymentMethod: PaymentMethodId;
  taxRate?: number;
}) {
  const subtotal = params.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discountTotal = calculateCouponDiscount(params.coupon, subtotal);
  const shipping = calculateShippingCharge({
    subtotal: Math.max(0, subtotal - discountTotal),
    deliveryMethod: params.deliveryMethod,
    shippingZone: params.shippingZone ?? null,
  });
  const taxableAmount = Math.max(0, subtotal - discountTotal + shipping.charge);
  const taxTotal = calculateTax(
    taxableAmount,
    params.taxRate ??
      Number(
        process.env.NEXT_PUBLIC_CHECKOUT_TAX_RATE ??
          process.env.CHECKOUT_TAX_RATE ??
          0,
      ),
  );
  const grandTotal = Math.max(0, taxableAmount + taxTotal);
  const window = buildEstimatedDeliveryWindow(
    params.deliveryMethod,
    shipping.estimatedDays,
  );

  return {
    subtotal,
    discountTotal,
    shippingCharge: shipping.charge,
    taxTotal,
    grandTotal,
    shipping,
    estimatedDelivery: window.label,
    paymentMethod: params.paymentMethod,
    paymentProvider: getPaymentMethodMeta(params.paymentMethod).provider,
  };
}

export function buildStockWarnings(items: CheckoutItem[]) {
  return items
    .filter((item) => item.quantity > item.stock)
    .map((item) => `${item.title} only has ${item.stock} units available.`);
}
