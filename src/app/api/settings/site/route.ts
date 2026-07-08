import { NextResponse, type NextRequest } from "next/server";

import { requireApiPermission } from "@/lib/api-guard";
import { getSiteSettings, upsertSiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validators";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const blocked = await requireApiPermission("settings:write");
  if (blocked) return blocked;

  const payload = await request.json();
  const parsed = siteSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid site settings payload",
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const settings = parsed.data;
  await upsertSiteSettings(settings);

  return NextResponse.json({ ok: true, settings });
}
