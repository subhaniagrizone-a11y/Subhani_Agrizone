"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CircleAlert,
  CircleCheckBig,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clearCart,
  getCart,
  subscribeToCommerceStore,
} from "@/lib/commerce-store";
import {
  buildQuote,
  buildStockWarnings,
  deliveryMethods,
  getDeliveryMethod,
  getPaymentMethodMeta,
  paymentMethods,
  type CheckoutAddress,
  type CheckoutItem,
  type DeliveryMethodId,
  type PaymentMethodId,
} from "@/lib/checkout";
import { fetchProductsByIds } from "@/lib/product-normalize";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

type AddressForm = CheckoutAddress;
type SavedAddress = CheckoutAddress & { id: string; isDefault?: boolean };

type CheckoutDraft = {
  shippingAddress: AddressForm;
  billingAddress: AddressForm;
  sameAsShipping: boolean;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethodId;
  deliveryMethod: DeliveryMethodId;
  couponCode: string;
  transactionReference: string;
  notes: string;
  createAccount: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPassword: string;
  checkoutKey: string;
};

type CheckoutQuote = ReturnType<typeof buildQuote> & {
  items: CheckoutItem[];
  coupon: { code: string; amount: number; description?: string | null } | null;
};

const STORAGE_KEY = "subhani:checkout-draft:v2";

const emptyAddress: AddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "Punjab",
  postalCode: "",
  country: "Pakistan",
  saveAsDefault: true,
};

const defaultDraft: CheckoutDraft = {
  shippingAddress: { ...emptyAddress },
  billingAddress: { ...emptyAddress },
  sameAsShipping: true,
  shippingAddressId: "",
  billingAddressId: "",
  paymentMethod: "COD",
  deliveryMethod: "STANDARD",
  couponCode: "",
  transactionReference: "",
  notes: "",
  createAccount: false,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerPassword: "",
  checkoutKey:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}`,
};

function readDraft(): CheckoutDraft {
  if (typeof window === "undefined") return defaultDraft;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft;
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      ...defaultDraft,
      ...parsed,
      shippingAddress: {
        ...defaultDraft.shippingAddress,
        ...(parsed.shippingAddress ?? {}),
      },
      billingAddress: {
        ...defaultDraft.billingAddress,
        ...(parsed.billingAddress ?? {}),
      },
    };
  } catch {
    return defaultDraft;
  }
}

function PaymentIcon({ method }: { method: PaymentMethodId }) {
  const meta = getPaymentMethodMeta(method);
  const iconClass = "h-5 w-5 text-primary";

  switch (meta.id) {
    case "COD":
      return <Truck className={iconClass} />;
    case "BANK_TRANSFER":
      return <Landmark className={iconClass} />;
    case "JAZZCASH":
    case "EASYPAISA":
      return <Smartphone className={iconClass} />;
    default:
      return <CreditCard className={iconClass} />;
  }
}

function AddressCardActions({
  onUse,
  onEdit,
}: {
  onUse: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={onUse}>
        Use
      </Button>
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
}

function AddressFormFields({
  value,
  onChange,
}: {
  value: AddressForm;
  onChange: (next: AddressForm) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
        Label
        <Input
          value={value.label}
          onChange={(event) =>
            onChange({ ...value, label: event.target.value })
          }
          placeholder="Home, Farm, Office"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
        Full name
        <Input
          required
          value={value.fullName}
          onChange={(event) =>
            onChange({ ...value, fullName: event.target.value })
          }
          placeholder="Muhammad Ali"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Phone
        <Input
          required
          value={value.phone}
          onChange={(event) =>
            onChange({ ...value, phone: event.target.value })
          }
          placeholder="0300xxxxxxx"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Country
        <Input
          required
          value={value.country}
          onChange={(event) =>
            onChange({ ...value, country: event.target.value })
          }
          placeholder="Pakistan"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
        Address line 1
        <Input
          required
          value={value.line1}
          onChange={(event) =>
            onChange({ ...value, line1: event.target.value })
          }
          placeholder="House / street / village"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
        Address line 2
        <Input
          value={value.line2 ?? ""}
          onChange={(event) =>
            onChange({ ...value, line2: event.target.value })
          }
          placeholder="Apartment, tehsil, or landmark"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        City
        <Input
          required
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          placeholder="Gujranwala"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Province
        <Input
          required
          value={value.province}
          onChange={(event) =>
            onChange({ ...value, province: event.target.value })
          }
          placeholder="Punjab"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Postal code
        <Input
          value={value.postalCode ?? ""}
          onChange={(event) =>
            onChange({ ...value, postalCode: event.target.value })
          }
          placeholder="50000"
        />
      </label>
      <label className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-semibold sm:col-span-2">
        Save as default address
        <input
          type="checkbox"
          checked={value.saveAsDefault ?? true}
          onChange={(event) =>
            onChange({ ...value, saveAsDefault: event.target.checked })
          }
          className="h-4 w-4 rounded border-border"
        />
      </label>
    </div>
  );
}

export function CheckoutPageClient() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [draft, setDraft] = useState<CheckoutDraft>(() =>
    typeof window === "undefined" ? defaultDraft : readDraft(),
  );
  const hasHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteWarnings, setQuoteWarnings] = useState<string[]>([]);
  const [quoteError, setQuoteError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [successOrder, setSuccessOrder] = useState<{
    checkoutKey: string;
    orderNumber: string;
    paymentStatus: string;
    estimatedDelivery: string;
    payment: {
      reference?: string;
      provider?: string;
      session?: { status?: string; instructions?: string[] };
    };
    order: {
      subtotal: number;
      shippingCharge: number;
      discountTotal: number;
      taxTotal: number;
      grandTotal: number;
      address?: {
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
      items: {
        productName: string;
        sku: string;
        quantity: number;
        price: number;
      }[];
    };
  } | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hasHydrated]);

  useEffect(() => {
    async function loadCheckoutSession() {
      try {
        const response = await fetch("/api/checkout/session");
        if (!response.ok) return;
        const data = (await response.json()) as { csrfToken?: string };
        if (typeof data.csrfToken === "string") {
          setCsrfToken(data.csrfToken);
        }
      } catch {
        setCsrfToken("");
      }
    }

    void loadCheckoutSession();
  }, []);

  useEffect(() => {
    const sync = async () => {
      const currentCart = getCart();
      setCart(currentCart);
      const ids = Object.keys(currentCart).filter((id) => currentCart[id] > 0);
      if (!ids.length) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      const rows = await fetchProductsByIds(ids);
      setProducts(rows);
      setLoadingProducts(false);
    };

    sync();
    return subscribeToCommerceStore(() => {
      sync();
    });
  }, []);

  useEffect(() => {
    async function loadAccount() {
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = (await profileRes.json()) as {
            user?: {
              name?: string | null;
              email?: string | null;
              phone?: string | null;
            };
          };
          setIsLoggedIn(true);
          setDraft((prev) => ({
            ...prev,
            customerName: prev.customerName || profileData.user?.name || "",
            customerEmail:
              prev.customerEmail || (profileData.user?.email ?? ""),
            customerPhone:
              prev.customerPhone || (profileData.user?.phone ?? ""),
          }));

          const addressesRes = await fetch("/api/addresses");
          if (addressesRes.ok) {
            const addressData = (await addressesRes.json()) as {
              addresses?: SavedAddress[];
            };
            setSavedAddresses(addressData.addresses ?? []);
          }
        }
      } catch {
        setIsLoggedIn(false);
      }
    }

    void loadAccount();
  }, []);

  const checkoutItems = useMemo<CheckoutItem[]>(
    () =>
      products
        .map((product) => {
          const quantity = cart[product.id] ?? 0;
          if (!quantity) return null;
          return {
            productId: product.id,
            title: product.title,
            sku: product.sku,
            quantity,
            unitPrice: product.salePrice || product.price,
            stock: product.stock,
          };
        })
        .filter(Boolean) as CheckoutItem[],
    [cart, products],
  );

  const previewQuote = useMemo(() => {
    if (!checkoutItems.length) return null;
    return buildQuote({
      items: checkoutItems,
      coupon: null,
      shippingZone: null,
      deliveryMethod: draft.deliveryMethod,
      paymentMethod: draft.paymentMethod,
      taxRate: Number(process.env.NEXT_PUBLIC_CHECKOUT_TAX_RATE ?? 0),
    });
  }, [checkoutItems, draft.deliveryMethod, draft.paymentMethod]);

  const activeQuote = quote ?? (previewQuote as CheckoutQuote | null);
  const shippingMethodMeta = getDeliveryMethod(draft.deliveryMethod);
  const paymentMeta = getPaymentMethodMeta(draft.paymentMethod);
  const stockWarnings = useMemo(
    () => buildStockWarnings(checkoutItems),
    [checkoutItems],
  );

  const quoteRequestPayload = useMemo(
    () => ({
      items: checkoutItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: draft.shippingAddress,
      billingAddress: draft.sameAsShipping
        ? draft.shippingAddress
        : draft.billingAddress,
      deliveryMethod: draft.deliveryMethod,
      paymentMethod: draft.paymentMethod,
      couponCode: draft.couponCode,
      sameAsShipping: draft.sameAsShipping,
    }),
    [
      checkoutItems,
      draft.billingAddress,
      draft.couponCode,
      draft.deliveryMethod,
      draft.paymentMethod,
      draft.sameAsShipping,
      draft.shippingAddress,
    ],
  );

  const canQuote = Boolean(
    draft.shippingAddress.fullName &&
    draft.shippingAddress.phone &&
    draft.shippingAddress.line1 &&
    draft.shippingAddress.city &&
    draft.shippingAddress.province &&
    draft.shippingAddress.country,
  );

  const displayedQuoteWarnings =
    !checkoutItems.length || !canQuote ? stockWarnings : quoteWarnings;

  useEffect(() => {
    if (!checkoutItems.length || !canQuote) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setQuoteLoading(true);
      setQuoteError("");
      try {
        const response = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(quoteRequestPayload),
        });

        const result = (await response.json()) as {
          quote?: CheckoutQuote;
          warnings?: string[];
          error?: string;
        };

        if (!response.ok) {
          setQuoteWarnings(result.warnings ?? []);
          setQuoteError(result.error ?? "Unable to calculate quote.");
          if (result.quote) setQuote(result.quote);
          return;
        }

        setQuote(result.quote ?? null);
        setQuoteWarnings(result.warnings ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setQuoteError(
            error instanceof Error
              ? error.message
              : "Unable to calculate quote.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [canQuote, quoteRequestPayload]);

  function updateShippingAddress(next: AddressForm) {
    setDraft((prev) => ({
      ...prev,
      shippingAddress: next,
      shippingAddressId: "",
    }));
  }

  function updateBillingAddress(next: AddressForm) {
    setDraft((prev) => ({
      ...prev,
      billingAddress: next,
      billingAddressId: "",
    }));
  }

  function applySavedAddress(
    address: AddressForm & { id: string },
    target: "shipping" | "billing",
  ) {
    const base: AddressForm = {
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      province: address.province,
      postalCode: address.postalCode ?? "",
      country: address.country,
      saveAsDefault: true,
    };

    setDraft((prev) => ({
      ...prev,
      ...(target === "shipping"
        ? { shippingAddress: base, shippingAddressId: address.id }
        : { billingAddress: base, billingAddressId: address.id }),
    }));
  }

  async function persistAddress(target: "shipping" | "billing") {
    const address =
      target === "shipping" ? draft.shippingAddress : draft.billingAddress;
    const addressId =
      target === "shipping" ? draft.shippingAddressId : draft.billingAddressId;
    setAddressSaving(true);

    try {
      const response = await fetch("/api/addresses", {
        method: addressId ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({
          ...(addressId ? { addressId } : {}),
          ...address,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        address?: { id: string };
      };

      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to save address.");
        return;
      }

      setMessage(addressId ? "Address updated." : "Address saved.");
      const reload = await fetch("/api/addresses");
      if (reload.ok) {
        const data = (await reload.json()) as {
          addresses?: SavedAddress[];
        };
        setSavedAddresses(data.addresses ?? []);
      }
      if (result.address?.id) {
        if (target === "shipping") {
          setDraft((prev) => ({
            ...prev,
            shippingAddressId: result.address?.id ?? prev.shippingAddressId,
          }));
        } else {
          setDraft((prev) => ({
            ...prev,
            billingAddressId: result.address?.id ?? prev.billingAddressId,
          }));
        }
      }
    } catch {
      setSubmitError("Unable to save address.");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handlePlaceOrder() {
    if (!checkoutItems.length) return;
    setProcessing(true);
    setSubmitError("");
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify({
        checkoutKey: draft.checkoutKey,
        items: checkoutItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        customer: {
          name: draft.customerName || draft.shippingAddress.fullName,
          email: draft.customerEmail,
          phone: draft.customerPhone || draft.shippingAddress.phone,
          createAccount: draft.createAccount,
          password: draft.customerPassword,
        },
        shippingAddressId: draft.shippingAddressId,
        billingAddressId: draft.sameAsShipping
          ? draft.shippingAddressId
          : draft.billingAddressId,
        shippingAddress: draft.shippingAddress,
        billingAddress: draft.sameAsShipping
          ? draft.shippingAddress
          : draft.billingAddress,
        sameAsShipping: draft.sameAsShipping,
        paymentMethod: draft.paymentMethod,
        paymentProvider: paymentMeta.provider,
        transactionReference: draft.transactionReference,
        notes: draft.notes,
        couponCode: draft.couponCode,
        deliveryMethod: draft.deliveryMethod,
      }),
    });

    const result = (await response.json()) as {
      error?: string;
      order?: {
        orderNumber: string;
        paymentStatus: string;
        subtotal: number;
        shippingCharge: number;
        discountTotal: number;
        taxTotal: number;
        grandTotal: number;
        address?: CheckoutAddress | null;
        items: {
          productName: string;
          sku: string;
          quantity: number;
          price: number;
        }[];
      };
      payment?: {
        reference?: string;
        provider?: string;
        session?: { status?: string; instructions?: string[] };
      };
      estimatedDelivery?: string;
      message?: string;
    };

    setProcessing(false);

    if (!response.ok || !result.order) {
      setSubmitError(result.error ?? "Order could not be placed.");
      return;
    }

    clearCart();
    setSuccessOrder({
      checkoutKey: draft.checkoutKey,
      orderNumber: result.order.orderNumber,
      paymentStatus: result.order.paymentStatus,
      estimatedDelivery:
        result.estimatedDelivery ??
        activeQuote?.estimatedDelivery ??
        "Shared in dashboard",
      payment: result.payment ?? {},
      order: result.order,
    });
    setMessage(result.message ?? "Order placed successfully.");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (!hasHydrated || loadingProducts) {
    return (
      <section className="section-padding">
        <div className="container space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Skeleton className="h-[600px] rounded-3xl" />
            <Skeleton className="h-[420px] rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!checkoutItems.length) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl font-bold">Your cart is empty</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Add items to your cart first, then return here to complete
              checkout.
            </p>
            <Button asChild variant="luxury" className="mt-6">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (successOrder) {
    return (
      <section className="section-padding">
        <div className="container max-w-6xl space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 shadow-soft dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-background dark:to-background sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                  <CircleCheckBig className="h-4 w-4" />
                  Thank you
                </div>
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  Order {successOrder.orderNumber} is confirmed
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Payment status is {successOrder.paymentStatus}. Expected
                  delivery: {successOrder.estimatedDelivery}.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Order total
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {formatCurrency(successOrder.order.grandTotal)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {successOrder.payment.reference
                    ? `Reference: ${successOrder.payment.reference}`
                    : "Reference will appear in payment instructions."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-bold">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {successOrder.order.items.map((item) => (
                    <div
                      key={`${item.sku}-${item.productName}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-muted-foreground">
                          SKU: {item.sku} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="grid gap-2 rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(successOrder.order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span>
                        {successOrder.order.shippingCharge
                          ? formatCurrency(successOrder.order.shippingCharge)
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discount</span>
                      <span>
                        -{formatCurrency(successOrder.order.discountTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(successOrder.order.taxTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(successOrder.order.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <MapPin className="h-5 w-5 text-primary" /> Shipping address
                  </h2>
                  {successOrder.order.address ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {successOrder.order.address.fullName},{" "}
                      {successOrder.order.address.line1}
                      {successOrder.order.address.line2
                        ? `, ${successOrder.order.address.line2}`
                        : ""}
                      {`, ${successOrder.order.address.city}, ${successOrder.order.address.province}, ${successOrder.order.address.country}`}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Shipping details were stored with the order.
                    </p>
                  )}
                </div>
                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <ReceiptText className="h-5 w-5 text-primary" /> Payment
                    details
                  </h2>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Provider:{" "}
                    {successOrder.payment.provider ?? paymentMeta.provider}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Status: {successOrder.paymentStatus}
                  </p>
                  {successOrder.payment.session?.instructions?.length ? (
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {successOrder.payment.session.instructions.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild variant="luxury">
                    <Link
                      href={`/api/orders/${successOrder.orderNumber}/invoice?key=${encodeURIComponent(successOrder.checkoutKey)}`}
                      target="_blank"
                    >
                      Download invoice
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard#orders">Track order</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/products">Continue shopping</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => setSuccessOrder(null)}>
                    Start new checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.14),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Checkout</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Secure, fast, premium checkout
              </h1>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Guest checkout, saved addresses, delivery selection, coupon
                handling, payment cards, live totals, and order tracking in one
                flow.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure and accessible checkout
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">CSRF-safe API</Badge>
                <Badge variant="secondary">Stock validation</Badge>
                <Badge variant="secondary">No refresh flow</Badge>
              </div>
            </div>
          </div>
        </div>

        {submitError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-5 w-5" />
              <div className="space-y-3">
                <p className="font-semibold">Payment failed</p>
                <p>{submitError}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePlaceOrder}
                    disabled={processing}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry payment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, paymentMethod: "COD" }))
                    }
                  >
                    Choose another method
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <CircleCheckBig className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">{message}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    1. Account
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    Guest checkout or login
                  </h2>
                </div>
                <Badge variant={isLoggedIn ? "secondary" : "outline"}>
                  {isLoggedIn ? "Logged in" : "Guest"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:col-span-2">
                  <p className="text-sm font-semibold">Continue as guest</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Checkout without creating an account. You can still create
                    one while ordering.
                  </p>
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <Button asChild variant="outline">
                    <Link href="/auth/login?redirect=/checkout">
                      Login during checkout
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/auth/signup?redirect=/checkout">
                      Create account
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Full name
                  <Input
                    value={draft.customerName}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        customerName: event.target.value,
                      }))
                    }
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Email
                  <Input
                    type="email"
                    value={draft.customerEmail}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        customerEmail: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Phone
                  <Input
                    value={draft.customerPhone}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        customerPhone: event.target.value,
                      }))
                    }
                    placeholder="0300xxxxxxx"
                  />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-semibold">
                  Create account while ordering
                  <input
                    type="checkbox"
                    checked={draft.createAccount}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        createAccount: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                </label>
                {draft.createAccount ? (
                  <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                    Password
                    <Input
                      type="password"
                      value={draft.customerPassword}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          customerPassword: event.target.value,
                        }))
                      }
                      placeholder="Minimum 8 characters"
                    />
                  </label>
                ) : null}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    2. Shipping
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Shipping address</h2>
                </div>
                <MapPin className="h-5 w-5 text-primary" />
              </div>

              {isLoggedIn && savedAddresses.length ? (
                <div className="mt-4 grid gap-3">
                  <label className="grid gap-2 text-sm font-semibold">
                    Saved addresses
                    <select
                      value={draft.shippingAddressId}
                      onChange={(event) => {
                        const selected = savedAddresses.find(
                          (item) => item.id === event.target.value,
                        );
                        if (selected) applySavedAddress(selected, "shipping");
                        else
                          setDraft((prev) => ({
                            ...prev,
                            shippingAddressId: "",
                          }));
                      }}
                      className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="">New address</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} · {address.city}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="rounded-2xl border border-border bg-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{address.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {address.fullName}
                            </p>
                          </div>
                          {address.isDefault ? <Badge>Default</Badge> : null}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}
                          {`, ${address.city}, ${address.province}`}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <AddressCardActions
                            onUse={() => applySavedAddress(address, "shipping")}
                            onEdit={() =>
                              applySavedAddress(address, "shipping")
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5">
                <AddressFormFields
                  value={draft.shippingAddress}
                  onChange={updateShippingAddress}
                />
              </div>

              {isLoggedIn ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void persistAddress("shipping")}
                    disabled={addressSaving}
                  >
                    {addressSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {draft.shippingAddressId
                      ? "Update address"
                      : "Save address"}
                  </Button>
                  {draft.shippingAddressId ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, shippingAddressId: "" }))
                      }
                    >
                      New address
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    3. Billing
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Billing address</h2>
                </div>
                <label className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-sm font-semibold">
                  Same as shipping
                  <input
                    type="checkbox"
                    checked={draft.sameAsShipping}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        sameAsShipping: event.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                </label>
              </div>

              {!draft.sameAsShipping ? (
                <>
                  {isLoggedIn && savedAddresses.length ? (
                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-2 text-sm font-semibold">
                        Saved billing addresses
                        <select
                          value={draft.billingAddressId}
                          onChange={(event) => {
                            const selected = savedAddresses.find(
                              (item) => item.id === event.target.value,
                            );
                            if (selected)
                              applySavedAddress(selected, "billing");
                            else
                              setDraft((prev) => ({
                                ...prev,
                                billingAddressId: "",
                              }));
                          }}
                          className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                        >
                          <option value="">New billing address</option>
                          {savedAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.label} · {address.city}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}
                  <div className="mt-5">
                    <AddressFormFields
                      value={draft.billingAddress}
                      onChange={updateBillingAddress}
                    />
                  </div>
                  {isLoggedIn ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => void persistAddress("billing")}
                        disabled={addressSaving}
                      >
                        {addressSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        {draft.billingAddressId
                          ? "Update billing address"
                          : "Save billing address"}
                      </Button>
                      {draft.billingAddressId ? (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              billingAddressId: "",
                            }))
                          }
                        >
                          New billing address
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Billing information will mirror the shipping address.
                </p>
              )}
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    4. Delivery
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Delivery method</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {Object.values(deliveryMethods).map((method) => {
                  const active = draft.deliveryMethod === method.method;
                  return (
                    <button
                      key={method.method}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          deliveryMethod: method.method,
                        }))
                      }
                      className={`rounded-3xl border p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-muted/20 hover:border-primary/30"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{method.label}</p>
                        {active ? (
                          <CircleCheckBig className="h-5 w-5 text-primary" />
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {method.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
                        <span>{method.estimatedDays}</span>
                        <span>
                          {method.charge
                            ? formatCurrency(method.charge)
                            : "Free"}
                        </span>
                      </div>
                      {method.freeShippingThreshold ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Free above{" "}
                          {formatCurrency(method.freeShippingThreshold)}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    5. Payment
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Payment method</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {paymentMethods.map((method) => {
                  const active = draft.paymentMethod === method.id;
                  const Icon =
                    method.id === "COD"
                      ? Truck
                      : method.id === "BANK_TRANSFER"
                        ? Landmark
                        : method.id === "JAZZCASH" || method.id === "EASYPAISA"
                          ? Smartphone
                          : CreditCard;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          paymentMethod: method.id,
                        }))
                      }
                      className={`rounded-3xl border p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-muted/20 hover:border-primary/30"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl border border-border bg-background p-3">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{method.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {active ? (
                          <CircleCheckBig className="h-5 w-5 text-primary" />
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{method.badge}</Badge>
                        <Badge variant="secondary">{method.settlement}</Badge>
                        {method.supportsSavedToken ? (
                          <Badge variant="secondary">Token-ready</Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              {paymentMeta.requiresReference ? (
                <label className="mt-5 grid gap-2 text-sm font-semibold">
                  Transaction reference
                  <Input
                    value={draft.transactionReference}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        transactionReference: event.target.value,
                      }))
                    }
                    placeholder="Enter JazzCash/Easypaisa/Bank transaction reference"
                  />
                </label>
              ) : null}
              <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                <div className="flex items-start gap-2">
                  <Landmark className="mt-0.5 h-4 w-4" />
                  <div>
                    <p className="font-semibold">{paymentMeta.label}</p>
                    <p className="mt-1">{paymentMeta.instructions}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    6. Review
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Order review</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {stockWarnings.length ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                      {stockWarnings.map((warning) => (
                        <p key={warning}>• {warning}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-4 rounded-3xl border border-border bg-muted/20 p-4">
                  <label className="grid gap-2 text-sm font-semibold">
                    Coupon code
                    <Input
                      value={draft.couponCode}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          couponCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="SAVE10"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Order notes
                    <textarea
                      value={draft.notes}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                      className="min-h-28 rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Delivery instructions, landmark, etc."
                    />
                  </label>
                  <div className="grid gap-2 rounded-2xl border border-border bg-background p-4 text-sm">
                    {quoteLoading ? (
                      <p className="text-muted-foreground">
                        Recalculating totals...
                      </p>
                    ) : null}
                    {quoteError ? (
                      <p className="text-destructive">{quoteError}</p>
                    ) : null}
                    {displayedQuoteWarnings.length ? (
                      <p className="text-amber-600 dark:text-amber-300">
                        {displayedQuoteWarnings[0]}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(activeQuote?.subtotal ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>
                        {activeQuote?.shippingCharge
                          ? formatCurrency(activeQuote.shippingCharge)
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>
                        -{formatCurrency(activeQuote?.discountTotal ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(activeQuote?.taxTotal ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-lg font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(activeQuote?.grandTotal ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Estimated delivery</span>
                      <span>
                        {activeQuote?.estimatedDelivery ??
                          shippingMethodMeta.estimatedDays}
                      </span>
                    </div>
                  </div>
                  <Button
                    disabled={
                      processing ||
                      !!stockWarnings.length ||
                      (paymentMeta.requiresReference &&
                        !draft.transactionReference.trim())
                    }
                    onClick={handlePlaceOrder}
                    variant="luxury"
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing payment...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Place order
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Live summary
              </p>
              <h2 className="mt-2 text-2xl font-bold">Order totals</h2>
            </div>

            <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-4">
              {checkoutItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} · Stock {item.stock}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 rounded-3xl border border-border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(activeQuote?.subtotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {activeQuote?.shippingCharge
                    ? formatCurrency(activeQuote.shippingCharge)
                    : "Free"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(activeQuote?.discountTotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(activeQuote?.taxTotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(activeQuote?.grandTotal ?? 0)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Expected delivery{" "}
                {activeQuote?.estimatedDelivery ??
                  shippingMethodMeta.estimatedDays}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Security and validation</p>
                  <p className="mt-1">
                    Addresses, phone numbers, stock, payment method, and
                    delivery rules are validated server-side before the order is
                    created.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Need help?</p>
              <p className="mt-2 leading-6">
                Login or create an account to sync saved addresses, invoices,
                and order tracking across devices.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/auth/login?redirect=/checkout">Login</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="truncate text-lg font-bold">
              {formatCurrency(activeQuote?.grandTotal ?? 0)}
            </p>
          </div>
          <Button
            disabled={
              processing ||
              !!stockWarnings.length ||
              (paymentMeta.requiresReference &&
                !draft.transactionReference.trim())
            }
            onClick={handlePlaceOrder}
            variant="luxury"
            className="shrink-0"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Place order
          </Button>
        </div>
      </div>
    </section>
  );
}
