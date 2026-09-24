import { NextResponse, type NextRequest } from "next/server";

type Point = {
  latitude: number;
  longitude: number;
  city: string;
  country?: string;
};

const UPSTREAM_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function resolvePoint(
  search: string | null,
  latitude: string | null,
  longitude: string | null,
): Promise<Point> {
  if (latitude && longitude) {
    return {
      latitude: Number(latitude),
      longitude: Number(longitude),
      city: "Current location",
    };
  }

  const city = (search ?? "Gujranwala").trim();
  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.searchParams.set("name", city);
  geoUrl.searchParams.set("count", "1");
  geoUrl.searchParams.set("language", "en");

  const geoResponse = await fetchWithTimeout(geoUrl.toString());
  if (!geoResponse.ok) {
    throw new Error("Unable to resolve city");
  }

  const geoData = await geoResponse.json();
  const first = geoData?.results?.[0];
  if (!first) {
    throw new Error("City not found");
  }

  return {
    latitude: Number(first.latitude),
    longitude: Number(first.longitude),
    city: String(first.name ?? city),
    country: String(first.country ?? ""),
  };
}

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city");
    const latitude = request.nextUrl.searchParams.get("lat");
    const longitude = request.nextUrl.searchParams.get("lon");

    const point = await resolvePoint(city, latitude, longitude);

    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (weatherApiKey && !latitude && !longitude) {
      try {
        const weatherApiUrl = new URL(
          "https://api.weatherapi.com/v1/forecast.json",
        );
        weatherApiUrl.searchParams.set("key", weatherApiKey);
        weatherApiUrl.searchParams.set("q", point.city);
        weatherApiUrl.searchParams.set("days", "7");
        weatherApiUrl.searchParams.set("aqi", "no");
        weatherApiUrl.searchParams.set("alerts", "no");

        const weatherApiResponse = await fetchWithTimeout(
          weatherApiUrl.toString(),
        );
        if (!weatherApiResponse.ok) throw new Error("WeatherAPI unavailable");

        const weatherApiData = await weatherApiResponse.json();
        const current = weatherApiData.current ?? {};
        const forecastDays = weatherApiData.forecast?.forecastday ?? [];
        const location = weatherApiData.location ?? {};

        return NextResponse.json({
          location: {
            latitude: Number(location.lat ?? point.latitude),
            longitude: Number(location.lon ?? point.longitude),
            city: String(location.name ?? point.city),
            country: String(location.country ?? point.country ?? ""),
          },
          current: {
            temperature: Number(current.temp_c ?? 0),
            humidity: Number(current.humidity ?? 0),
            weatherCode: Number(current.condition?.code ?? 0),
            windSpeed: Number(current.wind_kph ?? 0),
            pressure: Number(current.pressure_mb ?? 0),
            precipitation: Number(current.precip_mm ?? 0),
            updatedAt: String(location.localtime ?? ""),
          },
          hourly: [],
          daily: forecastDays.map((day: Record<string, any>) => ({
            date: String(day.date ?? ""),
            maxTemp: Number(day.day?.maxtemp_c ?? 0),
            minTemp: Number(day.day?.mintemp_c ?? 0),
            rainChance: Number(day.day?.daily_chance_of_rain ?? 0),
            uvIndex: Number(day.day?.uv ?? 0),
            sunrise: String(day.astro?.sunrise ?? ""),
            sunset: String(day.astro?.sunset ?? ""),
            weatherCode: Number(day.day?.condition?.code ?? 0),
            condition: String(day.day?.condition?.text ?? ""),
          })),
          alerts: [],
        });
      } catch {
        // Fall back to Open-Meteo if the optional WeatherAPI key is invalid.
      }
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(point.latitude));
    weatherUrl.searchParams.set("longitude", String(point.longitude));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,precipitation",
    );
    weatherUrl.searchParams.set(
      "hourly",
      "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,uv_index",
    );
    weatherUrl.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max",
    );
    weatherUrl.searchParams.set("timezone", "auto");
    weatherUrl.searchParams.set("forecast_days", "7");

    const weatherResponse = await fetchWithTimeout(weatherUrl.toString());

    if (!weatherResponse.ok) {
      throw new Error("Unable to fetch weather forecast");
    }

    const data = await weatherResponse.json();

    const current = data.current ?? {};
    const hourly = data.hourly ?? {};
    const daily = data.daily ?? {};

    const hourlyList = (hourly.time ?? [])
      .slice(0, 12)
      .map((time: string, index: number) => ({
        time,
        temperature: Number(hourly.temperature_2m?.[index] ?? 0),
        humidity: Number(hourly.relative_humidity_2m?.[index] ?? 0),
        rainChance: Number(hourly.precipitation_probability?.[index] ?? 0),
        uvIndex: Number(hourly.uv_index?.[index] ?? 0),
        weatherCode: Number(hourly.weather_code?.[index] ?? 0),
      }));

    const dailyList = (daily.time ?? [])
      .slice(0, 7)
      .map((time: string, index: number) => ({
        date: time,
        maxTemp: Number(daily.temperature_2m_max?.[index] ?? 0),
        minTemp: Number(daily.temperature_2m_min?.[index] ?? 0),
        rainChance: Number(daily.precipitation_probability_max?.[index] ?? 0),
        uvIndex: Number(daily.uv_index_max?.[index] ?? 0),
        sunrise: String(daily.sunrise?.[index] ?? ""),
        sunset: String(daily.sunset?.[index] ?? ""),
      }));

    const alerts = [
      Number(current.precipitation ?? 0) > 2
        ? "Heavy precipitation detected. Avoid immediate spray operations."
        : null,
      Number(current.wind_speed_10m ?? 0) > 25
        ? "High wind speed. Delay foliar spray and secure field structures."
        : null,
      Number(daily.uv_index_max?.[0] ?? 0) >= 8
        ? "UV index is high. Plan labor activity in early morning/evening."
        : null,
    ].filter(Boolean);

    return NextResponse.json({
      location: point,
      current: {
        temperature: Number(current.temperature_2m ?? 0),
        humidity: Number(current.relative_humidity_2m ?? 0),
        weatherCode: Number(current.weather_code ?? 0),
        windSpeed: Number(current.wind_speed_10m ?? 0),
        pressure: Number(current.surface_pressure ?? 0),
        precipitation: Number(current.precipitation ?? 0),
        updatedAt: String(current.time ?? ""),
      },
      hourly: hourlyList,
      daily: dailyList,
      alerts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Weather fetch failed",
      },
      { status: 400 },
    );
  }
}
