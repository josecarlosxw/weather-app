import { MapPin, X } from "lucide-react"
import type { City } from "@/types/weather"

interface Props {
  favorites: City[]
  activeId?: string
  onPick: (city: City) => void
  onRemove: (cityId: string) => void
}

export function FavoritesBar({ favorites, activeId, onPick, onRemove }: Props) {
  if (favorites.length === 0) return null

  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {favorites.map((f) => (
        <button
          key={f.id}
          onClick={() => onPick(f)}
          className={`group flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            activeId === f.id
              ? "border-white/20 bg-white/15 text-white"
              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <MapPin className="h-3 w-3" />
          {f.name}
          <X
            className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(f.id)
            }}
          />
        </button>
      ))}
    </div>
  )
}
