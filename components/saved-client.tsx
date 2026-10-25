"use client"

import Link from "next/link"
import type { Card } from "@/lib/types"
import { useSaved } from "@/lib/use-saved"
import { CardTile } from "./card-tile"

export function SavedClient({ cards }: { cards: Card[] }) {
  const { saved } = useSaved()
  const list = cards.filter((c) => saved.includes(c.slug))
  if (!list.length)
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-muted-foreground">You have not saved any cards yet. Use the bookmark on a card to keep it here.</p>
        <Link href="/cards" className="mt-4 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">Browse cards</Link>
      </div>
    )
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <CardTile key={c.slug} card={c} />)}</div>
      <Link href={`/compare?c=${list.slice(0, 3).map((c) => c.slug).join(",")}`} className="mt-8 inline-block rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold">Compare saved cards</Link>
    </div>
  )
}
