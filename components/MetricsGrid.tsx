import type { ReactNode } from "react"
import { Droplets, Wind, Gauge, Sun, Eye, Sunrise, Sunset } from "lucide-react"
import { GlowCard, type GlowTheme } from "@/components/GlowCard"
import type { WeatherPayload } from "@/types/weather"

function MetricTile({ icon, label, value, theme }: { icon: ReactNode; label: string; value: string | number; theme: GlowTheme }) {
  return (
    <GlowCard theme={theme} radius="0.9rem" speed="10s">
      <div className="flex h-full w-full flex-col gap-2 px-4 py-4 text-white">
        <div className="flex items-center gap-1.5 text-white/50">
          {icon}
          <span className="text-[11px] font-medium">{label}</span>
        </div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </div>
    </GlowCard>
  )
}

interface Props {
  data: WeatherPayload
}

export function MetricsGrid({ data }: Props) {
  const m = data.metrics
  const tiles: Array<{ icon: ReactNode; label: string; value: string | number; theme: GlowTheme }> = [
    { icon: <Droplets className="h-3.5 w-3.5" />, label: "Umidade", value: `${m.humidity}%`, theme: "blue" },
    { icon: <Wind className="h-3.5 w-3.5" />, label: "Vento", value: `${m.wind} km/h`, theme: "blue" },
    { icon: <Gauge className="h-3.5 w-3.5" />, label: "Pressão", value: `${m.pressure} hPa`, theme: "white" },
    { icon: <Sun className="h-3.5 w-3.5" />, label: "Índice UV", value: m.uv, theme: "amber" },
    { icon: <Eye className="h-3.5 w-3.5" />, label: "Visibilidade", value: `${m.visibility} km`, theme: "white" },
    { icon: <Sunrise className="h-3.5 w-3.5" />, label: "Nascer do sol", value: m.sunrise, theme: "amber" },
    { icon: <Sunset className="h-3.5 w-3.5" />, label: "Pôr do sol", value: m.sunset, theme: "amber" },
  ]

  return (
    <div className="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {tiles.map((t, i) => (
        <MetricTile key={i} {...t} />
      ))}
    </div>
  )
}
