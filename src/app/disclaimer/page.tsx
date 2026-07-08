import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">Disclaimer</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Product guidance, dosage notes, and recommendations are informational
          and should be validated against field conditions, crop stage, and
          official labels. Subhani Agrizone is not liable for misuse or
          unapproved application methods.
        </p>
      </div>
    </section>
  );
}
