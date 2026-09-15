import { Star } from "lucide-react"
import { GlowCard } from "@/components/GlowCard"
import { ConditionIcon } from "@/components/ConditionIcon"
import { CONDITION_LABEL, formatTemp } from "@/utils/format"
import type { Unit, WeatherPayload } from "@/types/weather"

interface Props {
  data: WeatherPayload
  unit: Unit
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function CurrentWeatherCard({ data, unit, isFavorite, onToggleFavorite }: Props) {
  return (
    <GlowCard theme="white" panel="dark" radius="1rem" speed="4s" className="z-10">
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-6 py-8 text-white">
        <button
          onClick={onToggleFavorite}
          aria-label="Favoritar cidade"
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-300 text-amber-300" : ""}`} />
        </button>
        <ConditionIcon condition={data.current.condition} className="h-8 w-8 text-white/80" />
        <div className="text-6xl font-semibold tabular-nums">{formatTemp(data.current.temp, unit)}</div>
        <div className="text-sm text-white/70">
          {CONDITION_LABEL[data.current.condition]} · Sensação {formatTemp(data.current.feelsLike, unit)}
        </div>
        <div className="mt-1 text-xs text-white/50">
          Máx {formatTemp(data.current.tempMax, unit)} · Mín {formatTemp(data.current.tempMin, unit)}
        </div>
      </div>
    </GlowCard>
  )
}
