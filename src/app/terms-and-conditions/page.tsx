import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsAndConditionsPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">
          Terms & Conditions
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          By using Subhani Agrizone, you agree to provide accurate details for
          ordering, respect payment timelines, and follow product safety
          instructions. We reserve the right to cancel fraudulent or unavailable
          orders and update policies as required.
        </p>
      </div>
    </section>
  );
}
