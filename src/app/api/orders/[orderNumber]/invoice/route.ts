import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const session = await auth();
  const key = new URL(request.url).searchParams.get("key") ?? "";

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      address: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const ownedBySession = session?.user?.id && session.user.id === order.userId;
  const canReadAll = hasPermission(session?.user?.role, "orders:read");
  const ownedByKey = Boolean(
    key && order.checkoutKey && key === order.checkoutKey,
  );

  if (!ownedBySession && !ownedByKey && !canReadAll) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = order.address;
  const addressLines = address
    ? [
        escapeHtml(address.fullName),
        escapeHtml(address.line1),
        address.line2 ? escapeHtml(address.line2) : "",
        `${escapeHtml(address.city)}, ${escapeHtml(address.province)}, ${escapeHtml(address.country)}`,
      ]
        .filter(Boolean)
        .join("<br />")
    : "-";

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.sku)}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${formatCurrency(item.price)}</td>
          <td style="text-align:right">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${escapeHtml(order.orderNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #f8fafc; }
      .sheet { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; }
      .head { padding: 28px 32px; background: linear-gradient(135deg, #0f766e, #10b981); color: #fff; }
      .body { padding: 32px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
      .card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
      th { text-align: left; color: #475569; }
      .summary { margin-top: 18px; width: 100%; }
      .summary td { border: none; }
      .muted { color: #64748b; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="head">
        <h1 style="margin:0;font-size:28px">Invoice ${escapeHtml(order.orderNumber)}</h1>
        <p style="margin:8px 0 0">Subhani Agrizone · Growing Trust, Harvesting Success.</p>
      </div>
      <div class="body">
        <div class="grid">
          <div class="card">
            <h2 style="margin-top:0">Customer</h2>
            <p class="muted">${escapeHtml(order.user?.name ?? address?.fullName ?? "Customer")}</p>
            <p class="muted">${escapeHtml(order.user?.email ?? "-")}</p>
          </div>
          <div class="card">
            <h2 style="margin-top:0">Shipping address</h2>
            <p class="muted">${addressLines}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Price</th>
              <th style="text-align:right">Line total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <table class="summary">
          <tbody>
            <tr><td class="muted">Subtotal</td><td style="text-align:right">${formatCurrency(order.subtotal)}</td></tr>
            <tr><td class="muted">Shipping</td><td style="text-align:right">${order.shippingCharge ? formatCurrency(order.shippingCharge) : "Free"}</td></tr>
            <tr><td class="muted">Discount</td><td style="text-align:right">-${formatCurrency(order.discountTotal)}</td></tr>
            <tr><td class="muted">Tax</td><td style="text-align:right">${formatCurrency(order.taxTotal)}</td></tr>
            <tr><td style="font-weight:700;padding-top:18px">Grand total</td><td style="text-align:right;font-weight:700;padding-top:18px">${formatCurrency(order.grandTotal)}</td></tr>
          </tbody>
        </table>

        <p class="muted" style="margin-top:24px">Payment method: ${escapeHtml(order.paymentMethod)} · Payment status: ${escapeHtml(order.paymentStatus)} · Estimated delivery: ${escapeHtml(order.estimatedDelivery ?? "-")}</p>
        <p class="muted">Transaction ID: ${escapeHtml(order.paymentReference ?? "-")} · Tracking ID: ${escapeHtml(order.trackingNumber ?? "-")}</p>
      </div>
    </div>
  </body>
  </html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="invoice-${order.orderNumber}.html"`,
      "cache-control": "no-store",
    },
  });
}
