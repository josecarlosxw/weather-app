"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { GlowCard } from "@/components/GlowCard"
import { ConditionIcon } from "@/components/ConditionIcon"
import { CONDITION_LABEL, toFahrenheit } from "@/utils/format"
import { Droplets } from "lucide-react"
import type { Unit, WeatherPayload } from "@/types/weather"

interface Props {
  data: WeatherPayload
  unit: Unit
}

// Cold -> hot thermal palette, mapped from the raw Celsius value so the
// color reads the same regardless of the selected display unit.
const THERMAL_STOPS: Array<{ t: number; rgb: [number, number, number] }> = [
  { t: 0, rgb: [56, 132, 255] },
  { t: 14, rgb: [56, 189, 248] },
  { t: 22, rgb: [250, 204, 21] },
  { t: 30, rgb: [251, 146, 60] },
  { t: 38, rgb: [239, 68, 68] },
]

function tempToColor(celsius: number): string {
  const stops = THERMAL_STOPS
  if (celsius <= stops[0].t) return `rgb(${stops[0].rgb.join(",")})`
  if (celsius >= stops[stops.length - 1].t) return `rgb(${stops[stops.length - 1].rgb.join(",")})`
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (celsius >= a.t && celsius <= b.t) {
      const f = (celsius - a.t) / (b.t - a.t)
      const rgb = a.rgb.map((v, idx) => Math.round(v + (b.rgb[idx] - v) * f))
      return `rgb(${rgb.join(",")})`
    }
  }
  return `rgb(${stops[stops.length - 1].rgb.join(",")})`
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#14151d]/95 px-3 py-2 shadow-lg backdrop-blur-md">
      <ConditionIcon condition={p.condition} className="h-5 w-5 text-white/80" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          {p.temp}° <span className="font-normal text-white/50">· {p.time}</span>
        </span>
        <span className="flex items-center gap-2 text-[11px] text-white/50">
          {CONDITION_LABEL[p.condition]}
          <span className="flex items-center gap-0.5 text-sky-300/80">
            <Droplets className="h-3 w-3" />
            {p.rain}%
          </span>
        </span>
      </div>
    </div>
  )
}

function makeDot(currentIndex: number, peakIndex: number) {
  return function CustomDot(props: any) {
    const { cx, cy, index, payload } = props
    if (index !== currentIndex && index !== peakIndex) return null
    const color = tempToColor(payload.celsius)

    if (index === currentIndex) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.25} className="temp-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
          <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />
        </g>
      )
    }
    // peak marker
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth={2} />
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill={color}>
          {payload.temp}°
        </text>
      </g>
    )
  }
}

export function TempChartCard({ data, unit }: Props) {
  const points = data.hourly.map((h) => ({
    time: h.time,
    temp: unit === "F" ? toFahrenheit(h.temp) : Math.round(h.temp),
    celsius: h.temp,
    condition: h.condition,
    rain: h.rain,
  }))

  const peakIndex = points.reduce((best, p, i) => (p.celsius > points[best].celsius ? i : best), 0)
  const minTemp = Math.min(...points.map((p) => p.temp))
  const maxTemp = Math.max(...points.map((p) => p.temp))
  const gradientStops = points.map((p, i) => ({
    offset: `${(i / Math.max(points.length - 1, 1)) * 100}%`,
    color: tempToColor(p.celsius),
  }))

  return (
    <GlowCard theme="blue" radius="1.25rem" speed="9s" className="col-span-2">
      <div className="w-full px-4 py-5">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-white/50">Temperatura nas próximas horas</span>
          <span className="text-[11px] font-medium text-white/40">
            <span style={{ color: tempToColor(Math.min(...points.map((p) => p.celsius))) }}>{minTemp}°</span>
            {" · "}
            <span style={{ color: tempToColor(Math.max(...points.map((p) => p.celsius))) }}>{maxTemp}°</span>
          </span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 16, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
                  {gradientStops.map((s, i) => (
                    <stop key={i} offset={s.offset} stopColor={s.color} />
                  ))}
                </linearGradient>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={34} unit="°" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="url(#tempStroke)"
                strokeWidth={2.5}
                fill="url(#tempFill)"
                dot={makeDot(0, peakIndex)}
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlowCard>
  )
}
