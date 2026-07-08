import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function requireApiPermission(permission: Permission) {
  if (process.env.ADMIN_GUARD !== "true") return null;

  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(role, permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
