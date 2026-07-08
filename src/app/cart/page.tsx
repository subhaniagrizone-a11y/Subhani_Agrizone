import type { Metadata } from "next";

import { CartPageClient } from "@/components/site/cart-page-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your cart items and order summary.",
  alternates: {
    canonical: absoluteUrl("/cart"),
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
