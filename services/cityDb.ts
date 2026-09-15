import type { City } from "@/types/weather"

export const CITY_DB: City[] = [
  { id: "sao-paulo", name: "São Paulo", country: "Brasil", lat: -23.5505, lon: -46.6333, base: 22, cond: "partly-cloudy" },
  { id: "sorocaba", name: "Sorocaba", country: "Brasil", lat: -23.5015, lon: -47.4526, base: 23, cond: "clear" },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brasil", lat: -22.9068, lon: -43.1729, base: 27, cond: "clear" },
  { id: "brasilia", name: "Brasília", country: "Brasil", lat: -15.7939, lon: -47.8828, base: 25, cond: "storm" },
  { id: "tbilisi", name: "Tbilisi", country: "Geórgia", lat: 41.7151, lon: 44.8271, base: 18, cond: "cloudy" },
  { id: "lisboa", name: "Lisboa", country: "Portugal", lat: 38.7223, lon: -9.1393, base: 19, cond: "partly-cloudy" },
  { id: "londres", name: "Londres", country: "Reino Unido", lat: 51.5074, lon: -0.1278, base: 13, cond: "rain" },
  { id: "nova-york", name: "Nova York", country: "EUA", lat: 40.7128, lon: -74.006, base: 16, cond: "partly-rain" },
  { id: "toquio", name: "Tóquio", country: "Japão", lat: 35.6762, lon: 139.6503, base: 21, cond: "cloudy" },
  { id: "cidade-do-cabo", name: "Cidade do Cabo", country: "África do Sul", lat: -33.9249, lon: 18.4241, base: 20, cond: "clear" },
]

/** Local, offline fallback match — used only if the live geocoding search fails. */
export function findCityByQuery(query: string): City | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  return (
    CITY_DB.find((c) => c.name.toLowerCase() === q) ||
    CITY_DB.find((c) => c.name.toLowerCase().includes(q)) ||
    null
  )
}
