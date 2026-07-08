import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const tickets = [
  { id: "SUP-1001", user: "Adeel Farm", subject: "Order delayed", priority: "High" },
  { id: "SUP-1002", user: "Naseer Traders", subject: "Invoice needed", priority: "Medium" },
  { id: "SUP-1003", user: "Mahnoor", subject: "Wrong dosage info", priority: "Low" },
];

export const metadata: Metadata = {
  title: "Support Tickets",
};

export default function AdminSupportPage() {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">Support Tickets</h1>
        <LifeBuoy className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-5 grid gap-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between rounded-md border border-border p-4">
            <div>
              <p className="font-semibold">{ticket.id} - {ticket.subject}</p>
              <p className="text-sm text-muted-foreground">Customer: {ticket.user}</p>
            </div>
            <Badge variant="secondary">{ticket.priority}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
