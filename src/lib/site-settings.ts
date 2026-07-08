import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/data";
import { normalizePkPhone } from "@/lib/utils";

export type SiteSettings = {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  supportPhone2: string;
  whatsapp: string;
  whatsapp2: string;
  address: string;
  mapsUrl: string;
  workingHours: string;
  socials: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    tiktok: string;
    x: string;
    threads: string;
    telegram: string;
    pinterest: string;
    googleBusiness: string;
  };
  features: {
    weatherEnabled: boolean;
    chatbotEnabled: boolean;
    floatingWhatsapp: boolean;
    floatingCall: boolean;
    floatingEmail: boolean;
    floatingBackToTop: boolean;
  };
};

export const defaultSiteSettings: SiteSettings = {
  companyName: siteConfig.name,
  supportEmail: siteConfig.contact.email,
  supportPhone: siteConfig.contact.phone,
  supportPhone2: siteConfig.contact.phone2,
  whatsapp: siteConfig.contact.whatsapp,
  whatsapp2: siteConfig.contact.whatsapp2,
  address: siteConfig.contact.address,
  mapsUrl: siteConfig.contact.mapsUrl,
  workingHours: siteConfig.contact.workingHours,
  socials: {
    facebook: siteConfig.socials.facebook,
    instagram: siteConfig.socials.instagram,
    youtube: siteConfig.socials.youtube,
    linkedin: siteConfig.socials.linkedin,
    tiktok: siteConfig.socials.tiktok,
    x: siteConfig.socials.x,
    threads: "",
    telegram: "",
    pinterest: "",
    googleBusiness: "",
  },
  features: {
    weatherEnabled: true,
    chatbotEnabled: true,
    floatingWhatsapp: true,
    floatingCall: true,
    floatingEmail: true,
    floatingBackToTop: true,
  },
};

function normalizeSettings(input: unknown): SiteSettings {
  if (!input || typeof input !== "object") {
    return defaultSiteSettings;
  }

  const value = input as Partial<SiteSettings>;

  const normalized = {
    ...defaultSiteSettings,
    ...value,
    socials: {
      ...defaultSiteSettings.socials,
      ...(value.socials ?? {}),
    },
    features: {
      ...defaultSiteSettings.features,
      ...(value.features ?? {}),
    },
  };

  return {
    ...normalized,
    supportPhone: normalizePkPhone(normalized.supportPhone),
    supportPhone2: normalizePkPhone(normalized.supportPhone2),
    whatsapp: normalizePkPhone(normalized.whatsapp),
    whatsapp2: normalizePkPhone(normalized.whatsapp2),
  };
}

export async function getSiteSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "site_settings" },
      select: { value: true },
    });

    return normalizeSettings(row?.value);
  } catch {
    return defaultSiteSettings;
  }
}

export async function upsertSiteSettings(settings: SiteSettings) {
  return prisma.siteSetting.upsert({
    where: { key: "site_settings" },
    update: {
      value: settings as any,
      group: "general",
    },
    create: {
      key: "site_settings",
      value: settings as any,
      group: "general",
    },
  });
}
