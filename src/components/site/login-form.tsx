"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Chrome, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      const email = String(formData.get("email") ?? "");
      const provider = mode === "email" ? "email-login" : "phone-login";
      const result = await signIn(provider, {
        redirect: false,
        email,
        password: String(formData.get("password") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        otp: String(formData.get("otp") ?? ""),
      });

      if (result?.error) {
        if (mode === "email") {
          try {
            const statusRes = await fetch("/api/auth/verification-status", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (statusRes.ok) {
              const status = await statusRes.json();
              if (status.exists && !status.verified) {
                setMessage("Please verify your Gmail first, then login.");
                return;
              }
            }
          } catch {
            setMessage("Unable to check verification status. Please retry.");
            return;
          }
        }

        setMessage("Login failed. Check your credentials and try again.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setMessage("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
      <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
            mode === "email"
              ? "bg-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
            mode === "phone"
              ? "bg-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>

      <form action={submit} className="mt-6 grid gap-4">
        {mode === "email" ? (
          <>
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <Input
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
              />
            </label>
          </>
        ) : (
          <>
            <label className="grid gap-2 text-sm font-semibold">
              Phone
              <Input name="phone" type="tel" placeholder="+92..." required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              OTP
              <Input
                name="otp"
                inputMode="numeric"
                placeholder="Code"
                required
              />
            </label>
          </>
        )}

        {message && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        )}

        <Button disabled={loading} type="submit" variant="luxury">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <Button
        className="mt-3 w-full"
        variant="outline"
        type="button"
        disabled={!googleEnabled}
        onClick={() => {
          if (!googleEnabled) {
            setMessage("Google login is not configured yet.");
            return;
          }

          signIn("google", { callbackUrl: "/dashboard" });
        }}
      >
        <Chrome className="h-4 w-4" />
        {googleEnabled ? "Continue with Google" : "Google login unavailable"}
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <a href="/auth/signup" className="font-semibold text-foreground">
          Create one
        </a>
      </p>
    </div>
  );
}
