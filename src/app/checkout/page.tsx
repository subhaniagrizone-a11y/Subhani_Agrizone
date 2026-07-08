import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/site/checkout-page-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Delivery, billing, and payment checkout flow.",
  alternates: {
    canonical: absoluteUrl("/checkout"),
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
