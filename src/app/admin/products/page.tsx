import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";

import { AdminProductManager } from "@/components/admin/admin-product-manager";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Product Manager",
};

export default function AdminProductsPage() {
  return (
    <>
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Product manager
            </h1>
          </div>
          <Button variant="luxury">
            <PackagePlus className="h-4 w-4" />
            New product
          </Button>
        </div>
      </section>

      <AdminProductManager />
    </>
  );
}
