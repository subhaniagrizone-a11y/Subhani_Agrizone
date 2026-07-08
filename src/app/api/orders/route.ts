import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { auth } from "@/lib/auth";
import { requireApiPermission } from "@/lib/api-guard";
import { getCsrfCookieName, verifyCsrf } from "@/lib/csrf";
import { siteConfig } from "@/lib/data";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hasPermission } from "@/lib/rbac";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize";
import {
  buildQuote,
  buildStockWarnings,
  getDeliveryMethod,
  getPaymentMethodMeta,
  resolveShippingZone,
  type CheckoutAddress,
  type CheckoutItem,
  type DeliveryMethodId,
  type PaymentMethodId,
} from "@/lib/checkout";
import { getPaymentGatewayAdapter } from "@/lib/payment-gateways";
import { sendOrderAdminAlert, sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderWhatsAppNotification } from "@/lib/notifications";
import { checkoutOrderSchema } from "@/lib/validators";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "PARTIAL",
  "FAILED",
  "REFUNDED",
] as const;

function createOrderNumber() {
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `SA-${Date.now()}-${random}`;
}

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "orders"
  );
}

function normalizeReference(value: string | undefined | null) {
  return typeof value === "string" ? value.trim() : "";
}

function addressFromPayload(address: CheckoutAddress) {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode || null,
    country: address.country,
    saveAsDefault: Boolean(address.saveAsDefault),
  };
}

function addressSnapshot(address: {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}) {
  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeAllRequested = searchParams.get("all") === "1";
  const canReadAll = hasPermission(session.user.role, "orders:read");
  const includeAll = includeAllRequested && canReadAll;

  const orders = await prisma.order.findMany({
    where: includeAll ? {} : { userId: session.user.id },
    include: {
      items: true,
      address: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: includeAll ? 200 : 20,
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const blocked = await requireApiPermission("orders:write");
  if (blocked) return blocked;

  const payload = (await request.json()) as {
    orderId?: string;
    status?: string;
    paymentStatus?: string;
    trackingNumber?: string;
  };

  if (!payload.orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 422 });
  }

  const nextStatus = payload.status?.toUpperCase();
  const nextPaymentStatus = payload.paymentStatus?.toUpperCase();

  if (
    nextStatus &&
    !ORDER_STATUSES.includes(nextStatus as (typeof ORDER_STATUSES)[number])
  ) {
    return NextResponse.json(
      { error: "Invalid order status" },
      { status: 422 },
    );
  }

  if (
    nextPaymentStatus &&
    !PAYMENT_STATUSES.includes(
      nextPaymentStatus as (typeof PAYMENT_STATUSES)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Invalid payment status" },
      { status: 422 },
    );
  }

  const order = await prisma.order.update({
    where: { id: payload.orderId },
    data: {
      ...(nextStatus ? { status: nextStatus as any } : {}),
      ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus as any } : {}),
      ...(typeof payload.trackingNumber === "string"
        ? { trackingNumber: payload.trackingNumber || null }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, order });
}

export async function POST(request: Request) {
  const limiter = rateLimit(
    `order-checkout:${getClientKey(request)}`,
    20,
    60_000,
  );
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts" },
      { status: 429 },
    );
  }

  const session = await auth();

  const csrfCookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getCsrfCookieName()}=`))
      ?.split("=")[1] ?? null;
  if (!verifyCsrf(request, csrfCookie)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = checkoutOrderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout details",
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const {
    items,
    billingAddress,
    shippingAddress,
    shippingAddressId,
    billingAddressId,
    paymentMethod,
    paymentProvider,
    transactionReference,
    notes,
    couponCode,
    deliveryMethod,
    sameAsShipping,
    customer,
    checkoutKey,
  } = parsed.data;

  const shippingInput = shippingAddress ?? billingAddress ?? undefined;

  if (!shippingInput) {
    return NextResponse.json(
      { error: "Shipping address is required" },
      { status: 422 },
    );
  }

  const normalizedCheckoutKey = normalizeReference(checkoutKey);
  if (normalizedCheckoutKey) {
    const existing = await prisma.order.findUnique({
      where: { checkoutKey: normalizedCheckoutKey },
      include: {
        items: true,
        address: true,
      },
    });

    if (existing) {
      return NextResponse.json({ ok: true, order: existing }, { status: 200 });
    }
  }

  const normalizedCustomerEmail = sanitizeEmail(customer?.email ?? "");
  const normalizedCustomerPhone = sanitizePhone(
    customer?.phone ?? shippingInput.phone,
  );
  const normalizedCustomerName = sanitizeText(
    customer?.name ?? shippingInput.fullName,
  );
  const normalizedPaymentReference = normalizeReference(transactionReference);
  const normalizedCouponCode = normalizeReference(couponCode).toUpperCase();
  const resolvedPaymentMethod = paymentMethod as PaymentMethodId;
  const resolvedDeliveryMethod = deliveryMethod as DeliveryMethodId;

  const paymentMeta = getPaymentMethodMeta(resolvedPaymentMethod);
  if (paymentMeta.requiresReference && !normalizedPaymentReference) {
    return NextResponse.json(
      { error: `${paymentMeta.label} requires a transaction reference.` },
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
  if (stockIssues.length > 0) {
    return NextResponse.json(
      { error: stockIssues[0], details: stockIssues },
      { status: 409 },
    );
  }

  const shippingZones = await prisma.shippingZone.findMany({
    where: { active: true },
  });
  const shippingZone = resolveShippingZone(
    shippingInput.city,
    shippingInput.province,
    shippingZones,
  );

  const coupon = normalizedCouponCode
    ? await prisma.coupon.findUnique({ where: { code: normalizedCouponCode } })
    : null;

  if (
    normalizedCouponCode &&
    (!coupon ||
      !coupon.active ||
      coupon.startsAt > new Date() ||
      coupon.endsAt < new Date() ||
      (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit))
  ) {
    return NextResponse.json(
      { error: "Coupon code is invalid or expired." },
      { status: 422 },
    );
  }

  const quote = buildQuote({
    items: checkoutItems,
    coupon,
    shippingZone,
    deliveryMethod: resolvedDeliveryMethod,
    paymentMethod: resolvedPaymentMethod,
  });

  let userId = session?.user?.id ?? null;
  let userRecord: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null = null;

  if (userId) {
    userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });
  } else {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normalizedCustomerEmail
            ? [{ email: normalizedCustomerEmail }]
            : []),
          ...(normalizedCustomerPhone
            ? [{ phone: normalizedCustomerPhone }]
            : []),
        ],
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (existing) {
      userRecord = existing;
      userId = existing.id;
    } else {
      const password =
        customer?.createAccount &&
        typeof customer?.password === "string" &&
        customer.password.length >= 8
          ? await hash(customer.password, 12)
          : null;

      userRecord = await prisma.user.create({
        data: {
          name: normalizedCustomerName,
          email: normalizedCustomerEmail || null,
          phone: normalizedCustomerPhone || null,
          passwordHash: password,
          role: "CUSTOMER",
        },
        select: { id: true, name: true, email: true, phone: true },
      });
      userId = userRecord.id;
    }
  }

  if (!userId || !userRecord) {
    return NextResponse.json(
      { error: "Unable to resolve customer account for checkout." },
      { status: 422 },
    );
  }

  const shippingAddressRecord = await prisma.$transaction(async (tx) => {
    if (shippingAddressId) {
      const saved = await tx.address.findFirst({
        where: { id: shippingAddressId, userId },
      });

      if (saved) return saved;
    }

    if (shippingInput.saveAsDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        ...addressFromPayload(shippingInput),
      },
    });
  });

  const billingAddressSource =
    sameAsShipping || !billingAddress ? shippingInput : billingAddress;

  const billingAddressRecord = await prisma.$transaction(async (tx) => {
    if (sameAsShipping) {
      return shippingAddressRecord;
    }

    if (billingAddressId) {
      const saved = await tx.address.findFirst({
        where: { id: billingAddressId, userId },
      });

      if (saved) return saved;
    }

    return tx.address.create({
      data: {
        userId,
        ...addressFromPayload(billingAddressSource),
      },
    });
  });

  const paymentGateway = getPaymentGatewayAdapter(resolvedPaymentMethod);
  const orderNumber = createOrderNumber();
  const paymentSession = await paymentGateway.preparePayment({
    orderNumber,
    amount: quote.grandTotal,
    currency: "PKR",
    method: resolvedPaymentMethod,
    customerEmail: userRecord.email,
    customerPhone: userRecord.phone,
  });

  const paymentReference =
    normalizedPaymentReference || paymentSession.providerReference;

  let order:
    | Awaited<ReturnType<typeof prisma.order.create>>
    | Awaited<ReturnType<typeof prisma.order.findUnique>>
    | null = null;

  try {
    order = await prisma.$transaction(async (tx) => {
      const duplicate = normalizedCheckoutKey
        ? await tx.order.findUnique({
            where: { checkoutKey: normalizedCheckoutKey },
            include: { items: true, address: true },
          })
        : null;

      if (duplicate) return duplicate;

      for (const item of checkoutItems) {
        const reserve = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (reserve.count === 0) {
          throw new Error(`Stock reservation failed for ${item.title}`);
        }
      }

      const created = await tx.order.create({
        data: {
          checkoutKey: normalizedCheckoutKey || null,
          orderNumber,
          userId,
          addressId: shippingAddressRecord.id,
          paymentMethod: resolvedPaymentMethod,
          paymentProvider: paymentProvider ?? paymentMeta.provider,
          paymentReference,
          paymentStatus: resolvedPaymentMethod === "COD" ? "UNPAID" : "UNPAID",
          status: "PENDING",
          shippingZone:
            shippingZone?.name ??
            getDeliveryMethod(resolvedDeliveryMethod).label,
          deliveryMethod: resolvedDeliveryMethod,
          shippingCharge: quote.shippingCharge,
          subtotal: quote.subtotal,
          discountTotal: quote.discountTotal,
          taxTotal: quote.taxTotal,
          grandTotal: quote.grandTotal,
          currency: "PKR",
          estimatedDelivery: quote.estimatedDelivery,
          couponCode: normalizedCouponCode || null,
          notes:
            [
              notes,
              normalizedPaymentReference
                ? `Payment reference: ${normalizedPaymentReference}`
                : undefined,
            ]
              .filter(Boolean)
              .join("\n") || null,
          shippingAddress: {
            ...addressSnapshot(shippingAddressRecord),
          },
          billingAddress: {
            ...addressSnapshot(billingAddressRecord),
          },
          checkoutSnapshot: {
            items: checkoutItems,
            shippingAddress: addressSnapshot(shippingAddressRecord),
            billingAddress: addressSnapshot(billingAddressRecord),
            quote,
            deliveryMethod: resolvedDeliveryMethod,
            paymentMethod: resolvedPaymentMethod,
            paymentProvider: paymentProvider ?? paymentMeta.provider,
          },
          items: {
            create: checkoutItems.map((item) => ({
              productId: item.productId,
              productName: item.title,
              sku: item.sku,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      if (coupon && couponCode) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    if (message.toLowerCase().includes("stock reservation failed")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    throw error;
  }

  if (!order) {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 },
    );
  }

  await Promise.allSettled([
    ...(userRecord.email
      ? [
          sendOrderConfirmationEmail({
            to: userRecord.email,
            name: userRecord.name ?? normalizedCustomerName,
            orderNumber: order.orderNumber,
            grandTotal: order.grandTotal,
            estimatedDelivery: quote.estimatedDelivery,
            trackUrl: `${siteConfig.url}/dashboard#orders`,
          }),
        ]
      : []),
    sendOrderAdminAlert({
      orderNumber: order.orderNumber,
      customerName: userRecord.name ?? normalizedCustomerName,
      grandTotal: order.grandTotal,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: order.paymentStatus,
    }),
    sendOrderWhatsAppNotification({
      orderNumber: order.orderNumber,
      customerName: userRecord.name ?? normalizedCustomerName,
      customerPhone: userRecord.phone ?? normalizedCustomerPhone,
      grandTotal: order.grandTotal,
      estimatedDelivery: quote.estimatedDelivery,
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId,
      title: `Order ${order.orderNumber} confirmed`,
      body: `Your order is being processed. Estimated delivery: ${quote.estimatedDelivery}.`,
      channel: "email",
    },
  });

  return NextResponse.json(
    {
      ok: true,
      order,
      payment: {
        method: resolvedPaymentMethod,
        provider: paymentProvider ?? paymentMeta.provider,
        reference: paymentReference,
        session: paymentSession,
        bankName: siteConfig.payment.bankName,
        accountTitle: siteConfig.payment.accountTitle,
        iban: siteConfig.payment.iban,
        accountNumber: siteConfig.payment.accountNumber,
      },
      estimatedDelivery: quote.estimatedDelivery,
      message:
        getPaymentMethodMeta(resolvedPaymentMethod).settlement === "offline"
          ? "Order placed successfully. You can pay cash on delivery."
          : "Order placed. Please complete payment and keep your transaction reference ready for verification.",
    },
    { status: 201 },
  );
}
