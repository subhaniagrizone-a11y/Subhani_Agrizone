import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

function isDbConnectivityError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("server selection timeout") ||
    message.includes("no available servers") ||
    message.includes("replicasetnoprimary") ||
    message.includes("received fatal alert")
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  const email =
    request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/auth/login?verified=invalid", request.url),
    );
  }

  try {
    const verification = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    if (!verification || verification.expires < new Date()) {
      return NextResponse.redirect(
        new URL("/auth/login?verified=expired", request.url),
      );
    }

    await prisma.user.updateMany({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return NextResponse.redirect(
      new URL("/auth/login?verified=success", request.url),
    );
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.redirect(
        new URL("/auth/login?verified=invalid", request.url),
      );
    }
    return NextResponse.redirect(
      new URL("/auth/login?verified=invalid", request.url),
    );
  }
}
