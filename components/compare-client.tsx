"use client"

import { useState } from "react"
import type { Card } from "@/lib/types"
import { CATEGORIES } from "@/lib/rewards"
import { cn, inr } from "@/lib/utils"
import { CardFace } from "./card-face"
import { StatusBadge } from "./status-badge"

export function CompareClient({ cards, initial }: { cards: Card[]; initial: string[] }) {
  const start = [...initial, ...cards.map((c) => c.slug).filter((s) => !initial.includes(s))].slice(0, 3)
  const [picked, setPicked] = useState<string[]>(start)
  const chosen = picked.map((s) => cards.find((c) => c.slug === s)).filter(Boolean) as Card[]

  const rate = (c: Card, id: string) => c.rules.find((r) => r.category === id)?.rate ?? c.base_rate
  const best = (vals: number[], higher = true) => (higher ? Math.max(...vals) : Math.min(...vals))

  const rows: { label: string; vals: (c: Card) => number; show: (c: Card) => string; higher: boolean }[] = [
    { label: "Annual fee", vals: (c) => c.annual_fee, show: (c) => (c.annual_fee ? inr(c.annual_fee) : "Free"), higher: false },
    { label: "Joining fee", vals: (c) => c.joining_fee, show: (c) => (c.joining_fee ? inr(c.joining_fee) : "Free"), higher: false },
    { label: "Fee waived at", vals: (c) => c.fee_waiver_spend ?? Infinity, show: (c) => (c.fee_waiver_spend ? inr(c.fee_waiver_spend) : "Not offered"), higher: false },
    ...CATEGORIES.map((cat) => ({
      label: cat.label,
      vals: (c: Card) => rate(c, cat.id),
      show: (c: Card) => rate(c, cat.id) + "%" + (c.rules.some((r) => r.category === cat.id) ? "" : " (base)"),
      higher: true,
    })),
  ]

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <label key={i} className="block text-sm">
            <span className="text-muted-foreground">Card {i + 1}</span>
            <select
              value={picked[i] ?? ""}
              onChange={(e) => setPicked((p) => { const n = [...p]; if (e.target.value) n[i] = e.target.value; else n.splice(i, 1); return n.filter(Boolean) })}
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5"
            >
              {i > 0 && <option value="">None</option>}
              {cards.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line align-bottom">
              <th className="w-44 p-4" />
              {chosen.map((c) => (
                <th key={c.slug} className="p-4 font-normal">
                  <div className="max-w-[220px]"><CardFace card={c} /></div>
                  <div className="mt-2"><StatusBadge card={c} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const b = best(chosen.map(r.vals), r.higher)
              return (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-medium text-muted-foreground">{r.label}</th>
                  {chosen.map((c) => (
                    <td key={c.slug} className={cn("p-4", r.vals(c) === b && chosen.length > 1 && isFinite(b) && "font-semibold text-teal")}>{r.show(c)}</td>
                  ))}
                </tr>
              )
            })}
            <tr>
              <th scope="row" className="p-4 font-medium text-muted-foreground">Who can apply</th>
              {chosen.map((c) => <td key={c.slug} className="p-4 align-top">{c.eligibility}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Teal marks the best value in each row. &ldquo;(base)&rdquo; means the card has no special rate for that spend, so the everything-else rate applies.</p>
    </div>
  )
}
