import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { SignupForm } from "@/components/site/signup-form";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Subhani Agrizone account to manage orders, saved addresses, wishlist, and rewards.",
  alternates: {
    canonical: absoluteUrl("/auth/signup"),
  },
};

export default function SignupPage() {
  return (
    <section className="section-padding bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-950 dark:via-background dark:to-emerald-950/40">
      <div className="container grid gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Join the network</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
            Create your agriculture commerce account
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Register to track orders, save favorites, receive offers, and unlock
            dealer and farmer pricing.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Fast account setup",
              "Secure password protection",
              "Order and wishlist tracking",
              "Notifications and updates",
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
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Already have an account?{" "}
            <Link className="font-semibold text-foreground" href="/auth/login">
              Sign in now <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>
        </div>
        <SignupForm />
      </div>
    </section>
  );
}
