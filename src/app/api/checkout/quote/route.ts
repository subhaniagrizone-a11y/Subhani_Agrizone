import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  buildQuote,
  buildStockWarnings,
  type CheckoutItem,
  type DeliveryMethodId,
  type PaymentMethodId,
  resolveShippingZone,
} from "@/lib/checkout";
import { checkoutOrderSchema } from "@/lib/validators";

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "checkout-quote"
  );
}

export async function POST(request: Request) {
  const limiter = rateLimit(
    `checkout-quote:${getClientKey(request)}`,
    30,
    60_000,
  );
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many quote requests" },
      { status: 429 },
    );
  }

  const payload = await request.json();
  const parsed = checkoutOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const {
    items,
    shippingAddress,
    billingAddress,
    deliveryMethod,
    paymentMethod,
    couponCode,
  } = parsed.data;
  const resolvedAddress = shippingAddress ?? billingAddress;

  if (!resolvedAddress) {
    return NextResponse.json(
      { error: "Shipping address is required" },
      { status: 422 },
    );
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((item) => item.productId) },
      status: { in: ["ACTIVE", "DRAFT"] },
    },
    select: {
      id: true,
      title: true,
      sku: true,
      stock: true,
      price: true,
      salePrice: true,
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const checkoutItems: CheckoutItem[] = items.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: item.productId,
      title: product?.title ?? "Unavailable product",
      sku: product?.sku ?? "-",
      quantity: item.quantity,
      unitPrice: product ? (product.salePrice ?? product.price) : 0,
      stock: product?.stock ?? 0,
    };
  });

  const stockIssues = buildStockWarnings(checkoutItems);
  const shippingZone = resolveShippingZone(
    resolvedAddress.city,
    resolvedAddress.province,
    await prisma.shippingZone.findMany({ where: { active: true } }),
  );

  let coupon = null;
  if (couponCode) {
    const candidate = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (
      candidate &&
      candidate.active &&
      candidate.startsAt <= new Date() &&
      candidate.endsAt >= new Date() &&
      (candidate.usageLimit === null ||
        candidate.usedCount < candidate.usageLimit)
    ) {
      coupon = candidate;
    }
  }

  const quote = buildQuote({
    items: checkoutItems,
    coupon,
    shippingZone,
    deliveryMethod: deliveryMethod as DeliveryMethodId,
    paymentMethod: paymentMethod as PaymentMethodId,
  });

  const warnings = [
    ...stockIssues,
    ...(couponCode && !coupon ? ["Coupon code is invalid or inactive."] : []),
  ];

  return NextResponse.json({
    ok: warnings.length === 0,
    warnings,
    quote: {
      ...quote,
      items: checkoutItems,
      coupon: coupon
        ? {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            amount: quote.discountTotal,
          }
        : null,
    },
  });
}
