export type Condition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "partly-rain"
  | "rain"
  | "storm"
  | "snow"

export type Unit = "C" | "F"

export interface City {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  base: number // baseline temperature (°C) — only used by the mock fallback generator
  cond: Condition // only used by the mock fallback generator
}

/** A geocoding search result — what the city search box works with. */
export interface CityLocation {
  id: string
  name: string
  country: string
  lat: number
  lon: number
}

export interface HourlyPoint {
  time: string
  temp: number // °C
  condition: Condition
  rain: number // % chance
}

export interface DailyPoint {
  label: string
  date: string
  condition: Condition
  max: number // °C
  min: number // °C
  rain: number // % chance
}

export interface Metrics {
  humidity: number // %
  wind: number // km/h
  pressure: number // hPa
  uv: number
  visibility: number // km
  sunrise: string
  sunset: string
}

export interface CurrentWeather {
  temp: number // °C
  feelsLike: number // °C
  tempMax: number // °C
  tempMin: number // °C
  condition: Condition
}

export interface WeatherPayload {
  city: Pick<City, "id" | "name" | "country" | "lat" | "lon">
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  metrics: Metrics
}

export type WeatherStatus =
  | "loading"
  | "ready"
  | "error"
  | "not-found"
  | "location-denied"
