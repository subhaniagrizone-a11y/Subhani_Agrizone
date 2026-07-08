import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Subhani Agrizone, our mission, and how we support farmers.",
};

export default function AboutUsPage() {
  return (
    <main className="section-padding">
      <section className="container">
        <p className="eyebrow">About Subhani Agrizone</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Trusted partner for smarter farming
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          Subhani Agrizone provides quality seeds, fertilizers, crop protection,
          micronutrients, and agriculture equipment for farmers across Pakistan.
          Our focus is simple: right product, right guidance, and right support
          at every crop stage.
        </p>
      </section>

      <section className="container mt-10 grid gap-6 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Help farmers improve yield and profitability with reliable products
            and transparent guidance.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What We Offer</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Crop-wise product selection, dosage support, seasonal recommendations,
            and responsive customer service.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Why Farmers Choose Us</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Competitive pricing, genuine stock, and practical field-first advice
            from a team that understands agriculture operations.
          </p>
        </article>
      </section>
    </main>
  );
}
