"use client"

import { Bookmark } from "lucide-react"
import { useSaved } from "@/lib/use-saved"
import { cn } from "@/lib/utils"

export function SaveButton({ slug, label = false, className }: { slug: string; label?: boolean; className?: string }) {
  const { saved, toggle } = useSaved()
  const on = saved.includes(slug)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from saved cards" : "Save card"}
      onClick={() => toggle(slug)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-foreground/40",
        on && "border-teal bg-teal-soft text-teal",
        className
      )}
    >
      <Bookmark className="h-4 w-4" fill={on ? "currentColor" : "none"} />
      {label ? (on ? "Saved" : "Save card") : null}
    </button>
  )
}
