import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BellRing,
  Boxes,
  DatabaseBackup,
  FileArchive,
  FileBadge,
  FileChartColumn,
  FileCode2,
  FileSpreadsheet,
  Files,
  FileText,
  GalleryVerticalEnd,
  Globe2,
  LayoutDashboard,
  Leaf,
  LifeBuoy,
  Logs,
  Megaphone,
  MessageSquareMore,
  Newspaper,
  Package,
  PanelsTopLeft,
  SearchCheck,
  Settings,
  ShieldCheck,
  Sprout,
  Tags,
  TestTubeDiagonal,
  Users,
} from "lucide-react";

export type AdminModule = {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  eyebrow: string;
  capabilities: string[];
  metrics: { label: string; value: string }[];
};

export type AdminNavGroup = {
  title: string;
  items: AdminModule[];
};

function createModule(
  slug: string,
  label: string,
  icon: LucideIcon,
  description: string,
  eyebrow: string,
  capabilities: string[],
  metrics: { label: string; value: string }[],
): AdminModule {
  return {
    slug,
    label,
    href: `/admin/${slug}`,
    icon,
    description,
    eyebrow,
    capabilities,
    metrics: metrics.map((metric) => ({ ...metric, value: "0" })),
  };
}

export const adminOverviewLinks = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Executive summary, quick actions, and health monitoring.",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Product catalog, pricing, inventory, and publishing.",
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: FileText,
    description: "Homepage, brand content, and marketing sections.",
  },
  {
    label: "SEO",
    href: "/admin/seo",
    icon: SearchCheck,
    description: "Search snippets, schema, and organic growth controls.",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: FileSpreadsheet,
    description: "Order operations, fulfillment, and payment tracking.",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    description: "Customer accounts, segments, and activity lifecycle.",
  },
] as const;

const catalogModules = [
  createModule(
    "categories",
    "Categories",
    Tags,
    "Organize the product catalog with structured category hierarchies, visual assets, and SEO metadata.",
    "Catalog structure",
    [
      "Category taxonomy",
      "Image and icon management",
      "SEO and sorting controls",
    ],
    [
      { label: "Active", value: "12" },
      { label: "Pending updates", value: "3" },
    ],
  ),
  createModule(
    "brands",
    "Brands",
    BadgeCheck,
    "Manage brand pages, partner assets, and trust signals across the storefront.",
    "Brand governance",
    [
      "Brand directories",
      "Partner logos",
      "Brand story and credibility blocks",
    ],
    [
      { label: "Featured", value: "5" },
      { label: "Needs review", value: "2" },
    ],
  ),
  createModule(
    "crop-types",
    "Crop Types",
    Sprout,
    "Map products to crop use-cases for better discovery, filtering, and agronomy targeting.",
    "Crop intelligence",
    ["Crop taxonomy", "Use-case mapping", "Landing page support"],
    [
      { label: "Mapped crops", value: "18" },
      { label: "Coverage gaps", value: "4" },
    ],
  ),
  createModule(
    "diseases",
    "Disease Intelligence",
    TestTubeDiagonal,
    "Maintain disease and problem catalogs to connect product recommendations with field issues.",
    "Problem mapping",
    [
      "Disease library",
      "Product linkage",
      "Seasonal relevance",
      "Operational workflows",
    ],
    [
      { label: "Indexed", value: "27" },
      { label: "Priority", value: "6" },
    ],
  ),
  createModule(
    "active-ingredients",
    "Active Ingredients",
    Leaf,
    "Create reusable ingredient profiles with percentages, badges, and display ordering for product detail pages.",
    "Formulation library",
    ["Unlimited ingredients", "Badge colors", "Sort order and status"],
    [
      { label: "Ingredient records", value: "46" },
      { label: "Unassigned", value: "8" },
    ],
  ),
  createModule(
    "downloads",
    "Downloads",
    FileArchive,
    "Manage brochures, labels, manuals, and technical documents with version awareness.",
    "Collateral hub",
    ["PDF asset control", "Compliance docs", "Catalog attachments"],
    [
      { label: "Live assets", value: "34" },
      { label: "Expiring", value: "2" },
    ],
  ),
];

const contentModules = [
  createModule(
    "gallery",
    "Gallery",
    GalleryVerticalEnd,
    "Curate proof-rich visual storytelling for crops, fields, customers, and product applications.",
    "Visual storytelling",
    ["Campaign albums", "Field proof", "Homepage media curation"],
    [
      { label: "Assets", value: "128" },
      { label: "Featured", value: "18" },
    ],
  ),
  createModule(
    "blogs",
    "Blogs",
    Newspaper,
    "Publish agronomy insights, seasonal guides, and SEO-focused educational content.",
    "Content engine",
    ["Editorial planning", "Author workflow", "Scheduled publishing"],
    [
      { label: "Published", value: "14" },
      { label: "Drafts", value: "5" },
    ],
  ),
  createModule(
    "testimonials",
    "Testimonials",
    MessageSquareMore,
    "Manage trust-building customer quotes, dealer endorsements, and case studies.",
    "Trust signals",
    ["Quote approvals", "Role tagging", "Homepage placement"],
    [
      { label: "Approved", value: "11" },
      { label: "Pending", value: "2" },
    ],
  ),
  createModule(
    "faqs",
    "FAQs",
    FileBadge,
    "Structure frequent questions and buyer reassurance content by product and topic.",
    "Buyer enablement",
    ["Grouped FAQs", "Searchable help", "Homepage and PDP usage"],
    [
      { label: "Articles", value: "24" },
      { label: "Needs update", value: "3" },
    ],
  ),
  createModule(
    "banners",
    "Banners",
    PanelsTopLeft,
    "Control hero slots, seasonal promos, and high-conversion campaign banners.",
    "Campaign surfaces",
    ["Hero scheduling", "Promo targeting", "Creative sequencing"],
    [
      { label: "Live banners", value: "7" },
      { label: "Queued", value: "4" },
    ],
  ),
  createModule(
    "pages",
    "Pages",
    Files,
    "Manage evergreen website pages, landing experiences, and legal content from one place.",
    "Site publishing",
    ["Reusable sections", "SEO controls", "Publishing status"],
    [
      { label: "Published pages", value: "16" },
      { label: "Needs review", value: "1" },
    ],
  ),
  createModule(
    "media-library",
    "Media Library",
    GalleryVerticalEnd,
    "Centralize media folders, optimization, search, and asset governance for the full team.",
    "Asset system",
    ["Folder taxonomy", "Bulk actions", "Optimization tracking"],
    [
      { label: "Library items", value: "412" },
      { label: "Unused", value: "19" },
    ],
  ),
];

const engagementModules = [
  createModule(
    "leads",
    "Leads",
    BellRing,
    "Track sales opportunities, dealer prospects, and pipeline follow-ups.",
    "Pipeline",
    ["Source tracking", "Stage updates", "Owner assignment"],
    [
      { label: "Open leads", value: "29" },
      { label: "Qualified", value: "9" },
    ],
  ),
  createModule(
    "contact-messages",
    "Contact Messages",
    MessageSquareMore,
    "Triage contact form submissions, assign replies, and export customer conversations.",
    "Inbox operations",
    ["Reply workflow", "Status control", "Export support"],
    [
      { label: "Unread", value: "6" },
      { label: "Resolved", value: "84" },
    ],
  ),
  createModule(
    "newsletter",
    "Newsletter",
    Megaphone,
    "Grow and activate subscriber lists with imports, exports, and campaign management.",
    "Audience growth",
    ["Subscriber exports", "List hygiene", "Campaign preparation"],
    [
      { label: "Subscribers", value: "1,284" },
      { label: "New this week", value: "38" },
    ],
  ),
];

const systemModules = [
  createModule(
    "website-settings",
    "Website Settings",
    Settings,
    "Configure company identity, contact details, footer settings, maps, and social profiles.",
    "Core configuration",
    ["Brand identity", "Contact settings", "Footer and social controls"],
    [
      { label: "Config groups", value: "9" },
      { label: "Pending changes", value: "2" },
    ],
  ),
  createModule(
    "users",
    "Users",
    Users,
    "Manage admin users, operators, editors, and support staff with accountability.",
    "Access operations",
    ["User lifecycle", "Invitation flow", "Admin ownership"],
    [
      { label: "Active users", value: "8" },
      { label: "Pending invites", value: "1" },
    ],
  ),
  createModule(
    "roles",
    "Roles & Permissions",
    ShieldCheck,
    "Define role-based access, granular permissions, and approval boundaries.",
    "Governance",
    ["RBAC mapping", "Permission presets", "Audit readiness"],
    [
      { label: "Roles", value: "4" },
      { label: "Permission sets", value: "11" },
    ],
  ),
  createModule(
    "analytics",
    "Analytics",
    FileChartColumn,
    "Monitor visitor trends, search intent, product attention, and acquisition quality.",
    "Performance intelligence",
    ["Traffic dashboards", "Top products", "Source attribution"],
    [
      { label: "Tracked pages", value: "60" },
      { label: "Anomalies", value: "3" },
    ],
  ),
  createModule(
    "backup",
    "Backup",
    DatabaseBackup,
    "Schedule backup operations, verify restore points, and reduce operational risk.",
    "Resilience",
    ["Snapshot policy", "Restore readiness", "Operational assurance"],
    [
      { label: "Latest backup", value: "2h ago" },
      { label: "Retention", value: "14 days" },
    ],
  ),
  createModule(
    "logs",
    "Logs",
    Logs,
    "Inspect audit trails, activity records, and operational incidents in one place.",
    "Observability",
    ["Audit logs", "Security events", "Operator actions"],
    [
      { label: "Events today", value: "146" },
      { label: "Warnings", value: "4" },
    ],
  ),
  createModule(
    "profile",
    "Profile",
    Activity,
    "Manage personal admin preferences, identity details, and security posture.",
    "Operator profile",
    ["Profile settings", "Security review", "Session overview"],
    [
      { label: "Sessions", value: "2" },
      { label: "Last login", value: "Today" },
    ],
  ),
];

export const adminNavigationGroups: AdminNavGroup[] = [
  { title: "Catalog", items: catalogModules },
  { title: "Content", items: contentModules },
  { title: "Growth", items: engagementModules },
  { title: "System", items: systemModules },
];

export const adminModules = [
  ...catalogModules,
  ...contentModules,
  ...engagementModules,
  ...systemModules,
];

export function getAdminModuleBySlug(slug: string) {
  return adminModules.find((module) => module.slug === slug);
}

export const adminDashboardStats = [
  { label: "Total products", value: "0", change: "0 change" },
  { label: "Total categories", value: "0", change: "0 change" },
  { label: "Monthly visitors", value: "0", change: "0% change" },
  { label: "Today\'s visitors", value: "0", change: "0% change" },
  { label: "Weekly visitors", value: "0", change: "0% change" },
  { label: "Website status", value: "0", change: "No data yet" },
];

export const adminActivityFeed = [
  {
    title: "No activity yet",
    detail: "Start adding your real data to see live activity updates.",
    time: "0",
  },
];

export const adminHealthChecks = [
  { label: "Storefront uptime", value: "0%", tone: "ok" },
  { label: "Queued emails", value: "0", tone: "ok" },
  { label: "Low-stock products", value: "0", tone: "ok" },
  { label: "Failed jobs", value: "0", tone: "ok" },
] as const;

export const adminTrafficSeries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
