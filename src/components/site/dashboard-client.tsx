"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Download,
  Gift,
  Heart,
  Home,
  MapPin,
  PackageSearch,
  ReceiptText,
  Save,
  Star,
  Ticket,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import {
  addToCart,
  getCartCount,
  getWishlistIds,
  subscribeToCommerceStore,
} from "@/lib/commerce-store";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function DashboardClient() {
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<
    { title: string; body: string; readAt?: string | null }[]
  >([]);
  const [summary, setSummary] = useState<{
    addressCount: number;
    rewardPoints: number;
    orderCount: number;
    defaultAddress: {
      label: string;
      fullName: string;
      phone: string;
      line1: string;
      line2?: string | null;
      city: string;
      province: string;
      postalCode?: string | null;
      country: string;
    } | null;
    recentOrders: {
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      paymentMethod: string;
      paymentReference?: string | null;
      trackingNumber?: string | null;
      grandTotal: number;
      city: string;
      createdAt: string;
    }[];
  } | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const syncCommerce = () => {
      setWishlistIds(getWishlistIds());
      setCartCount(getCartCount());
    };

    async function load() {
      try {
        const [profileRes, notificationsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/notifications"),
        ]);
        const profileData = await profileRes.json();
        const notificationData = await notificationsRes.json();
        setProfile(profileData.user ?? null);
        setSummary(profileData.summary ?? null);
        setNotifications(notificationData.notifications ?? []);
      } catch {
        setMessage("Unable to load profile data right now.");
      }
    }

    syncCommerce();
    load();
    return subscribeToCommerceStore(syncCommerce);
  }, []);

  const wishlistProducts = products.filter((product) =>
    wishlistIds.includes(product.id),
  );

  const accountTiles = [
    {
      label: "Saved addresses",
      value: String(summary?.addressCount ?? 0),
      icon: MapPin,
    },
    {
      label: "Reward points",
      value: String(summary?.rewardPoints ?? 0),
      icon: Gift,
    },
    {
      label: "Wishlist items",
      value: String(wishlistIds.length),
      icon: Heart,
    },
    {
      label: "Cart items",
      value: String(cartCount),
      icon: Ticket,
    },
  ];

  const recentOrders = summary?.recentOrders ?? [];
  const uniquePaymentMethods = Array.from(
    new Set(recentOrders.map((order) => order.paymentMethod)),
  );

  async function reorder(orderNumber: string) {
    setMessage("");
    try {
      const response = await fetch("/api/orders");
      const result = (await response.json()) as {
        orders?: {
          orderNumber: string;
          items: { productId: string; quantity: number }[];
        }[];
        error?: string;
      };

      if (!response.ok || !result.orders) {
        setMessage(result.error ?? "Unable to reorder right now.");
        return;
      }

      const target = result.orders.find(
        (order) => order.orderNumber === orderNumber,
      );
      if (!target) {
        setMessage("Order not found for reorder.");
        return;
      }

      for (const item of target.items) {
        addToCart(item.productId, item.quantity);
      }

      setMessage(`Items from ${orderNumber} were added to your cart.`);
    } catch {
      setMessage("Unable to reorder right now.");
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        image: String(formData.get("image") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });
    const result = await response.json();
    setLoading(false);
    setMessage(
      response.ok ? "Profile updated." : (result.error ?? "Update failed."),
    );
  }

  return (
    <section className="section-padding">
      <div className="container space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Customer dashboard
            </h1>
          </div>
          <Button asChild variant="luxury">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accountTiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <tile.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-2xl font-bold">{tile.value}</p>
              <p className="text-sm text-muted-foreground">{tile.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            id="orders"
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-normal">
                  Order tracking
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent purchases and current shipment status.
                </p>
              </div>
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 font-semibold">Order</th>
                    <th className="py-3 font-semibold">Customer</th>
                    <th className="py-3 font-semibold">City</th>
                    <th className="py-3 font-semibold">Total</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold">Transaction ID</th>
                    <th className="py-3 font-semibold">Tracking ID</th>
                    <th className="py-3 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4 font-semibold">
                        {order.orderNumber}
                      </td>
                      <td className="py-4">{profile?.name ?? "-"}</td>
                      <td className="py-4">{order.city}</td>
                      <td className="py-4">
                        {formatCurrency(order.grandTotal)}
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{order.status}</Badge>
                      </td>
                      <td className="py-4 text-xs text-muted-foreground">
                        {order.paymentReference || "-"}
                      </td>
                      <td className="py-4 text-xs text-muted-foreground">
                        {order.trackingNumber || "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/api/orders/${order.orderNumber}/invoice`}
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void reorder(order.orderNumber)}
                          >
                            Reorder
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {summary?.recentOrders?.length ? null : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <ReceiptText className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-xl font-bold tracking-normal">
                Referral balance
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Reward points now reflect real qualifying purchases instead of
                demo values.
              </p>
              <p className="mt-4 text-2xl font-bold">
                {summary?.rewardPoints ?? 0} pts
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <Home className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-xl font-bold tracking-normal">
                Default address
              </h2>
              {summary?.defaultAddress ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {summary.defaultAddress.line1}
                  {summary.defaultAddress.line2
                    ? `, ${summary.defaultAddress.line2}`
                    : ""}
                  {`, ${summary.defaultAddress.city}, ${summary.defaultAddress.province}, ${summary.defaultAddress.country}`}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No saved address yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div
            id="profile"
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-normal">
                Profile & notifications
              </h2>
            </div>
            <form onSubmit={saveProfile} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Profile image URL
                <Input
                  name="image"
                  defaultValue={profile?.image ?? ""}
                  placeholder="https://..."
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Full name
                <Input
                  name="name"
                  defaultValue={profile?.name ?? ""}
                  placeholder="Your name"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <Input
                  name="email"
                  type="email"
                  defaultValue={profile?.email ?? ""}
                  placeholder="you@example.com"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Phone
                <Input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="03007172382"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                New password
                <Input
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                />
              </label>
              {message ? (
                <p className="rounded-md bg-muted px-3 py-2 text-sm">
                  {message}
                </p>
              ) : null}
              <Button disabled={loading} type="submit" variant="luxury">
                <Save className="h-4 w-4" />
                {loading ? "Updating..." : "Save profile"}
              </Button>
            </form>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-normal">
                Recent notifications
              </h2>
            </div>
            <div className="mt-5 space-y-3">
              {notifications.length === 0 ? (
                <p className="rounded-md bg-muted px-3 py-3 text-sm text-muted-foreground">
                  You have no notifications yet.
                </p>
              ) : (
                notifications.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-lg border border-border p-4"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="wishlist" className="space-y-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-normal">Wishlist</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {wishlistProducts.length === 0 ? (
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              Your wishlist is empty right now.
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: PackageSearch,
              label: "Recent orders",
              value: `${recentOrders.length} tracked`,
            },
            {
              icon: Star,
              label: "Saved payment methods",
              value:
                uniquePaymentMethods.length > 0
                  ? `${uniquePaymentMethods.length} used`
                  : "No methods yet",
            },
            {
              icon: Bell,
              label: "Order alerts",
              value:
                notifications.length > 0
                  ? `${notifications.length} updates`
                  : "No alerts yet",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 font-semibold">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}
