import type { Metadata } from "next";

import { WishlistPageClient } from "@/components/site/wishlist-page-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved products in your wishlist.",
  alternates: {
    canonical: absoluteUrl("/wishlist"),
  },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
