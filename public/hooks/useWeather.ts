"use client"

import { useCallback, useState } from "react"
import type { City, WeatherPayload, WeatherStatus } from "@/types/weather"
import { weatherService } from "@/services/weatherService"

interface UseWeatherResult {
  data: WeatherPayload | null
  status: WeatherStatus
  notFoundQuery: string
  loadCity: (city: City) => void
  searchCity: (query: string) => void
  loadCoords: (lat: number, lon: number, name?: string, country?: string) => void
  setLocationDenied: () => void
  setError: () => void
}

/**
 * Owns fetch state for weather data. Components never call the service
 * directly — they call these actions and read `data`/`status`.
 */
export function useWeather(): UseWeatherResult {
  const [data, setData] = useState<WeatherPayload | null>(null)
  const [status, setStatus] = useState<WeatherStatus>("loading")
  const [notFoundQuery, setNotFoundQuery] = useState("")

  const loadCoords = useCallback((lat: number, lon: number, name = "Minha localização", country = "") => {
    setStatus("loading")
    weatherService
      .getWeatherForCoords(lat, lon, name, country)
      .then((res) => {
        setData(res)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [])

  const loadCity = useCallback(
    (city: City) => loadCoords(city.lat, city.lon, city.name, city.country),
    [loadCoords]
  )

  const searchCity = useCallback(
    (query: string) => {
      setStatus("loading")
      weatherService
        .searchCities(query)
        .then((results) => {
          const match = results[0]
          if (!match) {
            setNotFoundQuery(query)
            setStatus("not-found")
            return
          }
          loadCoords(match.lat, match.lon, match.name, match.country)
        })
        .catch(() => setStatus("error"))
    },
    [loadCoords]
  )

  const setLocationDenied = useCallback(() => setStatus("location-denied"), [])
  const setError = useCallback(() => setStatus("error"), [])

  return { data, status, notFoundQuery, loadCity, searchCity, loadCoords, setLocationDenied, setError }
}
