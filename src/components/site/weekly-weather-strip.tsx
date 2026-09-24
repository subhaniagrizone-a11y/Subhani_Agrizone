"use client";

import { useEffect, useState } from "react";
import {
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  RefreshCw,
  Sun,
  Umbrella,
} from "lucide-react";

import { useSiteSettings } from "@/components/site/use-site-settings";

type ForecastDay = {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainChance: number;
  condition?: string;
};

type WeatherResponse = {
  location: { city: string };
  current: { temperature: number; condition?: string };
  daily: ForecastDay[];
};

function DayIcon({
  rainChance,
  condition,
}: Pick<ForecastDay, "rainChance" | "condition">) {
  if (rainChance >= 45 || /rain|storm/i.test(condition ?? "")) {
    return <Umbrella className="h-4 w-4 text-sky-600" />;
  }
  if (/clear|sun/i.test(condition ?? "")) {
    return <Sun className="h-4 w-4 text-amber-500" />;
  }
  return <CloudSun className="h-4 w-4 text-emerald-600" />;
}

export function WeeklyWeatherStrip() {
  const { settings } = useSiteSettings();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadWeather() {
    setLoading(true);
    try {
      const response = await fetch("/api/weather?city=Gujranwala", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Weather request failed");
      setWeather((await response.json()) as WeatherResponse);
    } catch {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWeather();
  }, []);

  if (!settings?.features.weatherEnabled) return null;

  return (
    <section className="border-b border-slate-200/80 bg-[linear-gradient(110deg,#f0fdf4,#f8fafc_55%,#eff6ff)] dark:border-slate-800 dark:bg-slate-950">
      <div className="container flex min-h-14 items-center gap-3 overflow-hidden py-2">
        <div className="flex shrink-0 items-center gap-2 border-r border-slate-300/80 pr-3 dark:border-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudSun className="h-4 w-4" />
            )}
          </span>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              Field forecast
            </p>
            <p className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <MapPin className="h-3 w-3" />{" "}
              {weather?.location.city ?? "Gujranwala"}
            </p>
          </div>
        </div>

        {weather ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5">
            <div className="flex shrink-0 items-center gap-1.5 border-r border-slate-300/70 pr-3 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
              {Math.round(weather.current.temperature)}°C
              <span className="text-[10px] font-medium text-slate-500">
                now
              </span>
            </div>
            {weather.daily.map((day, index) => (
              <div
                className="flex min-w-[92px] shrink-0 items-center gap-2 rounded-md border border-white/80 bg-white/70 px-2.5 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                key={day.date}
              >
                <DayIcon
                  rainChance={day.rainChance}
                  condition={day.condition}
                />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    {index === 0
                      ? "Today"
                      : new Date(`${day.date}T12:00:00`).toLocaleDateString(
                          [],
                          { weekday: "short" },
                        )}
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {Math.round(day.maxTemp)}°{" "}
                    <span className="font-medium text-slate-400">
                      / {Math.round(day.minTemp)}°
                    </span>
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-0.5 text-[10px] text-sky-700 dark:text-sky-300">
                  <Droplets className="h-3 w-3" /> {day.rainChance}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex-1 text-xs text-slate-500">
            Weather update loading...
          </p>
        )}

        <button
          aria-label="Refresh weather"
          className="shrink-0 rounded-md p-2 text-slate-500 transition hover:bg-white hover:text-emerald-700 dark:hover:bg-slate-800"
          onClick={() => void loadWeather()}
          type="button"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </section>
  );
}
