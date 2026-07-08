import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">Privacy Policy</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Subhani Agrizone collects customer profile, shipping, and order
          information to process orders, provide support, and improve our
          services. We do not sell personal data. Sensitive data is protected
          with encryption, restricted access, and secure infrastructure.
        </p>
      </div>
    </section>
  );
}
