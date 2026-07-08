import type { Metadata } from "next";

import { DashboardClient } from "@/components/site/dashboard-client";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description:
    "Customer dashboard for order tracking, saved addresses, invoices, wishlist, rewards, coupons, referrals, and notifications.",
  alternates: {
    canonical: absoluteUrl("/dashboard"),
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
