import { Sun, Cloud, CloudSun, CloudSunRain, CloudRain, CloudLightning, CloudSnow } from "lucide-react"
import type { Condition } from "@/types/weather"

const ICONS: Record<Condition, typeof Sun> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  "partly-rain": CloudSunRain,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
}

interface ConditionIconProps {
  condition: Condition
  className?: string
}

export function ConditionIcon({ condition, className }: ConditionIconProps) {
  const Icon = ICONS[condition] ?? Cloud
  return <Icon className={className} />
}
