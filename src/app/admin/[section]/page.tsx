import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBlogManager } from "@/components/admin/admin-blog-manager";
import { AdminCollectionManager } from "@/components/admin/admin-collection-manager";
import { AdminDiseaseManager } from "@/components/admin/admin-disease-manager";
import { AdminHomepageItemsManager } from "@/components/admin/admin-homepage-items-manager";
import { AdminInquiriesManager } from "@/components/admin/admin-inquiries-manager";
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";
import { AdminSiteSettingsForm } from "@/components/admin/admin-site-settings-form";
import { AdminTestimonialManager } from "@/components/admin/admin-testimonial-manager";
import { getAdminModuleBySlug } from "@/lib/admin-config";

const sectionCollections: Record<
  string,
  {
    title: string;
    description: string;
    fields: { key: string; label: string; placeholder?: string }[];
  }
> = {
  categories: {
    title: "Categories",
    description: "Manage category structure and catalog grouping.",
    fields: [
      { key: "name", label: "Name", placeholder: "Fungicides" },
      { key: "slug", label: "Slug", placeholder: "fungicides" },
      {
        key: "description",
        label: "Description",
        placeholder: "Category summary",
      },
    ],
  },
  brands: {
    title: "Brands",
    description: "Manage partner and in-house brands.",
    fields: [
      { key: "name", label: "Name", placeholder: "Subhani Pro" },
      { key: "slug", label: "Slug", placeholder: "subhani-pro" },
      { key: "website", label: "Website", placeholder: "https://..." },
    ],
  },
  "crop-types": {
    title: "Crop Types",
    description: "Maintain crop taxonomy for recommendations and pages.",
    fields: [
      { key: "name", label: "Crop name", placeholder: "Wheat" },
      { key: "season", label: "Season", placeholder: "Rabi" },
      { key: "notes", label: "Notes", placeholder: "Crop notes" },
    ],
  },
  "active-ingredients": {
    title: "Active Ingredients",
    description: "Maintain formulation ingredients and strengths.",
    fields: [
      { key: "name", label: "Ingredient", placeholder: "Azoxystrobin" },
      { key: "strength", label: "Strength", placeholder: "250g/L" },
      { key: "notes", label: "Notes", placeholder: "Usage note" },
    ],
  },
  downloads: {
    title: "Downloads",
    description: "Manage brochures, labels, and support files.",
    fields: [
      { key: "title", label: "Title", placeholder: "Product brochure" },
      { key: "fileUrl", label: "File URL", placeholder: "https://...pdf" },
      { key: "type", label: "Type", placeholder: "Brochure" },
    ],
  },
  faqs: {
    title: "FAQs",
    description: "Manage frequently asked questions and answers.",
    fields: [
      { key: "question", label: "Question", placeholder: "How to apply?" },
      { key: "answer", label: "Answer", placeholder: "Answer details" },
      { key: "category", label: "Category", placeholder: "Application" },
    ],
  },
  banners: {
    title: "Banners",
    description: "Control campaign and hero banners.",
    fields: [
      { key: "title", label: "Title", placeholder: "Kharif Campaign" },
      { key: "image", label: "Image URL", placeholder: "https://..." },
      { key: "targetUrl", label: "Target URL", placeholder: "/products" },
    ],
  },
  pages: {
    title: "Pages",
    description: "Manage static page records and publishing metadata.",
    fields: [
      { key: "title", label: "Title", placeholder: "About us" },
      { key: "slug", label: "Slug", placeholder: "about-us" },
      { key: "status", label: "Status", placeholder: "published" },
    ],
  },
  "media-library": {
    title: "Media Library",
    description: "Track reusable media assets for content teams.",
    fields: [
      { key: "name", label: "Asset name", placeholder: "Wheat banner" },
      { key: "url", label: "Asset URL", placeholder: "https://..." },
      { key: "tag", label: "Tag", placeholder: "homepage" },
    ],
  },
  newsletter: {
    title: "Newsletter",
    description: "Manage newsletter campaigns and audience operations.",
    fields: [
      {
        key: "title",
        label: "Campaign title",
        placeholder: "July Agronomy Tips",
      },
      { key: "segment", label: "Segment", placeholder: "Farmers" },
      { key: "status", label: "Status", placeholder: "draft" },
    ],
  },
  users: {
    title: "Users",
    description: "Admin operator records and ownership mapping.",
    fields: [
      { key: "name", label: "Name", placeholder: "Admin User" },
      { key: "email", label: "Email", placeholder: "admin@example.com" },
      { key: "role", label: "Role", placeholder: "MANAGER" },
    ],
  },
  roles: {
    title: "Roles & Permissions",
    description: "Role templates and permission policies.",
    fields: [
      { key: "name", label: "Role", placeholder: "Catalog Editor" },
      { key: "scope", label: "Scope", placeholder: "products, cms" },
      { key: "notes", label: "Notes", placeholder: "Role notes" },
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Track and save analytics widgets and reports.",
    fields: [
      { key: "name", label: "Widget", placeholder: "Top products" },
      { key: "metric", label: "Metric", placeholder: "orders" },
      { key: "period", label: "Period", placeholder: "7d" },
    ],
  },
  backup: {
    title: "Backup",
    description: "Backup policy and restore record register.",
    fields: [
      { key: "name", label: "Policy", placeholder: "Daily snapshot" },
      { key: "retention", label: "Retention", placeholder: "14 days" },
      { key: "status", label: "Status", placeholder: "active" },
    ],
  },
  logs: {
    title: "Logs",
    description: "Operational log notes and incident tracking.",
    fields: [
      { key: "event", label: "Event", placeholder: "Catalog bulk update" },
      { key: "severity", label: "Severity", placeholder: "info" },
      { key: "actor", label: "Actor", placeholder: "admin@site.com" },
    ],
  },
  profile: {
    title: "Profile",
    description: "Personal admin preferences and identity notes.",
    fields: [
      { key: "displayName", label: "Display name", placeholder: "Admin" },
      { key: "phone", label: "Phone", placeholder: "+923001234567" },
      { key: "timezone", label: "Timezone", placeholder: "Asia/Karachi" },
    ],
  },
};

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

  if (section === "blogs") return <AdminBlogManager />;
  if (section === "testimonials") return <AdminTestimonialManager />;
  if (section === "gallery") {
    return (
      <AdminHomepageItemsManager
        sectionKey="home_gallery"
        title="Gallery Workstation"
        description="Add, edit, and remove gallery items used on the homepage."
        fieldDefs={[
          { key: "title", label: "Title", placeholder: "Image title" },
          { key: "image", label: "Image URL", placeholder: "https://..." },
        ]}
      />
    );
  }
  if (section === "diseases") {
    return <AdminDiseaseManager />;
  }
  if (section === "contact-messages") {
    return (
      <AdminInquiriesManager
        title="Contact Messages"
        description="Live inquiries from website forms with resolution workflow."
      />
    );
  }
  if (section === "leads") {
    return (
      <AdminInquiriesManager
        type="BULK_INQUIRY"
        title="Leads"
        description="Sales lead queue based on inquiry submissions."
      />
    );
  }
  if (section === "website-settings") {
    return <AdminSiteSettingsForm />;
  }

  const collection = sectionCollections[section];
  if (collection) {
    return (
      <AdminCollectionManager
        module={section}
        title={collection.title}
        description={collection.description}
        fields={collection.fields}
      />
    );
  }

  return <AdminPlaceholderPage module={module} />;
}
