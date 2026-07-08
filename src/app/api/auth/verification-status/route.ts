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

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ verified: false }, { status: 422 });
  }

  const email = String((payload as { email?: string })?.email ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return NextResponse.json({ verified: false }, { status: 422 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    return NextResponse.json({
      exists: Boolean(user),
      verified: Boolean(user?.emailVerified),
    });
  } catch (error) {
    if (isDbConnectivityError(error)) {
      return NextResponse.json(
        { error: "Database unavailable", verified: false },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to check verification status", verified: false },
      { status: 500 },
    );
  }
}
