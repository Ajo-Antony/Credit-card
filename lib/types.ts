export type Category =
  | "amazon" | "flipkart" | "online" | "food_delivery" | "dining"
  | "groceries" | "fuel" | "bills" | "travel" | "entertainment" | "other"

export type Rule = { category: Category; rate: number; cap: number | null; note?: string }

export type Card = {
  slug: string
  name: string
  issuer: string
  network: string
  tagline: string
  annual_fee: number
  joining_fee: number
  fee_waiver_spend: number | null
  base_rate: number
  eligibility: string
  highlights: string[]
  exclusions: string[]
  source_url: string
  verification_status: "verified" | "pending"
  last_checked: string | null
  colors: [string, string]
  rules: Rule[]
}
