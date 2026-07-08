import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    user,
    addressCount,
    defaultAddress,
    recentOrders,
    rewardLedger,
    qualifyingTotals,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.address.count({
      where: { userId: session.user.id },
    }),
    prisma.address.findFirst({
      where: { userId: session.user.id, isDefault: true },
      select: {
        label: true,
        fullName: true,
        phone: true,
        line1: true,
        line2: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentReference: true,
        trackingNumber: true,
        grandTotal: true,
        createdAt: true,
        address: {
          select: {
            city: true,
          },
        },
      },
    }),
    prisma.rewardLedger.aggregate({
      where: { userId: session.user.id },
      _sum: { points: true },
    }),
    prisma.order.aggregate({
      where: {
        userId: session.user.id,
        OR: [{ status: "DELIVERED" }, { paymentStatus: "PAID" }],
      },
      _sum: {
        grandTotal: true,
      },
    }),
  ]);

  const ledgerPoints = rewardLedger._sum.points ?? 0;
  const earnedFromPurchases = Math.floor(
    (qualifyingTotals._sum.grandTotal ?? 0) / 1000,
  );
  const rewardPoints = Math.max(ledgerPoints, earnedFromPurchases);

  return NextResponse.json({
    user,
    summary: {
      addressCount,
      rewardPoints,
      orderCount: recentOrders.length,
      defaultAddress,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        trackingNumber: order.trackingNumber,
        grandTotal: order.grandTotal,
        city: order.address?.city ?? "-",
        createdAt: order.createdAt,
      })),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const updateData: Record<string, unknown> = {};

  if (typeof payload.name === "string") updateData.name = payload.name;
  if (typeof payload.email === "string") updateData.email = payload.email;
  if (typeof payload.phone === "string") updateData.phone = payload.phone;
  if (typeof payload.image === "string") updateData.image = payload.image;
  if (typeof payload.password === "string" && payload.password.length >= 8) {
    updateData.passwordHash = await hash(payload.password, 12);
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
    },
  });
}
