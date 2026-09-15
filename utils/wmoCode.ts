import type { Condition } from "@/types/weather"

/**
 * Open-Meteo (and most weather providers) report conditions as WMO codes.
 * https://open-meteo.com/en/docs — see "WMO Weather interpretation codes".
 */
export function mapWmoCode(code: number): Condition {
  if (code === 0) return "clear"
  if (code === 1 || code === 2) return "partly-cloudy"
  if (code === 3 || code === 45 || code === 48) return "cloudy"
  if ([51, 53, 55, 56, 57].includes(code)) return "partly-rain"
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow"
  if ([95, 96, 99].includes(code)) return "storm"
  return "cloudy"
}
