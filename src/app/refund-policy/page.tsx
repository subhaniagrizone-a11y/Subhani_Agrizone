import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">Refund Policy</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Refunds are processed for valid damage, mismatch, or approved
          cancellation cases according to product type and delivery status. All
          refund requests are reviewed by support and can require photo evidence
          and invoice details.
        </p>
      </div>
    </section>
  );
}
