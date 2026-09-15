"use client"

import { Search, Navigation, Loader2, X, Cloud } from "lucide-react"
import type { Unit } from "@/types/weather"

interface Props {
  query: string
  setQuery: (q: string) => void
  onSearch: (q: string) => void
  onUseLocation: () => void
  locating: boolean
  unit: Unit
  setUnit: (u: Unit) => void
}

export function Header({ query, setQuery, onSearch, onUseLocation, locating, unit, setUnit }: Props) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Cloud className="h-5 w-5 text-white/70" />
          <span className="text-sm font-medium tracking-tight text-white/90">Clima</span>
        </div>
        <div className="flex overflow-hidden rounded-full border border-white/10 text-xs font-medium text-white/70">
          <button
            onClick={() => setUnit("C")}
            className={`px-3 py-1.5 transition-colors ${unit === "C" ? "bg-white/15 text-white" : "hover:bg-white/5"}`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-3 py-1.5 transition-colors ${unit === "F" ? "bg-white/15 text-white" : "hover:bg-white/5"}`}
          >
            °F
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearch(query)
          }}
          className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5"
        >
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar cidade..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca">
              <X className="h-4 w-4 text-white/40 hover:text-white/70" />
            </button>
          )}
        </form>
        <button
          onClick={onUseLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Usar minha localização
        </button>
      </div>
    </div>
  )
}
