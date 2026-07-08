import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyPage() {
  return (
    <section className="section-padding">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold tracking-normal">Cookie Policy</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          We use essential cookies for authentication, cart persistence, and
          secure session management, and optional analytics cookies for
          performance insights. You can control non-essential cookies in browser
          settings.
        </p>
      </div>
    </section>
  );
}
