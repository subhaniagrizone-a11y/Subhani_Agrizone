import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

const adminEmail = (
  process.env.ADMIN_EMAIL ?? "subhaniagrizone@gmail.com"
).toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? "";
const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : "development-secret-change-me");

function encodeSession(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSession(raw: string | undefined) {
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    return JSON.parse(decoded) as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  } catch {
    return null;
  }
}

export async function auth() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("sa_session")?.value;
  const payload = decodeSession(sessionValue);

  if (payload?.id) {
    return {
      user: {
        id: payload.id,
        name: payload.name ?? "User",
        email: payload.email ?? undefined,
        image: payload.image ?? null,
        role: payload.role ?? "CUSTOMER",
      },
    };
  }

  return nextAuthAuth();
}

export const {
  handlers,
  auth: nextAuthAuth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret: authSecret,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const databaseUser = await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
          },
          create: {
            email: user.email.toLowerCase(),
            name: user.name ?? "Google User",
            image: user.image,
            role: "CUSTOMER",
            emailVerified: new Date(),
          },
        });

        user.id = databaseUser.id;
        user.role = databaseUser.role;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        session.user.role = (token.role ??
          "CUSTOMER") as typeof session.user.role;
      }
      return session;
    },
  },
});

export { adminEmail, adminPassword, encodeSession, decodeSession };
