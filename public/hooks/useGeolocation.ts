"use client"

import { useCallback, useState } from "react"

interface UseGeolocationResult {
  locating: boolean
  requestLocation: (
    onSuccess: (lat: number, lon: number) => void,
    onDenied: () => void,
    onError: () => void
  ) => void
}

export function useGeolocation(): UseGeolocationResult {
  const [locating, setLocating] = useState(false)

  const requestLocation = useCallback(
    (onSuccess: (lat: number, lon: number) => void, onDenied: () => void, onError: () => void) => {
      if (!navigator.geolocation) {
        onError()
        return
      }
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false)
          onSuccess(pos.coords.latitude, pos.coords.longitude)
        },
        (err) => {
          setLocating(false)
          if (err.code === err.PERMISSION_DENIED) onDenied()
          else onError()
        },
        { timeout: 8000 }
      )
    },
    []
  )

  return { locating, requestLocation }
}
