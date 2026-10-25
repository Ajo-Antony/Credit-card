import Link from "next/link"
import type { Card } from "@/lib/types"
import { bestRate } from "@/lib/rewards"
import { inr } from "@/lib/utils"
import { CardFace } from "./card-face"
import { SaveButton } from "./save-button"
import { StatusBadge } from "./status-badge"

export function CardTile({ card }: { card: Card }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
      <Link href={`/cards/${card.slug}`} aria-label={card.name}><CardFace card={card} /></Link>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={`/cards/${card.slug}`} className="hover:underline">{card.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{card.tagline}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">Annual fee</dt><dd className="font-semibold">{card.annual_fee ? inr(card.annual_fee) : "Free"}</dd></div>
          <div><dt className="text-muted-foreground">Best rate</dt><dd className="font-semibold">{bestRate(card)}%</dd></div>
        </dl>
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge card={card} />
        <SaveButton slug={card.slug} />
      </div>
    </article>
  )
}
