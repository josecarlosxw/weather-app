"use client"

import { useEffect, useRef, useState } from "react"
import type { Condition } from "@/types/weather"

/**
 * The 3 dynamic visual states the backdrop can render.
 * "neutral" means: keep the current base background untouched (used for
 * conditions like cloudy/snow that aren't part of the 3-state spec).
 */
export type WeatherVisualState = "sunny" | "rain" | "storm" | "neutral"

/**
 * Maps the app's existing `Condition` type (already normalized from WMO
 * codes in utils/wmoCode.ts) down to the 3 visual states.
 *
 * clear            -> sunny
 * rain/partly-rain -> rain
 * storm            -> storm
 * anything else     -> neutral (no extra effect)
 */
export function normalizeWeather(condition: Condition | undefined | null): WeatherVisualState {
  switch (condition) {
    case "clear":
      return "sunny"
    case "rain":
    case "partly-rain":
      return "rain"
    case "storm":
      return "storm"
    default:
      return "neutral"
  }
}

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  opacity: number
  blur: boolean
  drift: number
}

interface WeatherBackdropProps {
  state: WeatherVisualState
}

/**
 * Purely decorative, absolutely-positioned layer that sits behind the app
 * content (rendered before the z-10 content wrapper in page.tsx). Never
 * intercepts clicks and never resizes layout.
 */
export function WeatherBackdrop({ state }: WeatherBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dropsRef = useRef<Drop[]>([])
  const rafRef = useRef<number>(0)
  const [flash, setFlash] = useState(0)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Rain / storm canvas animation
  useEffect(() => {
    if (state !== "rain" && state !== "storm") return
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const isStorm = state === "storm"
    const count = isStorm ? 60 : 36

    const makeDrop = (spawnAtTop = false): Drop => ({
      x: Math.random() * width,
      y: spawnAtTop ? -20 - Math.random() * 40 : Math.random() * height,
      len: 10 + Math.random() * (isStorm ? 20 : 14),
      speed: (isStorm ? 5 : 2.8) + Math.random() * (isStorm ? 3 : 2.2),
      opacity: 0.05 + Math.random() * (isStorm ? 0.15 : 0.11),
      blur: Math.random() < 0.3,
      drift: isStorm ? 1 : 0.45,
    })

    dropsRef.current = Array.from({ length: count }, () => makeDrop(false))

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    if (reducedMotionRef.current) {
      // Static single frame — no animation loop for reduced-motion users.
      ctx.clearRect(0, 0, width, height)
      for (const d of dropsRef.current) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(168,198,255,${d.opacity})`
        ctx.lineWidth = d.blur ? 1.4 : 0.9
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + d.drift * 4, d.y + d.len)
        ctx.stroke()
      }
      return () => ro.disconnect()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const d of dropsRef.current) {
        d.y += d.speed
        d.x += d.drift
        if (d.y > height + 20) Object.assign(d, makeDrop(true))

        ctx.beginPath()
        ctx.strokeStyle = `rgba(168,198,255,${d.opacity})`
        ctx.lineWidth = d.blur ? 1.4 : 0.9
        ctx.filter = d.blur ? "blur(0.6px)" : "none"
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + d.drift * 4, d.y + d.len)
        ctx.stroke()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [state])

  // Occasional, unpredictable lightning flash for the storm state only.
  useEffect(() => {
    if (state !== "storm" || reducedMotionRef.current) return
    let timeout: ReturnType<typeof setTimeout>

    const scheduleFlash = () => {
      const delay = 5000 + Math.random() * 9000
      timeout = setTimeout(() => {
        setFlash(1)
        setTimeout(() => setFlash(0), 110 + Math.random() * 70)
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setFlash(1)
            setTimeout(() => setFlash(0), 80)
          }, 200 + Math.random() * 80)
        }
        scheduleFlash()
      }, delay)
    }
    scheduleFlash()
    return () => clearTimeout(timeout)
  }, [state])

  if (state === "neutral") return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
      {state === "sunny" && (
        <>
          <div className="weather-sunny-glow absolute inset-0" />
          <div className="weather-sunny-particles absolute inset-0">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="weather-sunny-particle"
                style={{
                  left: `${(i * 41 + 8) % 100}%`,
                  top: `${(i * 57 + 12) % 100}%`,
                  animationDelay: `${i * 1.4}s`,
                  animationDuration: `${10 + (i % 5) * 1.6}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {(state === "rain" || state === "storm") && (
        <>
          {state === "storm" && <div className="absolute inset-0 bg-[#0a0b12]/35" />}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          {state === "storm" && (
            <div
              className="absolute inset-0 bg-white transition-opacity duration-150 ease-out"
              style={{ opacity: flash * 0.1 }}
            />
          )}
        </>
      )}
    </div>
  )
}
