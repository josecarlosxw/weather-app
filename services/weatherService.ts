import type { City, CityLocation, Condition, DailyPoint, HourlyPoint, WeatherPayload } from "@/types/weather"
import { hashString, mulberry32 } from "@/utils/seededRandom"
import { pad2, weekdayShort, dayMonth } from "@/utils/format"
import { mapWmoCode } from "@/utils/wmoCode"
import { CITY_DB, findCityByQuery } from "@/services/cityDb"

const CONDITIONS: Condition[] = ["clear", "partly-cloudy", "cloudy", "partly-rain", "rain", "storm", "snow"]

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

/**
 * Public contract for anything that can answer "what's the weather" and
 * "which cities match this search". The rest of the app (hooks/components)
 * only ever talks to this shape, so swapping providers never touches a
 * component.
 */
export interface WeatherService {
  searchCities(query: string): Promise<CityLocation[]>
  getWeatherForCoords(lat: number, lon: number, name: string, country: string): Promise<WeatherPayload>
}

function fetchWithTimeout(url: string, ms = 7000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

/* --------------------------- mock fallback data --------------------------
   Deterministic per-city generator. Used by MockWeatherService directly,
   and as an automatic fallback inside RealWeatherService if the live API
   is unreachable (offline, blocked, rate-limited), so the UI never breaks. */

function buildHourlyMock(city: City, rng: () => number): HourlyPoint[] {
  const nowHour = new Date().getHours()
  return Array.from({ length: 8 }).map((_, i) => {
    const hour = (nowHour + i) % 24
    const drift = Math.sin((hour / 24) * Math.PI * 2 - 1.2) * 4
    const temp = city.base + drift + (rng() - 0.5) * 2
    const condition = i === 0 ? city.cond : CONDITIONS[Math.floor(rng() * CONDITIONS.length)]
    return { time: `${pad2(hour)}:00`, temp, condition, rain: Math.round(rng() * 100) }
  })
}

function buildDailyMock(city: City, rng: () => number): DailyPoint[] {
  const now = new Date()
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() + i)
    const swing = 3 + rng() * 4
    const max = city.base + swing + (rng() - 0.5) * 3
    const min = max - (5 + rng() * 6)
    const condition = i === 0 ? city.cond : CONDITIONS[Math.floor(rng() * CONDITIONS.length)]
    return { label: weekdayShort(date, i), date: dayMonth(date), condition, max, min, rain: Math.round(rng() * 100) }
  })
}

function buildMockPayload(city: City): WeatherPayload {
  const rng = mulberry32(hashString(city.id) ^ new Date().toDateString().length)
  const hourly = buildHourlyMock(city, rng)
  const daily = buildDailyMock(city, rng)
  const sunriseH = 6 + Math.floor(rng() * 2)
  const sunsetH = 17 + Math.floor(rng() * 3)

  return {
    city: { id: city.id, name: city.name, country: city.country, lat: city.lat, lon: city.lon },
    current: {
      temp: hourly[0].temp,
      feelsLike: hourly[0].temp + (rng() - 0.5) * 3,
      tempMax: daily[0]?.max ?? city.base + 4,
      tempMin: daily[0]?.min ?? city.base - 4,
      condition: city.cond,
    },
    hourly,
    daily,
    metrics: {
      humidity: Math.round(35 + rng() * 55),
      wind: Math.round(4 + rng() * 30),
      pressure: Math.round(995 + rng() * 30),
      uv: Math.round(rng() * 11),
      visibility: Math.round(4 + rng() * 16),
      sunrise: `${pad2(sunriseH)}:${pad2(Math.floor(rng() * 60))}`,
      sunset: `${pad2(sunsetH)}:${pad2(Math.floor(rng() * 60))}`,
    },
  }
}

function nearestMockCity(lat: number, lon: number): City {
  let best = CITY_DB[0]
  let bestDist = Infinity
  for (const c of CITY_DB) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

function withLatency<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export class MockWeatherService implements WeatherService {
  async searchCities(query: string): Promise<CityLocation[]> {
    const city = findCityByQuery(query)
    return withLatency(city ? [city] : [], 300)
  }

  async getWeatherForCoords(lat: number, lon: number, name: string, country: string): Promise<WeatherPayload> {
    const base = nearestMockCity(lat, lon)
    const synthetic: City = { ...base, id: `mock-${lat.toFixed(2)}-${lon.toFixed(2)}`, name: name || base.name, country }
    return withLatency(buildMockPayload(synthetic), 550 + Math.random() * 350)
  }
}

/* ------------------------------- real service -----------------------------
   Talks to Open-Meteo (no API key required, CORS enabled for the browser):
   https://open-meteo.com/en/docs  +  https://open-meteo.com/en/docs/geocoding-api
   Falls back to the mock generator if the network call fails, so a blocked
   or offline connection degrades gracefully instead of breaking the UI. */

export class RealWeatherService implements WeatherService {
  private fallback = new MockWeatherService()

  async searchCities(query: string): Promise<CityLocation[]> {
    const q = query.trim()
    if (!q) return []
    try {
      const url = `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=6&language=pt&format=json`
      const res = await fetchWithTimeout(url)
      if (!res.ok) throw new Error(`geocoding ${res.status}`)
      const json = await res.json()
      const results = Array.isArray(json.results) ? json.results : []
      return results.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        country: r.country ?? "",
        lat: r.latitude,
        lon: r.longitude,
      }))
    } catch {
      // Network unavailable / blocked — fall back to the small local list
      // so search still works for the demo cities.
      return this.fallback.searchCities(query)
    }
  }

  async getWeatherForCoords(lat: number, lon: number, name: string, country: string): Promise<WeatherPayload> {
    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,visibility",
        hourly: "temperature_2m,weather_code,precipitation_probability",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
        timezone: "auto",
        forecast_days: "7",
      })
      const res = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`)
      if (!res.ok) throw new Error(`forecast ${res.status}`)
      const json = await res.json()
      return this.toPayload(json, name, country)
    } catch {
      return this.fallback.getWeatherForCoords(lat, lon, name, country)
    }
  }

  private toPayload(json: any, name: string, country: string): WeatherPayload {
    const nowIso: string = json.current.time
    const hourlyTimes: string[] = json.hourly.time
    let startIdx = hourlyTimes.findIndex((t) => t >= nowIso)
    if (startIdx < 0) startIdx = 0

    const hourly: HourlyPoint[] = hourlyTimes.slice(startIdx, startIdx + 8).map((t, i) => {
      const idx = startIdx + i
      return {
        time: t.slice(11, 16),
        temp: json.hourly.temperature_2m[idx],
        condition: mapWmoCode(json.hourly.weather_code[idx]),
        rain: Math.round(json.hourly.precipitation_probability?.[idx] ?? 0),
      }
    })

    const daily: DailyPoint[] = json.daily.time.map((t: string, i: number) => {
      const date = new Date(`${t}T00:00:00`)
      return {
        label: weekdayShort(date, i),
        date: dayMonth(date),
        condition: mapWmoCode(json.daily.weather_code[i]),
        max: json.daily.temperature_2m_max[i],
        min: json.daily.temperature_2m_min[i],
        rain: Math.round(json.daily.precipitation_probability_max?.[i] ?? 0),
      }
    })

    return {
      city: { id: `${json.latitude},${json.longitude}`, name, country, lat: json.latitude, lon: json.longitude },
      current: {
        temp: json.current.temperature_2m,
        feelsLike: json.current.apparent_temperature,
        tempMax: daily[0]?.max ?? json.current.temperature_2m,
        tempMin: daily[0]?.min ?? json.current.temperature_2m,
        condition: mapWmoCode(json.current.weather_code),
      },
      hourly,
      daily,
      metrics: {
        humidity: Math.round(json.current.relative_humidity_2m),
        wind: Math.round(json.current.wind_speed_10m),
        pressure: Math.round(json.current.surface_pressure),
        uv: Math.round(json.daily.uv_index_max?.[0] ?? 0),
        visibility: Math.round((json.current.visibility ?? 10000) / 1000),
        sunrise: (json.daily.sunrise?.[0] ?? "").slice(11, 16),
        sunset: (json.daily.sunset?.[0] ?? "").slice(11, 16),
      },
    }
  }
}

// Real data by default. Set NEXT_PUBLIC_USE_MOCK_WEATHER=1 to force the
// mock service (useful for offline development or Storybook/tests).
export const weatherService: WeatherService =
  process.env.NEXT_PUBLIC_USE_MOCK_WEATHER === "1" ? new MockWeatherService() : new RealWeatherService()
