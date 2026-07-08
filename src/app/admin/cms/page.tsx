import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { AdminCmsManager } from "@/components/admin/admin-cms-manager";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CMS"
};

export default function AdminCmsPage() {
  return (
    <>
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">CMS</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Homepage and content editor
            </h1>
          </div>
          <Button variant="luxury">
            <FileText className="h-4 w-4" />
            Rich editor enabled
          </Button>
        </div>
      </section>

      <AdminCmsManager />
    </>
  );
}
