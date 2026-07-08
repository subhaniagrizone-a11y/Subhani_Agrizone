"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Signup failed.");
        return;
      }

      if (result.verificationRequired) {
        if (result.emailDelivery === false) {
          const missing = Array.isArray(result.missing)
            ? ` Missing: ${result.missing.join(", ")}.`
            : "";
          const devLink = result.verifyUrl
            ? ` Open this link: ${result.verifyUrl}`
            : "";
          setMessage(
            `Account created, but verification email was not sent because SMTP is not configured.${missing}${devLink}`,
          );
          return;
        }

        setMessage(
          result.existingAccount
            ? "Account already exists but is not verified. A fresh verification link has been sent to your Gmail."
            : "Account created. Verification link sent to your Gmail. Please verify first, then login.",
        );
        setTimeout(() => router.push("/auth/login?verified=pending"), 1200);
        return;
      }

      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 800);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Full name
          <Input name="name" placeholder="Aaqib Khan" required />
        </label>
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
          Phone
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="phone" className="pl-9" placeholder="03007172382" />
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Password
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>
        {message && (
          <p className="rounded-md bg-muted px-3 py-2 text-sm">{message}</p>
        )}
        <Button disabled={loading} type="submit" variant="luxury">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/auth/login" className="font-semibold text-foreground">
          Already have an account?
        </Link>
        <span className="inline-flex items-center gap-2">
          <Mail className="h-4 w-4" /> Verified by email
        </span>
      </div>
    </div>
  );
}
