import type { Metadata } from "next";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const customers = [
  { name: "Aqib Khan", email: "aqib@example.com", role: "FARMER", city: "Multan" },
  { name: "Raza Traders", email: "raza@dealer.com", role: "DEALER", city: "Lahore" },
  { name: "Sara Imran", email: "sara@example.com", role: "CUSTOMER", city: "Faisalabad" },
];

export const metadata: Metadata = {
  title: "Customers",
};

export default function AdminCustomersPage() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">Customers</h1>
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 grid gap-3">
        {customers.map((customer) => (
          <div key={customer.email} className="flex items-center justify-between rounded-md border border-border p-4">
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{customer.city}</Badge>
              <Badge>{customer.role}</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
