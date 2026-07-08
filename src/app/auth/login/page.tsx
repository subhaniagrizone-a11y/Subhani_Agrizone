import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/site/login-form";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to manage orders, wishlist, saved addresses, rewards, and invoices.",
  alternates: {
    canonical: absoluteUrl("/auth/login"),
  },
};

type LoginPageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { verified } = await searchParams;
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <section className="section-padding bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
      <div className="container grid gap-10 lg:grid-cols-[0.95fr_0.75fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Secure access</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            Sign in to your agriculture account
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Manage order history, saved addresses, invoices, rewards, referral
            credits, notifications, wishlist, and product comparisons.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              googleEnabled ? "Google login" : "Google login unavailable",
              "Email login",
              "Phone login ready",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border bg-card p-4"
              >
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
          {verified === "pending" ? (
            <p className="mt-5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Verification email sent. Please confirm from Gmail before login.
            </p>
          ) : null}
          {verified === "success" ? (
            <p className="mt-5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Email verified successfully. You can now login.
            </p>
          ) : null}
          {verified === "expired" || verified === "invalid" ? (
            <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Verification link is invalid or expired. Please register again.
            </p>
          ) : null}
        </div>
        <LoginForm googleEnabled={googleEnabled} />
      </div>
    </section>
  );
}
