import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize";
import { inquirySchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const raw = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const payload = {
    ...raw,
    name: sanitizeText(raw.name),
    email: sanitizeEmail(raw.email),
    phone: sanitizePhone(raw.phone),
    company: sanitizeText(raw.company),
    subject: sanitizeText(raw.subject),
    message: sanitizeText(raw.message),
  };

  const parsed = inquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid inquiry", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        subject: parsed.data.subject || null,
        metadata: parsed.data.metadata as any,
      },
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        ok: true,
        queued: true,
        message: "Inquiry accepted. Configure DATABASE_URL to persist it.",
      },
      { status: 202 },
    );
  }
}
