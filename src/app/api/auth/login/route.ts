import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

import { auth, adminEmail, adminPassword, encodeSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const mode = String(body.mode ?? "email");

    if (mode === "phone") {
      return NextResponse.json(
        { error: "Phone login is not enabled yet." },
        { status: 400 },
      );
    }

    const sessionUser = await auth();
    if (sessionUser?.user?.id) {
      return NextResponse.json({
        ok: true,
        redirect: sessionUser.user.role === "ADMIN" ? "/admin" : "/dashboard",
        role: sessionUser.user.role,
      });
    }

    if (email === adminEmail) {
      if (!adminPassword) {
        return NextResponse.json(
          { error: "Admin login is not configured yet." },
          { status: 503 },
        );
      }

      if (password === adminPassword) {
        let adminUser: {
          id: string;
          name: string | null;
          email: string | null;
          role: string;
        } | null = null;

        try {
          adminUser =
            (await prisma.user.findUnique({ where: { email: adminEmail } })) ??
            (await prisma.user.create({
              data: {
                email: adminEmail,
                name: "Admin User",
                role: "ADMIN",
                passwordHash: await hash(adminPassword, 10),
                emailVerified: new Date(),
              },
            }));
        } catch (dbError) {
          console.warn(
            "Database unavailable for admin fallback login:",
            dbError,
          );
          adminUser = {
            id: "admin-fallback",
            name: "Admin User",
            email: adminEmail,
            role: "ADMIN",
          };
        }

        const payload = encodeSession({
          id: adminUser.id,
          name: adminUser.name ?? "Admin User",
          email: adminUser.email,
          role: adminUser.role,
        });

        const response = NextResponse.json({
          ok: true,
          redirect: "/admin",
          role: "ADMIN",
        });
        response.cookies.set("sa_session", payload, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 12,
        });
        return response;
      }
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      if (!user.emailVerified && user.role !== "ADMIN") {
        return NextResponse.json(
          {
            error: "Please verify your email first.",
            reason: "email-unverified",
          },
          { status: 401 },
        );
      }

      const valid = await compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }

      const payload = encodeSession({
        id: user.id,
        name: user.name ?? "User",
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json({
        ok: true,
        redirect: "/dashboard",
        role: user.role,
      });
      response.cookies.set("sa_session", payload, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 12,
      });
      return response;
    } catch (dbError) {
      console.error("Login route DB error:", dbError);
      return NextResponse.json(
        { error: "Database is unavailable right now. Please try again later." },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while signing in." },
      { status: 500 },
    );
  }
}
