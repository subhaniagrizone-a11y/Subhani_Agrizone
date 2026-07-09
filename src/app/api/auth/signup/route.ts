import { NextResponse, type NextRequest } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/db";
import {
  sendEmailVerificationEmail,
  sendNewCustomerAdminAlert,
  sendWelcomeEmail,
} from "@/lib/email";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { generateVerificationToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
});

const DB_TIMEOUT_MS = 8000;
const DB_RETRY_ATTEMPTS = 3;

class DbTimeoutError extends Error {
  constructor() {
    super("Database timeout");
    this.name = "DbTimeoutError";
  }
}

function withDbTimeout<T>(promise: Promise<T>, ms = DB_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new DbTimeoutError()), ms);
  });

  return Promise.race<T>([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDbConnectivityError(error: unknown) {
  if (error instanceof DbTimeoutError) return true;
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("server selection timeout") ||
    message.includes("no available servers") ||
    message.includes("replicasetnoprimary") ||
    message.includes("received fatal alert")
  );
}

async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await withDbTimeout(operation());
    } catch (error) {
      lastError = error;
      if (!isDbConnectivityError(error) || attempt === DB_RETRY_ATTEMPTS) {
        throw error;
      }

      await sleep(250 * attempt);
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid signup payload" },
      { status: 422 },
    );
  }

  const payload = {
    name: sanitizeText((raw as { name?: string })?.name),
    email: sanitizeEmail((raw as { email?: string })?.email),
    password: String((raw as { password?: string })?.password ?? "").trim(),
    phone: sanitizePhone((raw as { phone?: string })?.phone),
  };

  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup payload" },
      { status: 422 },
    );
  }

  const { name, email, password, phone } = parsed.data;
  const passwordHash = await hash(password, 12);

  try {
    const existing = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          OR: [{ email }, ...(phone ? [{ phone }] : [])],
        },
      }),
    );

    if (existing) {
      const existingEmail = existing.email?.toLowerCase() ?? "";
      const requestedEmail = email.toLowerCase();
      const sameEmail = existingEmail === requestedEmail;

      if (sameEmail && !existing.emailVerified) {
        const verificationToken = generateVerificationToken();

        await withDbRetry(() =>
          prisma.verificationToken.deleteMany({
            where: { identifier: email },
          }),
        );

        await withDbRetry(() =>
          prisma.verificationToken.create({
            data: {
              identifier: email,
              token: verificationToken,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          }),
        );

        const verifyUrl = absoluteUrl(
          `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`,
        );

        const verificationEmailResult = await sendEmailVerificationEmail({
          to: email,
          name: existing.name ?? name,
          verifyUrl,
        });

        if (!verificationEmailResult.ok) {
          const missing =
            "missing" in verificationEmailResult
              ? verificationEmailResult.missing
              : undefined;
          const reason =
            "reason" in verificationEmailResult
              ? verificationEmailResult.reason
              : undefined;
          return NextResponse.json(
            {
              ok: true,
              verificationRequired: true,
              existingAccount: true,
              emailDelivery: false,
              error: "Verification email could not be sent.",
              missing,
              reason,
              verifyUrl:
                process.env.NODE_ENV !== "production" ? verifyUrl : undefined,
              user: { id: existing.id, email, name: existing.name ?? name },
            },
            { status: 202 },
          );
        }

        return NextResponse.json({
          ok: true,
          verificationRequired: true,
          existingAccount: true,
          emailDelivery: true,
          user: { id: existing.id, email, name: existing.name ?? name },
        });
      }

      if (sameEmail && existing.emailVerified) {
        return NextResponse.json(
          { error: "Email already registered. Please login." },
          { status: 409 },
        );
      }

      if (phone && existing.phone === phone) {
        return NextResponse.json(
          { error: "Phone number already linked to another account." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 },
      );
    }

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          role: "CUSTOMER",
        },
      }),
    );

    const verificationToken = generateVerificationToken();
    await withDbRetry(() =>
      prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    );

    const verifyUrl = absoluteUrl(
      `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`,
    );

    await withDbRetry(() =>
      prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome aboard",
          body: "Please verify your email to activate your Subhani Agrizone account.",
          channel: "email",
        },
      }),
    );

    const verificationEmailResult = await sendEmailVerificationEmail({
      to: email,
      name,
      verifyUrl,
    });

    await Promise.allSettled([
      sendNewCustomerAdminAlert({
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
      }),
      sendWelcomeEmail(email, name),
    ]);

    if (!verificationEmailResult.ok) {
      const missing =
        "missing" in verificationEmailResult
          ? verificationEmailResult.missing
          : undefined;
      const reason =
        "reason" in verificationEmailResult
          ? verificationEmailResult.reason
          : undefined;
      return NextResponse.json(
        {
          ok: true,
          verificationRequired: true,
          emailDelivery: false,
          error: "Verification email could not be sent.",
          missing,
          reason,
          verifyUrl:
            process.env.NODE_ENV !== "production" ? verifyUrl : undefined,
          user: { id: user.id, email: user.email, name: user.name },
        },
        { status: 202 },
      );
    }

    return NextResponse.json({
      ok: true,
      verificationRequired: true,
      emailDelivery: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create account right now" },
      { status: 500 },
    );
  }
}
