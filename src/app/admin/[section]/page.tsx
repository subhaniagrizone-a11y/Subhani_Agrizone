import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { getAdminModuleBySlug } from "@/lib/admin-config";

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({
  params,
}: AdminSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const module = getAdminModuleBySlug(section);

  if (!module) {
    return { title: "Admin" };
  }

  return {
    title: module.label,
    description: module.description,
  };
}

export default async function AdminSectionPage({
  params,
}: AdminSectionPageProps) {
  const { section } = await params;
  const module = getAdminModuleBySlug(section);

  if (!module) {
    notFound();
  }

  return <AdminPlaceholderPage module={module} />;
}
