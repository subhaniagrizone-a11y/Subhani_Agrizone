import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  if (!canAccessAdmin(role)) {
    redirect("/auth/login?next=/admin");
  }

  return (
    <AdminShell userName={session?.user?.name} role={role}>
      {children}
    </AdminShell>
  );
}
