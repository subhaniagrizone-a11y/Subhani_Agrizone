"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Settings } from "lucide-react";

import type { SiteSettings } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FeatureToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function AdminSiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/settings/site", {
          cache: "no-store",
        });
        const data = await response.json();
        setSettings(data.settings ?? null);
      } catch {
        setMessage("Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings/site", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error ?? "Save failed.");
      } else {
        setMessage("Settings saved successfully.");
      }
    } catch {
      setMessage("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
        </div>
      </section>
    );
  }

  if (!settings) {
    return (
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm text-sm text-destructive">
        Unable to load settings.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-normal">
          Platform Settings
        </h1>
        <Settings className="h-5 w-5 text-primary" />
      </div>

      <form className="mt-5 space-y-6" onSubmit={saveSettings}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Company name
            <Input
              value={settings.companyName}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, companyName: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Support email
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, supportEmail: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Support phone
            <Input
              value={settings.supportPhone}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, supportPhone: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Support phone 2
            <Input
              value={settings.supportPhone2}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, supportPhone2: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            WhatsApp
            <Input
              value={settings.whatsapp}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, whatsapp: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            WhatsApp 2
            <Input
              value={settings.whatsapp2}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, whatsapp2: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Address
            <Input
              value={settings.address}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, address: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Google Maps URL
            <Input
              value={settings.mapsUrl}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, mapsUrl: event.target.value } : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Working hours
            <Input
              value={settings.workingHours}
              onChange={(event) =>
                setSettings((prev) =>
                  prev ? { ...prev, workingHours: event.target.value } : prev,
                )
              }
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Facebook
            <Input
              value={settings.socials.facebook}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          facebook: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Instagram
            <Input
              value={settings.socials.instagram}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          instagram: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            YouTube
            <Input
              value={settings.socials.youtube}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          youtube: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            LinkedIn
            <Input
              value={settings.socials.linkedin}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          linkedin: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            TikTok
            <Input
              value={settings.socials.tiktok}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          tiktok: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            X / Twitter
            <Input
              value={settings.socials.x}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: { ...prev.socials, x: event.target.value },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Threads
            <Input
              value={settings.socials.threads}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          threads: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Telegram
            <Input
              value={settings.socials.telegram}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          telegram: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Pinterest
            <Input
              value={settings.socials.pinterest}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          pinterest: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Google Business
            <Input
              value={settings.socials.googleBusiness}
              onChange={(event) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socials: {
                          ...prev.socials,
                          googleBusiness: event.target.value,
                        },
                      }
                    : prev,
                )
              }
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureToggle
            label="Enable weather modules"
            checked={settings.features.weatherEnabled}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, weatherEnabled: next },
                    }
                  : prev,
              )
            }
          />
          <FeatureToggle
            label="Enable AI chatbot"
            checked={settings.features.chatbotEnabled}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, chatbotEnabled: next },
                    }
                  : prev,
              )
            }
          />
          <FeatureToggle
            label="Floating WhatsApp"
            checked={settings.features.floatingWhatsapp}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, floatingWhatsapp: next },
                    }
                  : prev,
              )
            }
          />
          <FeatureToggle
            label="Floating Call"
            checked={settings.features.floatingCall}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, floatingCall: next },
                    }
                  : prev,
              )
            }
          />
          <FeatureToggle
            label="Floating Email"
            checked={settings.features.floatingEmail}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, floatingEmail: next },
                    }
                  : prev,
              )
            }
          />
          <FeatureToggle
            label="Floating Back-to-top"
            checked={settings.features.floatingBackToTop}
            onChange={(next) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      features: { ...prev.features, floatingBackToTop: next },
                    }
                  : prev,
              )
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="luxury" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save settings
          </Button>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
