import type { Metadata } from "next";
import { AdminOrdersManager } from "@/components/admin/admin-orders-manager";

export const metadata: Metadata = {
  title: "Orders Management",
};

export default function AdminOrdersPage() {
  return <AdminOrdersManager />;
}
