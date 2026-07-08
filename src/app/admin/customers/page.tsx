import type { Metadata } from "next";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const customers = await prisma.user
    .findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">Customers</h1>
        <Users className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 grid gap-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between rounded-md border border-border p-4"
          >
            <div>
              <p className="font-semibold">{customer.name || "Unnamed user"}</p>
              <p className="text-sm text-muted-foreground">
                {customer.email || customer.phone || "No contact"}
              </p>
              <p className="text-xs text-muted-foreground">
                Joined{" "}
                {new Date(customer.createdAt).toLocaleDateString("en-PK")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{customer.role}</Badge>
            </div>
          </div>
        ))}

        {customers.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            No customers found yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
