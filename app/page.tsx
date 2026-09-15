"use client"

import { useEffect, useState } from "react"
import { WifiOff, AlertTriangle, MapPin, Search, ChevronRight } from "lucide-react"

import { Header } from "@/components/Header"
import { FavoritesBar } from "@/components/FavoritesBar"
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard"
import { TimeLocationCard } from "@/components/TimeLocationCard"
import { HourlyForecastCard } from "@/components/HourlyForecastCard"
import { DailyForecastCard } from "@/components/DailyForecastCard"
import { MetricsGrid } from "@/components/MetricsGrid"
import { TempChartCard } from "@/components/TempChartCard"
import { SkeletonGrid, StateCard } from "@/components/StateViews"
import { WeatherBackdrop, normalizeWeather } from "@/components/WeatherBackdrop"

import { useWeather } from "@/hooks/useWeather"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useFavorites } from "@/hooks/useFavorites"
import { CITY_DB } from "@/services/cityDb"
import type { Unit } from "@/types/weather"

export default function WeatherPage() {
  const [unit, setUnit] = useState<Unit>("C")
  const [query, setQuery] = useState("")

  const weather = useWeather()
  const geo = useGeolocation()
  const isOnline = useOnlineStatus()
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites([CITY_DB[0], CITY_DB[1]])

  const weatherVisualState = normalizeWeather(weather.data?.current.condition)

  useEffect(() => {
    weather.loadCity(CITY_DB[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUseLocation = () => {
    geo.requestLocation(
      (lat, lon) => weather.loadCoords(lat, lon),
      () => weather.setLocationDenied(),
      () => weather.setError()
    )
  }

  return (
    <div
      className="relative min-h-[720px] w-full rounded-3xl p-4 sm:p-6 md:p-8"
      style={{ background: "linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.07) 0%, transparent 45%), radial-gradient(circle at 85% 25%, rgba(9,104,229,0.10) 0%, transparent 45%)",
        }}
      />

      <WeatherBackdrop state={weatherVisualState} />

      <div className="relative z-10 mx-auto flex w-full flex-col gap-4 sm:max-w-xl lg:max-w-2xl">
        <Header
          query={query}
          setQuery={setQuery}
          onSearch={(q) => {
            weather.searchCity(q)
            setQuery("")
          }}
          onUseLocation={handleUseLocation}
          locating={geo.locating}
          unit={unit}
          setUnit={setUnit}
        />

        {weather.data && (
          <FavoritesBar
            favorites={favorites}
            activeId={weather.data.city.id}
            onPick={(city) => weather.loadCity(city)}
            onRemove={removeFavorite}
          />
        )}

        {!isOnline ? (
          <StateCard
            icon={<WifiOff className="h-8 w-8 text-white/60" />}
            title="Sem conexão"
            detail="Verifique sua internet. Os dados serão atualizados assim que a conexão voltar."
          />
        ) : weather.status === "location-denied" ? (
          <StateCard
            icon={<MapPin className="h-8 w-8 text-white/60" />}
            title="Localização negada"
            detail="Permita o acesso à localização no navegador para ver o clima da sua região, ou pesquise uma cidade."
            action={
              <button
                onClick={handleUseLocation}
                className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Tentar novamente
              </button>
            }
          />
        ) : weather.status === "not-found" ? (
          <StateCard
            icon={<Search className="h-8 w-8 text-white/60" />}
            title="Cidade não encontrada"
            detail={`Não encontramos "${weather.notFoundQuery}". Tente outro nome, como São Paulo, Lisboa ou Tóquio.`}
            action={
              <button
                onClick={() => weather.loadCity(CITY_DB[0])}
                className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Voltar
              </button>
            }
          />
        ) : weather.status === "error" ? (
          <StateCard
            icon={<AlertTriangle className="h-8 w-8 text-white/60" />}
            title="Não foi possível carregar o clima"
            detail="Algo deu errado ao buscar os dados. Tente novamente em instantes."
            action={
              <button
                onClick={() => weather.loadCity(CITY_DB[0])}
                className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Tentar novamente
              </button>
            }
          />
        ) : weather.status === "loading" || !weather.data ? (
          <SkeletonGrid />
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <HourlyForecastCard data={weather.data} unit={unit} />
            <CurrentWeatherCard
              data={weather.data}
              unit={unit}
              isFavorite={isFavorite(weather.data.city.id)}
              onToggleFavorite={() =>
                toggleFavorite({
                  id: weather.data!.city.id,
                  name: weather.data!.city.name,
                  country: weather.data!.city.country,
                  lat: weather.data!.city.lat,
                  lon: weather.data!.city.lon,
                  base: weather.data!.current.temp,
                  cond: weather.data!.current.condition,
                })
              }
            />
            <TimeLocationCard data={weather.data} />
            <DailyForecastCard data={weather.data} unit={unit} />
            <MetricsGrid data={weather.data} />
            <TempChartCard data={weather.data} unit={unit} />
          </div>
        )}

        <div className="flex items-center justify-center gap-1 pt-1 text-center text-[11px] text-white/25">
          Dados em tempo real via Open-Meteo <ChevronRight className="h-3 w-3 shrink-0" /> com fallback local se a rede falhar
        </div>
      </div>
    </div>
  )
}
