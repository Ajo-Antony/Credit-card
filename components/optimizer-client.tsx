"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Card, Category } from "@/lib/types"
import { CATEGORIES, evaluate } from "@/lib/rewards"
import { cn, inr } from "@/lib/utils"
import { CardFace } from "./card-face"
import { SaveButton } from "./save-button"
import { StatusBadge } from "./status-badge"

export function OptimizerClient({ cards }: { cards: Card[] }) {
  const [spend, setSpend] = useState<Record<Category, number>>(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.sample])) as Record<Category, number>
  )
  const total = Object.values(spend).reduce((a, b) => a + b, 0)
  const results = useMemo(() => cards.map((c) => evaluate(c, spend)).sort((a, b) => b.net - a.net), [cards, spend])
  const top = results[0]
  const maxNet = Math.max(1, ...results.map((r) => Math.abs(r.net)))
  const label = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section aria-labelledby="spend-h" className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-6">
        <h2 id="spend-h" className="font-display text-xl font-bold">Your monthly spending</h2>
        <p className="mt-1 text-sm text-muted-foreground">Total {inr(total)} a month</p>
        <div className="mt-5 space-y-5">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={"n-" + c.id} className="text-sm font-medium">{c.label}</label>
                <div className="flex items-center gap-1 rounded-lg border border-line bg-background px-2">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <input
                    id={"n-" + c.id}
                    type="number"
                    min={0}
                    step={500}
                    value={spend[c.id]}
                    onChange={(e) => setSpend((s) => ({ ...s, [c.id]: Math.max(0, Number(e.target.value) || 0) }))}
                    className="w-24 bg-transparent py-1.5 text-right text-sm"
                  />
                </div>
              </div>
              <input
                aria-label={c.label + " slider"}
                type="range"
                min={0}
                max={20000}
                step={500}
                value={Math.min(spend[c.id], 20000)}
                onChange={(e) => setSpend((s) => ({ ...s, [c.id]: Number(e.target.value) }))}
                className="mt-1 w-full"
              />
              <p className="text-xs text-muted-foreground">{c.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-live="polite">
        {total === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted-foreground">Enter some monthly spending to see which card pays back the most.</p>
        ) : (
          <>
            <div className="rounded-2xl bg-foreground p-6 text-background">
              <p className="text-sm opacity-70">Best for this spending</p>
              <h2 className="mt-1 font-display text-3xl font-bold">{top.card.name}</h2>
              <p className="mt-2 text-lg">
                About <strong>{inr(top.net)}</strong> a year after fees
                <span className="opacity-70"> ({inr(top.annualRewards)} in rewards{top.feeCharged ? `, ${inr(top.feeCharged)} in fees with GST` : ", annual fee waived"})</span>
              </p>
            </div>

            <ol className="mt-6 space-y-4">
              {results.map((r, i) => (
                <li key={r.card.slug} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-28 shrink-0"><CardFace card={r.card} /></div>
                    <div className="min-w-[180px] flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-muted-foreground">#{i + 1}</span>
                        <Link href={`/cards/${r.card.slug}`} className="font-display text-lg font-bold hover:underline">{r.card.name}</Link>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-background">
                        <div className={cn("h-2 rounded-full", r.net >= 0 ? "bg-teal" : "bg-coin")} style={{ width: `${Math.max(2, (Math.abs(r.net) / maxNet) * 100)}%` }} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{inr(r.monthly)} a month in rewards</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold">{r.net < 0 ? "−" + inr(-r.net) : inr(r.net)}</p>
                      <p className="text-xs text-muted-foreground">net a year</p>
                    </div>
                  </div>

                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer font-medium text-teal">How this is calculated</summary>
                    <table className="mt-3 w-full text-left">
                      <thead className="text-muted-foreground"><tr><th className="py-1 font-medium">Spend on</th><th className="py-1 font-medium">Monthly</th><th className="py-1 font-medium">Rate</th><th className="py-1 text-right font-medium">Rewards</th></tr></thead>
                      <tbody>
                        {r.lines.map((l) => (
                          <tr key={l.category} className="border-t border-line">
                            <td className="py-1.5">{label(l.category)}</td>
                            <td>{inr(l.spend)}</td>
                            <td>{l.rate}%{l.usedBase ? " (base)" : ""}</td>
                            <td className="text-right">{inr(l.value)}{l.capped ? " (capped)" : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-3">
                      Rewards {inr(r.monthly)} × 12 = {inr(r.annualRewards)}. Annual fee {inr(r.card.annual_fee)} + 18% GST ={" "}
                      {inr(r.card.annual_fee * 1.18)}{r.feeWaived ? ", waived because your yearly spend reaches " + inr(r.card.fee_waiver_spend ?? 0) : ""}.
                      Net {inr(r.net)}.
                    </p>
                    {r.baseCoverage > 0.4 && (
                      <p className="mt-2 text-warn">{Math.round(r.baseCoverage * 100)}% of your spending uses the base rate because we hold no special rule for it on this card.</p>
                    )}
                    <div className="mt-3 flex items-center gap-3"><StatusBadge card={r.card} /><SaveButton slug={r.card.slug} label /></div>
                  </details>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border border-line bg-surface p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Assumptions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Rewards are valued at the rate shown on each card page, not at a particular redemption partner.</li>
                <li>Monthly limits are applied per spend type. Joining fees and welcome benefits are not counted.</li>
                <li>Cards with unverified figures are estimates. Check the issuer&apos;s current terms before you apply.</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
