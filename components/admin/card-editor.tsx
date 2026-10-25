"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sb, logAction } from "@/lib/supabase-browser"
import { CATEGORIES } from "@/lib/rewards"

type RuleRow = { category: string; rate: string; cap: string; note: string }
const EMPTY = {
  slug: "", name: "", issuer: "", network: "Visa", tagline: "", annual_fee: "0", joining_fee: "0", fee_waiver_spend: "",
  base_rate: "1", eligibility: "", highlights: "", exclusions: "", source_url: "", c0: "#1B2A41", c1: "#324A5F",
  verification_status: "pending", last_checked: "",
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean)
const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"

export function CardEditor({ slug }: { slug: string }) {
  const router = useRouter()
  const isNew = slug === "new"
  const [f, setF] = useState(EMPTY)
  const [id, setId] = useState<string | null>(null)
  const [rules, setRules] = useState<RuleRow[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof EMPTY, v: string) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    if (isNew) return
    sb.from("cards").select("*, reward_rules(*)").eq("slug", slug).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setError(error?.message ?? "Card not found"); setLoading(false); return }
      setId(data.id)
      setF({
        slug: data.slug, name: data.name, issuer: data.issuer, network: data.network, tagline: data.tagline ?? "",
        annual_fee: String(data.annual_fee), joining_fee: String(data.joining_fee), fee_waiver_spend: data.fee_waiver_spend == null ? "" : String(data.fee_waiver_spend),
        base_rate: String(data.base_rate), eligibility: data.eligibility ?? "", highlights: (data.highlights ?? []).join("\n"), exclusions: (data.exclusions ?? []).join("\n"),
        source_url: data.source_url ?? "", c0: data.colors?.[0] ?? "#1B2A41", c1: data.colors?.[1] ?? "#324A5F",
        verification_status: data.verification_status, last_checked: data.last_checked ?? "",
      })
      setRules((data.reward_rules ?? []).map((r: any) => ({ category: r.category, rate: String(r.rate_pct), cap: r.monthly_cap == null ? "" : String(r.monthly_cap), note: r.note ?? "" })))
      setLoading(false)
    })
  }, [slug, isNew])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const finalSlug = f.slug || slugify(f.name)
    if (!f.name.trim() || !f.issuer.trim()) return setError("Name and issuer are required.")
    if (!/^[a-z0-9-]+$/.test(finalSlug)) return setError("The web address can only use lowercase letters, numbers and hyphens.")
    const n = (v: string) => Number(v)
    if ([f.annual_fee, f.joining_fee, f.base_rate].some((v) => v === "" || isNaN(n(v)) || n(v) < 0)) return setError("Fees and the base rate must be numbers of 0 or more.")
    if (rules.some((r) => r.rate === "" || isNaN(n(r.rate)) || (r.cap !== "" && isNaN(n(r.cap))))) return setError("Every reward rule needs a numeric rate. Leave the monthly limit empty for no limit.")
    if (new Set(rules.map((r) => r.category)).size !== rules.length) return setError("Each spend category can appear only once.")

    const verified = f.verification_status === "verified"
    const payload = {
      slug: finalSlug, name: f.name.trim(), issuer: f.issuer.trim(), network: f.network, tagline: f.tagline,
      annual_fee: n(f.annual_fee), joining_fee: n(f.joining_fee), fee_waiver_spend: f.fee_waiver_spend === "" ? null : n(f.fee_waiver_spend),
      base_rate: n(f.base_rate), eligibility: f.eligibility, highlights: lines(f.highlights), exclusions: lines(f.exclusions),
      source_url: f.source_url || null, colors: [f.c0, f.c1], verification_status: f.verification_status,
      last_checked: verified ? f.last_checked || new Date().toISOString() : f.last_checked || null,
    }
    setBusy(true)
    let cardId = id
    if (id) {
      const { error } = await sb.from("cards").update(payload).eq("id", id)
      if (error) { setBusy(false); return setError(error.code === "23505" ? "Another card already uses that web address." : error.message) }
    } else {
      const { data, error } = await sb.from("cards").insert(payload).select("id").single()
      if (error || !data) { setBusy(false); return setError(error?.code === "23505" ? "Another card already uses that web address." : error?.message ?? "Could not create card") }
      cardId = data.id
    }
    const del = await sb.from("reward_rules").delete().eq("card_id", cardId!)
    if (del.error) { setBusy(false); return setError(del.error.message) }
    if (rules.length) {
      const ins = await sb.from("reward_rules").insert(rules.map((r) => ({ card_id: cardId, category: r.category, rate_pct: n(r.rate), monthly_cap: r.cap === "" ? null : n(r.cap), note: r.note || null })))
      if (ins.error) { setBusy(false); return setError(ins.error.message) }
    }
    await logAction(id ? "card.update" : "card.create", { slug: finalSlug, name: payload.name, rules: rules.length })
    router.push("/admin")
  }

  const remove = async () => {
    if (!id || !confirm(`Delete ${f.name} and its reward rules? This cannot be undone.`)) return
    const { error } = await sb.from("cards").delete().eq("id", id)
    if (error) return setError(error.message)
    await logAction("card.delete", { slug: f.slug, name: f.name })
    router.push("/admin")
  }

  const usedCats = new Set(rules.map((r) => r.category))
  const addRule = () => {
    const next = CATEGORIES.find((c) => !usedCats.has(c.id))
    if (next) setRules((r) => [...r, { category: next.id, rate: "", cap: "", note: "" }])
  }
  const setRule = (i: number, k: keyof RuleRow, v: string) => setRules((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)))

  if (loading) return <p className="py-20 text-center text-muted-foreground">Loading card…</p>

  return (
    <form onSubmit={save} className="max-w-3xl">
      <Link href="/admin" className="text-sm text-muted-foreground underline underline-offset-4">Back to dashboard</Link>
      <h1 className="mt-4 font-display text-4xl font-bold">{isNew ? "Add card" : "Edit " + f.name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Card name<input className={input} value={f.name} onChange={(e) => { set("name", e.target.value); if (isNew) set("slug", slugify(e.target.value)) }} required /></label>
        <label className="text-sm">Issuer<input className={input} value={f.issuer} onChange={(e) => set("issuer", e.target.value)} required /></label>
        <label className="text-sm">Web address (slug)<input className={input} value={f.slug} onChange={(e) => set("slug", e.target.value)} /></label>
        <label className="text-sm">Network
          <select className={input} value={f.network} onChange={(e) => set("network", e.target.value)}>{["Visa", "Mastercard", "RuPay", "American Express", "Diners Club"].map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        <label className="text-sm sm:col-span-2">One-line summary<input className={input} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
        <label className="text-sm">Annual fee (₹)<input type="number" min={0} className={input} value={f.annual_fee} onChange={(e) => set("annual_fee", e.target.value)} /></label>
        <label className="text-sm">Joining fee (₹)<input type="number" min={0} className={input} value={f.joining_fee} onChange={(e) => set("joining_fee", e.target.value)} /></label>
        <label className="text-sm">Fee waived at yearly spend (₹)<input type="number" min={0} placeholder="Leave empty if not offered" className={input} value={f.fee_waiver_spend} onChange={(e) => set("fee_waiver_spend", e.target.value)} /></label>
        <label className="text-sm">Rate on everything else (%)<input type="number" min={0} step="0.01" className={input} value={f.base_rate} onChange={(e) => set("base_rate", e.target.value)} /></label>
        <label className="text-sm sm:col-span-2">Who can apply<textarea rows={2} className={input} value={f.eligibility} onChange={(e) => set("eligibility", e.target.value)} /></label>
        <label className="text-sm">Benefits (one per line)<textarea rows={4} className={input} value={f.highlights} onChange={(e) => set("highlights", e.target.value)} /></label>
        <label className="text-sm">What earns nothing (one per line)<textarea rows={4} className={input} value={f.exclusions} onChange={(e) => set("exclusions", e.target.value)} /></label>
        <label className="text-sm sm:col-span-2">Source link<input type="url" className={input} value={f.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://" /></label>
        <label className="text-sm">Card colour 1<input type="color" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface" value={f.c0} onChange={(e) => set("c0", e.target.value)} /></label>
        <label className="text-sm">Card colour 2<input type="color" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface" value={f.c1} onChange={(e) => set("c1", e.target.value)} /></label>
        <label className="text-sm">Verification
          <select className={input} value={f.verification_status} onChange={(e) => set("verification_status", e.target.value)}>
            <option value="pending">Awaiting verification</option><option value="verified">Verified against issuer</option>
          </select>
        </label>
        <div className="text-sm">Last checked
          <div className="mt-1 flex items-center gap-2">
            <span className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5">{f.last_checked ? new Date(f.last_checked).toLocaleDateString("en-IN") : "Not yet"}</span>
            <button type="button" onClick={() => set("last_checked", new Date().toISOString())} className="rounded-xl border border-line bg-surface px-3 py-2.5">Set to today</button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Reward rules</h2>
          <button type="button" onClick={addRule} disabled={usedCats.size >= CATEGORIES.length} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium disabled:opacity-50">Add rule</button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Rates are the value back as a percentage of spend. Spend types without a rule use the base rate.</p>
        <div className="mt-4 space-y-3">
          {rules.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted-foreground">No rules yet. Every spend earns the base rate.</p>}
          {rules.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[1.4fr_.7fr_.9fr_1.2fr_auto]">
              <select aria-label="Spend type" className={input + " !mt-0"} value={r.category} onChange={(e) => setRule(i, "category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id} disabled={usedCats.has(c.id) && c.id !== r.category}>{c.label}</option>)}
              </select>
              <input aria-label="Rate in percent" type="number" step="0.01" min={0} placeholder="Rate %" className={input + " !mt-0"} value={r.rate} onChange={(e) => setRule(i, "rate", e.target.value)} />
              <input aria-label="Monthly limit in rupees" type="number" min={0} placeholder="Monthly limit ₹" className={input + " !mt-0"} value={r.cap} onChange={(e) => setRule(i, "cap", e.target.value)} />
              <input aria-label="Note" placeholder="Note (optional)" className={input + " !mt-0"} value={r.note} onChange={(e) => setRule(i, "note", e.target.value)} />
              <button type="button" onClick={() => setRules((x) => x.filter((_, j) => j !== i))} className="rounded-xl px-3 text-sm font-medium text-red-700">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {error && <p role="alert" className="mt-6 rounded-xl bg-coin-soft px-4 py-3 text-sm text-warn">{error}</p>}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button disabled={busy} className="rounded-full bg-foreground px-6 py-3 font-semibold text-background disabled:opacity-60">{busy ? "Saving…" : isNew ? "Create card" : "Save changes"}</button>
        <Link href="/admin" className="rounded-full border border-line bg-surface px-6 py-3 font-semibold">Cancel</Link>
        {!isNew && <button type="button" onClick={remove} className="ml-auto rounded-full px-4 py-3 text-sm font-semibold text-red-700">Delete card</button>}
      </div>
    </form>
  )
}
