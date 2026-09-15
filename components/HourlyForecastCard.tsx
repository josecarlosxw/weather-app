import { Droplets } from "lucide-react"
import { GlowCard } from "@/components/GlowCard"
import { ConditionIcon } from "@/components/ConditionIcon"
import { formatTemp } from "@/utils/format"
import type { Unit, WeatherPayload } from "@/types/weather"

interface Props {
  data: WeatherPayload
  unit: Unit
}

export function HourlyForecastCard({ data, unit }: Props) {
  return (
    <GlowCard theme="blue" radius="1rem" speed="8s" className="col-span-2">
      <div className="flex w-full gap-6 overflow-x-auto px-6 py-6">
        {data.hourly.map((h, i) => (
          <div key={i} className="flex shrink-0 flex-col items-center gap-2 text-white">
            <span className="text-sm font-medium">{i === 0 ? "Agora" : h.time}</span>
            <ConditionIcon condition={h.condition} className="h-6 w-6 text-white/80" />
            <span className="text-sm font-semibold tabular-nums">{formatTemp(h.temp, unit)}</span>
            <span className="flex items-center gap-0.5 text-[11px] text-sky-300/80">
              <Droplets className="h-3 w-3" />
              {h.rain}%
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}
