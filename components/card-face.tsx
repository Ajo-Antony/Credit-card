import type { Card } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CardFace({ card, className }: { card: Card; className?: string }) {
  return (
    <div
      className={cn("relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-4 text-white shadow-[0_10px_24px_-12px_rgba(13,27,42,.55)]", className)}
      style={{ background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})` }}
    >
      <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-black/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between text-xs font-medium opacity-90">
          <span>{card.issuer}</span>
          <span aria-hidden className="h-6 w-8 rounded-md bg-gradient-to-br from-[#f1d58a] to-[#b98a2c]" />
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="font-display text-sm font-bold leading-tight">{card.name}</span>
          <span className="text-[11px] font-medium opacity-80">{card.network}</span>
        </div>
      </div>
    </div>
  )
}
