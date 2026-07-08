"use client";

import { useEffect, useState } from "react";

import type { SiteSettings } from "@/lib/site-settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/settings/site", {
          cache: "no-store",
        });
        const data = await response.json();
        if (active && data?.settings) {
          setSettings(data.settings as SiteSettings);
        }
      } catch {
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return { settings, setSettings, loading };
}
