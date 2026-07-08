import { NextResponse, type NextRequest } from "next/server";

import { sendMail } from "@/lib/email";

function canUseDebugRoute(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return true;

  const expected = process.env.DEBUG_SMTP_KEY;
  if (!expected) return false;

  const provided = request.headers.get("x-debug-key");
  return provided === expected;
}

export async function POST(request: NextRequest) {
  if (!canUseDebugRoute(request)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let body: { to?: string } | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const to =
    body?.to?.trim() || process.env.SMTP_USER || process.env.SMTP_FROM || "";

  if (!to) {
    return NextResponse.json(
      { error: "Recipient is required (set body.to or SMTP_USER/SMTP_FROM)." },
      { status: 422 },
    );
  }

  const subject = "SMTP test - Subhani Agrizone";
  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;padding:16px;line-height:1.6">
      <h2 style="margin:0 0 8px">SMTP test successful</h2>
      <p style="margin:0 0 8px">This is a test email from your local setup.</p>
      <p style="margin:0;color:#64748b">If you received this, verification emails should also work.</p>
    </div>
  `;

  try {
    const result = await sendMail({
      to,
      subject,
      html,
      text: "SMTP test successful. If you received this, verification emails should also work.",
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "SMTP not configured",
          ...("missing" in result ? { missing: result.missing } : {}),
        },
        { status: 202 },
      );
    }

    return NextResponse.json({ ok: true, sentTo: to });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "SMTP send failed", details: message },
      { status: 500 },
    );
  }
}
