"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { GlowCard } from "@/components/GlowCard"
import { pad2 } from "@/utils/format"
import type { WeatherPayload } from "@/types/weather"

interface Props {
  data: WeatherPayload
}

export function TimeLocationCard({ data }: Props) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

  return (
    <GlowCard theme="amber" panel="slate" radius="1.25rem" speed="4s" className="z-10">
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 py-8 text-white">
        <div className="text-5xl font-semibold tabular-nums">
          {pad2(now.getHours())}:{pad2(now.getMinutes())}
        </div>
        <div className="text-sm capitalize text-white/70">{dateLabel}</div>
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-xl">
          <MapPin className="h-3.5 w-3.5" />
          {data.city.name}
          {data.city.country ? `, ${data.city.country}` : ""}
        </div>
      </div>
    </GlowCard>
  )
}
