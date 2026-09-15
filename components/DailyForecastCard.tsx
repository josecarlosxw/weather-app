import { Droplets } from "lucide-react"
import { GlowCard } from "@/components/GlowCard"
import { ConditionIcon } from "@/components/ConditionIcon"
import { formatTemp } from "@/utils/format"
import type { Unit, WeatherPayload } from "@/types/weather"

interface Props {
  data: WeatherPayload
  unit: Unit
}

export function DailyForecastCard({ data, unit }: Props) {
  return (
    <GlowCard theme="aurora" panel="soft" radius="1.25rem" speed="6s" className="col-span-2">
      <div className="flex w-full flex-col divide-y divide-white/5 px-5 py-3">
        {data.daily.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5 text-white">
            <div className="flex w-24 flex-col">
              <span className="text-sm font-medium capitalize">{d.label}</span>
              <span className="text-[11px] text-white/40">{d.date}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <ConditionIcon condition={d.condition} className="h-5 w-5" />
              <span className="flex w-10 items-center gap-0.5 text-[11px] text-sky-300/80">
                <Droplets className="h-3 w-3" />
                {d.rain}%
              </span>
            </div>
            <div className="flex w-20 items-center justify-end gap-2 text-sm tabular-nums">
              <span className="font-semibold">{formatTemp(d.max, unit)}</span>
              <span className="text-white/40">{formatTemp(d.min, unit)}</span>
            </div>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}
