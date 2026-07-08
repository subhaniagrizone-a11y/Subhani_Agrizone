import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

import { prisma } from "@/lib/db";
import { getPaymentGatewayAdapter } from "@/lib/payment-gateways";
import { rateLimit } from "@/lib/rate-limit";
import {
  sendPaymentFailureAdminAlert,
  sendPaymentStatusUpdateEmail,
} from "@/lib/email";

function getSignature(request: Request) {
  return (
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-webhook-signature")
  );
}

function safeEqual(leftValue: string | null, rightValue: string | null) {
  if (!leftValue || !rightValue) return false;
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const limiter = rateLimit("payment-webhook", 120, 60_000);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many webhook calls" },
      { status: 429 },
    );
  }

  const signature = getSignature(request);
  const raw = await request.text();

  let payload: {
    orderNumber?: string;
    provider?: string;
    paymentStatus?: string;
    status?: string;
    reference?: string;
    signature?: string;
  };

  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 422 },
    );
  }

  const orderNumber =
    typeof payload.orderNumber === "string" ? payload.orderNumber : "";
  const provider =
    typeof payload.provider === "string" ? payload.provider : "card";
  const nextStatus = String(
    payload.paymentStatus ?? payload.status ?? "",
  ).toUpperCase();

  if (!orderNumber) {
    return NextResponse.json(
      { error: "orderNumber is required" },
      { status: 422 },
    );
  }

  const adapter = getPaymentGatewayAdapter(
    provider === "jazzcash"
      ? "JAZZCASH"
      : provider === "easypaisa"
        ? "EASYPAISA"
        : provider === "offline"
          ? "COD"
          : "CREDIT_CARD",
  );

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET ?? null;
  const validSignature =
    safeEqual(signature, webhookSecret) ||
    (adapter.verifyWebhook ? adapter.verifyWebhook(raw, signature) : false);

  if (!validSignature) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const paymentStatus =
    nextStatus === "PAID" || nextStatus === "CAPTURED"
      ? "PAID"
      : nextStatus === "FAILED"
        ? "FAILED"
        : nextStatus === "UNPAID"
          ? "UNPAID"
          : "PARTIAL";

  const updated = await prisma.order.update({
    where: { orderNumber },
    data: {
      paymentStatus,
      paymentReference:
        typeof payload.reference === "string"
          ? payload.reference
          : order.paymentReference,
      status: paymentStatus === "PAID" ? "CONFIRMED" : order.status,
    },
  });

  const orderWithUser = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (orderWithUser?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: orderWithUser.user.id,
        title: `Payment ${paymentStatus} for ${orderNumber}`,
        body:
          paymentStatus === "PAID"
            ? "Your payment is verified and order is now confirmed."
            : paymentStatus === "FAILED"
              ? "Payment failed. Please retry with another method."
              : "Payment status has been updated.",
        channel: "email",
      },
    });
  }

  await Promise.allSettled([
    ...(orderWithUser?.user?.email
      ? [
          sendPaymentStatusUpdateEmail({
            to: orderWithUser.user.email,
            name: orderWithUser.user.name ?? "Customer",
            orderNumber,
            paymentStatus,
            paymentMethod: order.paymentMethod,
            trackUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard#orders`,
          }),
        ]
      : []),
    ...(paymentStatus === "FAILED"
      ? [
          sendPaymentFailureAdminAlert({
            orderNumber,
            paymentMethod: order.paymentMethod,
            reason: "Webhook status update reported failed payment",
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true, order: updated });
}
