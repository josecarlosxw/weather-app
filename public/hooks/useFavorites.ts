"use client"

import { useCallback, useState } from "react"
import type { City } from "@/types/weather"

export function useFavorites(initial: City[] = []) {
  const [favorites, setFavorites] = useState<City[]>(initial)

  const isFavorite = useCallback((cityId: string) => favorites.some((f) => f.id === cityId), [favorites])

  const toggleFavorite = useCallback((city: City) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === city.id) ? prev.filter((f) => f.id !== city.id) : [...prev, city]
    )
  }, [])

  const removeFavorite = useCallback((cityId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== cityId))
  }, [])

  return { favorites, isFavorite, toggleFavorite, removeFavorite }
}
