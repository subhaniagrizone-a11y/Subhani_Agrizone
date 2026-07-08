"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CloudSun,
  MapPin,
  Droplets,
  LocateFixed,
  Loader2,
  RefreshCw,
  Search,
  ThermometerSun,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSiteSettings } from "@/components/site/use-site-settings";

type CityOption = {
  label: string;
  city: string;
};

type WeatherPayload = {
  location: {
    city: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    weatherCode: number;
    windSpeed: number;
    pressure: number;
    precipitation: number;
    updatedAt: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    humidity: number;
    rainChance: number;
    uvIndex: number;
    weatherCode: number;
  }>;
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    rainChance: number;
    uvIndex: number;
    sunrise: string;
    sunset: string;
  }>;
  alerts: string[];
};

const cityOptions: CityOption[] = [
  { label: "Gujranwala", city: "Gujranwala" },
  { label: "Lahore", city: "Lahore" },
  { label: "Faisalabad", city: "Faisalabad" },
  { label: "Multan", city: "Multan" },
];

function weatherLabel(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed";
}

export function WeatherInsights() {
  const { settings } = useSiteSettings();
  const [selectedCity, setSelectedCity] = useState<CityOption>(cityOptions[0]);
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWeatherByCity(city: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error("Unable to fetch weather data");
      }

      const data = await response.json();
      setWeather(data as WeatherPayload);
    } catch {
      setError(
        "Weather service abhi reachable nahi hai. Thori der baad try karein.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadWeatherByGps() {
    if (!("geolocation" in navigator)) {
      setError("GPS location browser me available nahi hai.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            { cache: "no-store" },
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              String(data?.error ?? "Unable to fetch weather data"),
            );
          }
          setWeather(data as WeatherPayload);
        } catch {
          setError("GPS weather fetch failed. City search try karein.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied. City search use karein.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  useEffect(() => {
    void loadWeatherByCity(selectedCity.city);
  }, [selectedCity]);

  const weatherTitle = useMemo(() => {
    return weather ? weatherLabel(weather.current.weatherCode) : "Loading";
  }, [weather]);

  if (!settings?.features.weatherEnabled) {
    return null;
  }

  return (
    <section className="section-padding">
      <div className="container">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-emerald-50 via-background to-lime-50 dark:from-slate-900 dark:via-background dark:to-slate-900">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Farm weather</p>
              <CardTitle className="mt-2 text-2xl sm:text-3xl">
                Agriculture weather control center
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                Spray planning, irrigation timing, and crop protection decisions
                ke liye real-time weather dekhein.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {cityOptions.map((city) => (
                <Button
                  key={city.label}
                  size="sm"
                  variant={
                    selectedCity.label === city.label ? "default" : "outline"
                  }
                  onClick={() => setSelectedCity(city)}
                >
                  {city.label}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={loadWeatherByGps}>
                <LocateFixed className="h-4 w-4" />
                Use GPS
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void loadWeatherByCity(
                    weather?.location.city ?? selectedCity.city,
                  )
                }
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city (e.g. Islamabad, Karachi)"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!query.trim()) return;
                  void loadWeatherByCity(query.trim());
                }}
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-card/80">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Condition
                    </span>
                    <CloudSun className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">{weatherTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {weather?.location.city ?? selectedCity.label}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Temperature
                    </span>
                    <ThermometerSun className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {weather?.current.temperature ?? 0}°C
                  </p>
                  <p className="text-sm text-muted-foreground">
                    H: {weather?.daily?.[0]?.maxTemp ?? 0}°C | L:{" "}
                    {weather?.daily?.[0]?.minTemp ?? 0}°C
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Humidity
                    </span>
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {weather?.current.humidity ?? 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rain chance: {weather?.daily?.[0]?.rainChance ?? 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wind</span>
                    <Wind className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {weather?.current.windSpeed ?? 0} km/h
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Updated:{" "}
                    {weather?.current.updatedAt
                      ? new Date(weather.current.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {weather?.alerts?.length ? (
              <div className="mt-4 grid gap-2">
                {weather.alerts.map((alert, index) => (
                  <p
                    key={`${alert}-${index}`}
                    className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {alert}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Card className="bg-card/80">
                <CardHeader>
                  <CardTitle className="text-base">Hourly forecast</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  {weather?.hourly?.slice(0, 8).map((item) => (
                    <div
                      key={item.time}
                      className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2"
                    >
                      <span>
                        {new Date(item.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{item.temperature}°C</span>
                      <span>Rain {item.rainChance}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/80">
                <CardHeader>
                  <CardTitle className="text-base">7-day forecast</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  {weather?.daily?.map((item) => (
                    <div
                      key={item.date}
                      className="rounded-md border border-border/70 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span>
                          {item.maxTemp}° / {item.minTemp}°
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Rain {item.rainChance}%</span>
                        <span>UV {item.uvIndex}</span>
                        <span>
                          Sunrise{" "}
                          {item.sunrise
                            ? new Date(item.sunrise).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                        <span>
                          Sunset{" "}
                          {item.sunset
                            ? new Date(item.sunset).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
