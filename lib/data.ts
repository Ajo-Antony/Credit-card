import seed from "@/data/cards.json"
import { supabase } from "./supabase"
import type { Card, Rule } from "./types"

type Row = Omit<Card, "rules" | "colors"> & {
  colors: string[]
  reward_rules?: { category: Rule["category"]; rate_pct: number; monthly_cap: number | null; note: string | null }[]
}

const fromRow = (r: Row): Card => ({
  ...r,
  annual_fee: Number(r.annual_fee),
  joining_fee: Number(r.joining_fee),
  base_rate: Number(r.base_rate),
  fee_waiver_spend: r.fee_waiver_spend == null ? null : Number(r.fee_waiver_spend),
  highlights: r.highlights ?? [],
  exclusions: r.exclusions ?? [],
  colors: [r.colors?.[0] ?? "#1B2A41", r.colors?.[1] ?? "#324A5F"],
  rules: (r.reward_rules ?? []).map((x) => ({
    category: x.category,
    rate: Number(x.rate_pct),
    cap: x.monthly_cap == null ? null : Number(x.monthly_cap),
    note: x.note ?? undefined,
  })),
})

/** Reads the catalogue from Supabase; falls back to the bundled sample set if the tables are missing or empty. */
export async function getCatalog(): Promise<{ cards: Card[]; source: "supabase" | "sample" }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("cards").select("*, reward_rules(*)").order("name")
      if (!error && data && data.length) return { cards: (data as unknown as Row[]).map(fromRow), source: "supabase" }
    } catch {
      /* fall through to the sample set */
    }
  }
  return { cards: (seed as unknown as Card[]).map((c) => ({ ...c, verification_status: "pending" as const, last_checked: null })), source: "sample" }
}
