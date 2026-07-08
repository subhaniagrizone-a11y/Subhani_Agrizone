import type { Metadata } from "next";

import { AdminSiteSettingsForm } from "@/components/admin/admin-site-settings-form";
import { DashboardClient } from "@/components/site/dashboard-client";

export const metadata: Metadata = {
  title: "Admin Settings",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminSiteSettingsForm />
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-normal">
          User Profile Settings
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Profile information with profile picture can be edited below.
        </p>
      </section>
      <DashboardClient />
    </div>
  );
}
