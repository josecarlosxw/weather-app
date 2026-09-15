import type { ReactNode } from "react"
import { GlowCard } from "@/components/GlowCard"

export function SkeletonGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-4">
      <div className="col-span-2 h-28 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      <div className="col-span-2 h-52 animate-pulse rounded-2xl bg-white/5" />
      <div className="col-span-2 h-40 animate-pulse rounded-2xl bg-white/5" />
    </div>
  )
}

interface StateCardProps {
  icon: ReactNode
  title: string
  detail?: string
  action?: ReactNode
}

export function StateCard({ icon, title, detail, action }: StateCardProps) {
  return (
    <GlowCard theme="amber" radius="1.5rem" className="w-full">
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-white">
        {icon}
        <div className="text-lg font-medium">{title}</div>
        {detail && <div className="max-w-xs text-sm text-white/60">{detail}</div>}
        {action}
      </div>
    </GlowCard>
  )
}
