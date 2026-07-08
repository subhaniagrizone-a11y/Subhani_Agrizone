import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getCsrfCookieName, verifyCsrf } from "@/lib/csrf";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutAddressSchema } from "@/lib/validators";

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "addresses"
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfCookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getCsrfCookieName()}=`))
      ?.split("=")[1] ?? null;
  if (!verifyCsrf(request, csrfCookie)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const limiter = rateLimit(
    `addresses:${session.user.id}:${getClientKey(request)}`,
    20,
    60_000,
  );
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many address changes" },
      { status: 429 },
    );
  }

  const payload = await request.json();
  const parsed = checkoutAddressSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid address", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (parsed.data.saveAsDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: parsed.data.label,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      province: parsed.data.province,
      postalCode: parsed.data.postalCode || null,
      country: parsed.data.country,
      isDefault: parsed.data.saveAsDefault,
    },
  });

  return NextResponse.json({ ok: true, address }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfCookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getCsrfCookieName()}=`))
      ?.split("=")[1] ?? null;
  if (!verifyCsrf(request, csrfCookie)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const payload = await request.json();
  const addressId =
    typeof payload.addressId === "string" ? payload.addressId : "";
  if (!addressId) {
    return NextResponse.json(
      { error: "addressId is required" },
      { status: 422 },
    );
  }

  const parsed = checkoutAddressSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address" }, { status: 422 });
  }

  if (parsed.data.saveAsDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updateResult = await prisma.address.updateMany({
    where: { id: addressId, userId: session.user.id },
    data: {
      ...(typeof parsed.data.label === "string"
        ? { label: parsed.data.label }
        : {}),
      ...(typeof parsed.data.fullName === "string"
        ? { fullName: parsed.data.fullName }
        : {}),
      ...(typeof parsed.data.phone === "string"
        ? { phone: parsed.data.phone }
        : {}),
      ...(typeof parsed.data.line1 === "string"
        ? { line1: parsed.data.line1 }
        : {}),
      ...(typeof parsed.data.line2 === "string"
        ? { line2: parsed.data.line2 || null }
        : {}),
      ...(typeof parsed.data.city === "string"
        ? { city: parsed.data.city }
        : {}),
      ...(typeof parsed.data.province === "string"
        ? { province: parsed.data.province }
        : {}),
      ...(typeof parsed.data.postalCode === "string"
        ? { postalCode: parsed.data.postalCode || null }
        : {}),
      ...(typeof parsed.data.country === "string"
        ? { country: parsed.data.country }
        : {}),
      ...(typeof parsed.data.saveAsDefault === "boolean"
        ? { isDefault: parsed.data.saveAsDefault }
        : {}),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });

  return NextResponse.json({ ok: true, address });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfCookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getCsrfCookieName()}=`))
      ?.split("=")[1] ?? null;
  if (!verifyCsrf(request, csrfCookie)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const payload = await request.json();
  const addressId =
    typeof payload.addressId === "string" ? payload.addressId : "";
  if (!addressId) {
    return NextResponse.json(
      { error: "addressId is required" },
      { status: 422 },
    );
  }

  const result = await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
