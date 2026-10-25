import type { Card, Category } from "./types"

export const CATEGORIES: { id: Category; label: string; hint: string; sample: number }[] = [
  { id: "amazon", label: "Amazon", hint: "Amazon.in purchases", sample: 3000 },
  { id: "flipkart", label: "Flipkart", hint: "Flipkart, Myntra, Cleartrip", sample: 2000 },
  { id: "online", label: "Other online shopping", hint: "Any other website or app", sample: 3000 },
  { id: "food_delivery", label: "Food delivery", hint: "Swiggy, Zomato, Instamart", sample: 4000 },
  { id: "dining", label: "Dining out", hint: "Restaurants and cafés", sample: 2500 },
  { id: "groceries", label: "Groceries", hint: "Supermarkets and stores", sample: 6000 },
  { id: "fuel", label: "Fuel", hint: "Petrol and diesel", sample: 4000 },
  { id: "bills", label: "Bills and recharges", hint: "Electricity, mobile, DTH", sample: 5000 },
  { id: "travel", label: "Travel", hint: "Flights, trains, cabs, hotels", sample: 3000 },
  { id: "entertainment", label: "Movies and events", hint: "Cinema, concerts, streaming", sample: 1500 },
  { id: "other", label: "Everything else", hint: "Anything not listed above", sample: 5000 },
]

export const GST_ON_FEES = 0.18

export type Line = {
  category: Category
  spend: number
  rate: number
  value: number
  capped: boolean
  usedBase: boolean
}

export type Result = {
  card: Card
  lines: Line[]
  monthly: number
  annualRewards: number
  feeCharged: number
  feeWaived: boolean
  net: number
  baseCoverage: number
}

/** Deterministic: rewards = spend x rate, limited by the monthly cap; fee includes GST unless the waiver spend is reached. */
export function evaluate(card: Card, spend: Partial<Record<Category, number>>): Result {
  const lines: Line[] = []
  let totalSpend = 0
  let onBase = 0
  for (const c of CATEGORIES) {
    const s = Math.max(0, spend[c.id] ?? 0)
    if (!s) continue
    totalSpend += s
    const rule = card.rules.find((r) => r.category === c.id)
    const rate = rule ? rule.rate : card.base_rate
    const raw = (s * rate) / 100
    const value = rule?.cap != null ? Math.min(raw, rule.cap) : raw
    if (!rule) onBase += s
    lines.push({ category: c.id, spend: s, rate, value, capped: rule?.cap != null && raw > rule.cap, usedBase: !rule })
  }
  const monthly = lines.reduce((a, l) => a + l.value, 0)
  const annualRewards = monthly * 12
  const waived = card.fee_waiver_spend != null && totalSpend * 12 >= card.fee_waiver_spend
  const feeCharged = waived ? 0 : card.annual_fee * (1 + GST_ON_FEES)
  return {
    card, lines, monthly, annualRewards, feeCharged, feeWaived: waived,
    net: annualRewards - feeCharged,
    baseCoverage: totalSpend ? onBase / totalSpend : 0,
  }
}

export function bestRate(card: Card) {
  return Math.max(card.base_rate, ...card.rules.map((r) => r.rate))
}
