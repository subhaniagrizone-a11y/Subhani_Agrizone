import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteQuickActionsFab } from "@/components/site/site-quick-actions-fab";
import { SupportChatbotFab } from "@/components/site/support-chatbot-fab";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/data";
import { canAccessAdmin } from "@/lib/rbac";
import { organizationJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Subhani Agrizone - Premium Agriculture Ecommerce",
    template: "%s | Subhani Agrizone",
  },
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl(),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl(),
    siteName: siteConfig.name,
    title: "Subhani Agrizone - Premium Agriculture Ecommerce",
    description: siteConfig.description,
    images: [
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85",
        width: 1600,
        height: 900,
        alt: "Agriculture field",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Subhani Agrizone - Premium Agriculture Ecommerce",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const showAdminPanel = canAccessAdmin(session?.user?.role);
  const currentUser = session?.user
    ? {
        name: session.user.name ?? "",
        image: session.user.image ?? "",
        email: session.user.email ?? "",
      }
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="sanitize-extension-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const ATTR = "fdprocessedid";

  const strip = (root) => {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("[fdprocessedid]").forEach((node) => {
      node.removeAttribute(ATTR);
    });
  };

  strip(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof Element) {
        if (mutation.target.hasAttribute(ATTR)) {
          mutation.target.removeAttribute(ATTR);
        }
      }

      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (node.hasAttribute(ATTR)) {
            node.removeAttribute(ATTR);
          }
          strip(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [ATTR],
  });

  window.addEventListener("load", () => {
    setTimeout(() => observer.disconnect(), 2000);
  });
})();`,
          }}
        />
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-soft"
          >
            Skip to content
          </a>
          <SiteHeader
            showAdminPanel={showAdminPanel}
            currentUser={currentUser}
          />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <SiteQuickActionsFab />
          <SupportChatbotFab />
        </ThemeProvider>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </body>
    </html>
  );
}
