"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Save, Truck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference?: string | null;
  grandTotal: number;
  trackingNumber: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  address?: {
    city?: string | null;
    fullName?: string | null;
    phone?: string | null;
    line1?: string | null;
    line2?: string | null;
    province?: string | null;
    country?: string | null;
  } | null;
  items?: {
    productName: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  notes?: string | null;
};

const ORDER_STATUS_OPTIONS = [
  { label: "In Query", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "On The Way", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "UNPAID" },
  { label: "Paid", value: "PAID" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

export function AdminOrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeOrder, setActiveOrder] = useState<OrderRow | null>(null);

  async function loadOrders() {
    setLoading(true);
    const response = await fetch("/api/orders?all=1");
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to load orders.");
      return;
    }

    setOrders(result.orders ?? []);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function saveOrder(order: OrderRow) {
    setSavingId(order.id);
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber ?? "",
      }),
    });

    const result = await response.json();
    setSavingId(null);

    if (!response.ok) {
      setMessage(result.error ?? "Order update failed.");
      return;
    }

    setMessage(`Order ${order.orderNumber} updated.`);
    void loadOrders();
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">
          Orders Management
        </h1>
        <Truck className="h-5 w-5 text-primary" />
      </div>

      {message ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-3 font-semibold">Order</th>
              <th className="py-3 font-semibold">Customer</th>
              <th className="py-3 font-semibold">City</th>
              <th className="py-3 font-semibold">Total</th>
              <th className="py-3 font-semibold">Transaction ID</th>
              <th className="py-3 font-semibold">Order Stage</th>
              <th className="py-3 font-semibold">Payment</th>
              <th className="py-3 font-semibold">Tracking #</th>
              <th className="py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading orders...
                </td>
              </tr>
            ) : null}

            {!loading && !orders.length ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            ) : null}

            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0"
              >
                <td className="py-4">
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </td>
                <td className="py-4">
                  <p>{order.user?.name || "Customer"}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.user?.email || order.user?.phone || "-"}
                  </p>
                </td>
                <td className="py-4">{order.address?.city || "-"}</td>
                <td className="py-4 font-semibold">
                  {formatCurrency(order.grandTotal)}
                </td>
                <td className="py-4 text-xs text-muted-foreground">
                  {order.paymentReference || "-"}
                </td>
                <td className="py-4">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      setOrders((prev) =>
                        prev.map((row) =>
                          row.id === order.id
                            ? { ...row, status: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(event) =>
                      setOrders((prev) =>
                        prev.map((row) =>
                          row.id === order.id
                            ? { ...row, paymentStatus: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4">
                  <input
                    value={order.trackingNumber ?? ""}
                    onChange={(event) =>
                      setOrders((prev) =>
                        prev.map((row) =>
                          row.id === order.id
                            ? { ...row, trackingNumber: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className="h-9 w-44 rounded-md border border-input bg-background px-2 text-xs"
                    placeholder="Courier tracking"
                  />
                </td>
                <td className="py-4">
                  <Button
                    size="sm"
                    variant="luxury"
                    disabled={savingId === order.id}
                    onClick={() => saveOrder(order)}
                  >
                    {savingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => setActiveOrder(order)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER_STATUS_OPTIONS.map((item) => (
          <Badge key={item.value} variant="secondary">
            {item.label}
          </Badge>
        ))}
      </div>

      {activeOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Order details
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {activeOrder.orderNumber}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`/api/orders/${activeOrder.orderNumber}/invoice`}>
                    <Download className="h-4 w-4" />
                    Invoice
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setActiveOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Customer</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeOrder.user?.name || "Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeOrder.user?.email || activeOrder.user?.phone || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Payment</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Method: {activeOrder.paymentMethod}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {activeOrder.paymentStatus}
                </p>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {activeOrder.paymentReference || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Shipping address</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeOrder.address?.fullName ||
                    activeOrder.user?.name ||
                    "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeOrder.address?.line1 || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[
                    activeOrder.address?.line2,
                    activeOrder.address?.city,
                    activeOrder.address?.province,
                    activeOrder.address?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone:{" "}
                  {activeOrder.address?.phone || activeOrder.user?.phone || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Tracking</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tracking ID: {activeOrder.trackingNumber || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stage: {activeOrder.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ordered: {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Items</p>
              <div className="mt-3 space-y-3">
                {(activeOrder.items ?? []).map((item) => (
                  <div
                    key={`${item.sku}-${item.productName}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/35 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <div className="text-right text-muted-foreground">
                      <p>Qty: {item.quantity}</p>
                      <p>{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeOrder.notes ? (
              <div className="mt-6 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Notes</p>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {activeOrder.notes}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
