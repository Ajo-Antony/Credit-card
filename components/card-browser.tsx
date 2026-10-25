"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { Card } from "@/lib/types"
import { bestRate } from "@/lib/rewards"
import { cn } from "@/lib/utils"
import { CardTile } from "./card-tile"

const FEES = [
  { id: "all", label: "Any fee", test: () => true },
  { id: "free", label: "No annual fee", test: (c: Card) => c.annual_fee === 0 },
  { id: "low", label: "Up to ₹1,000", test: (c: Card) => c.annual_fee <= 1000 },
  { id: "premium", label: "Premium", test: (c: Card) => c.annual_fee > 1000 },
]
const SORTS = [
  { id: "name", label: "Name" },
  { id: "fee", label: "Lowest fee" },
  { id: "rate", label: "Highest rate" },
]

export function CardBrowser({ cards }: { cards: Card[] }) {
  const [q, setQ] = useState("")
  const [fee, setFee] = useState("all")
  const [network, setNetwork] = useState("all")
  const [sort, setSort] = useState("name")
  const networks = useMemo(() => Array.from(new Set(cards.map((c) => c.network))), [cards])

  const shown = useMemo(() => {
    const t = FEES.find((f) => f.id === fee)!.test
    const term = q.trim().toLowerCase()
    return cards
      .filter((c) => t(c) && (network === "all" || c.network === network))
      .filter((c) => !term || `${c.name} ${c.issuer} ${c.tagline}`.toLowerCase().includes(term))
      .sort((a, b) =>
        sort === "fee" ? a.annual_fee - b.annual_fee : sort === "rate" ? bestRate(b) - bestRate(a) : a.name.localeCompare(b.name)
      )
  }, [cards, q, fee, network, sort])

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search cards</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by card or bank"
            className="w-full rounded-xl border border-line bg-background py-2.5 pl-9 pr-3 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Annual fee">
          {FEES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={fee === f.id}
              onClick={() => setFee(f.id)}
              className={cn("rounded-full border border-line px-3 py-1.5 text-sm", fee === f.id && "border-foreground bg-foreground text-background")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Network</span>
          <select value={network} onChange={(e) => setNetwork(e.target.value)} className="rounded-xl border border-line bg-background px-2 py-2">
            <option value="all">All</option>
            {networks.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-line bg-background px-2 py-2">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{shown.length} of {cards.length} cards</p>
      {shown.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => <CardTile key={c.slug} card={c} />)}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-muted-foreground">
          No cards match these filters. Clear the search or choose &ldquo;Any fee&rdquo;.
        </p>
      )}
    </div>
  )
}
