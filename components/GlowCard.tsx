import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export type GlowTheme = "blue" | "white" | "amber" | "aurora"
export type GlowPanel = "soft" | "dark" | "slate"

// Same conic-gradient stops used by the original reference cards
// (hourly / current-weather / time-location / daily-forecast), extracted
// here so every new card in the app can reuse exactly the same identity.
const BORDER_THEMES: Record<GlowTheme, string> = {
  blue: "conic-gradient(from 45deg at 50% 50%, #080b11 0%, #1b1b26 80%, #0968e5 100%)",
  white: "conic-gradient(from 45deg at 50% 50%, #080b11 0%, #172033 80%, #ffffff 100%)",
  amber: "conic-gradient(from 120deg at 50% 50%, #080b11 0%, #172033 70%, #e86705 90%)",
  aurora: "conic-gradient(from 120deg at 50% 50%, #adfda2 0%, #11d3f3 50%, #2278fb 100%)",
}

const PANEL_BG: Record<GlowPanel, string> = {
  soft:
    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)",
  dark: "linear-gradient(90deg, #050507 0%, #1b1b26 55%, #0d0e14 100%)",
  slate: "linear-gradient(90deg, #1a1b26 0%, #1b1b26 55%, #21222c 100%)",
}

interface GlowCardProps {
  theme?: GlowTheme
  panel?: GlowPanel
  radius?: string
  speed?: string
  className?: string
  children: ReactNode
}

export function GlowCard({
  theme = "blue",
  panel = "soft",
  radius = "1rem",
  speed = "8s",
  className = "",
  children,
}: GlowCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border-0 p-0 shadow-lg ${className}`}
      style={{ borderRadius: radius }}
    >
      <span
        className="glow-spin absolute inset-[-1000%]"
        style={{ backgroundImage: BORDER_THEMES[theme], animationDuration: speed }}
      />
      <div
        className="relative z-10 h-full w-full backdrop-blur-2xl"
        style={{ background: PANEL_BG[panel], borderRadius: `calc(${radius} - 2px)`, margin: "1px" }}
      >
        {children}
      </div>
    </Card>
  )
}
