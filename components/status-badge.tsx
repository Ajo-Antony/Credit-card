import type { Card } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StatusBadge({ card }: { card: Card }) {
  const ok = card.verification_status === "verified"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        ok ? "bg-teal-soft text-teal" : "bg-coin-soft text-warn"
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-teal" : "bg-coin")} />
      {ok ? "Verified against issuer" : "Awaiting verification"}
    </span>
  )
}
