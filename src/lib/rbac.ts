import type { Role } from "@prisma/client";

export type AppRole = Role | "SUPER_ADMIN";

export type Permission =
  | "admin:access"
  | "products:read"
  | "products:write"
  | "products:bulk"
  | "cms:read"
  | "cms:write"
  | "seo:write"
  | "orders:read"
  | "orders:write"
  | "customers:read"
  | "settings:write";

const permissionsByRole: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: [
    "admin:access",
    "products:read",
    "products:write",
    "products:bulk",
    "cms:read",
    "cms:write",
    "seo:write",
    "orders:read",
    "orders:write",
    "customers:read",
    "settings:write",
  ],
  ADMIN: [
    "admin:access",
    "products:read",
    "products:write",
    "products:bulk",
    "cms:read",
    "cms:write",
    "seo:write",
    "orders:read",
    "orders:write",
    "customers:read",
    "settings:write",
  ],
  MANAGER: [
    "admin:access",
    "products:read",
    "products:write",
    "products:bulk",
    "cms:read",
    "cms:write",
    "orders:read",
    "orders:write",
    "customers:read",
  ],
  SUPPORT: ["admin:access", "orders:read", "customers:read", "cms:read"],
  DEALER: ["products:read"],
  FARMER: ["products:read"],
  CUSTOMER: ["products:read"],
};

export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
) {
  if (!role) return false;
  const rolePermissions = permissionsByRole[role as AppRole];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  role: string | null | undefined,
  permissions: Permission[],
) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAccessAdmin(role: string | null | undefined) {
  return hasPermission(role, "admin:access");
}
