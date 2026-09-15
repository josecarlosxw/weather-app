import type { Condition, Unit } from "@/types/weather"

export const CONDITION_LABEL: Record<Condition, string> = {
  clear: "Céu limpo",
  "partly-cloudy": "Parcialmente nublado",
  cloudy: "Nublado",
  "partly-rain": "Possibilidade de chuva",
  rain: "Chuva",
  storm: "Tempestade",
  snow: "Neve",
}

export function toFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32)
}

export function formatTemp(celsius: number, unit: Unit): string {
  return unit === "F" ? `${toFahrenheit(celsius)}°` : `${Math.round(celsius)}°`
}

export function weekdayShort(date: Date, index: number): string {
  if (index === 0) return "Hoje"
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
}

export function dayMonth(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0")
}
