import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">Shipping Policy</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Standard shipping is available through approved logistics partners
          including TCS and TRAX. Estimated delivery window is 2-5 working days
          based on service area, weather, and courier availability. Shipping
          charges are configurable from admin settings.
        </p>
      </div>
    </section>
  );
}
