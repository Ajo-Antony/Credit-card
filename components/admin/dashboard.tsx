"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import seed from "@/data/cards.json"
import { sb, logAction } from "@/lib/supabase-browser"
import { cn, inr } from "@/lib/utils"

type Row = {
  id: string; slug: string; name: string; issuer: string; annual_fee: number
  verification_status: "pending" | "verified"; last_checked: string | null; reward_rules: { count: number }[]
}
type Log = { id: number; action: string; detail: Record<string, unknown> | null; created_at: string }

export function Dashboard({ email, signOut }: { email: string; signOut: () => void }) {
  const [rows, setRows] = useState<Row[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [tab, setTab] = useState<"cards" | "activity">("cards")
  const [q, setQ] = useState("")
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [c, l] = await Promise.all([
      sb.from("cards").select("id,slug,name,issuer,annual_fee,verification_status,last_checked,reward_rules(count)").order("name"),
      sb.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50),
    ])
    if (c.error) setMsg(c.error.message)
    else setRows(c.data as unknown as Row[])
    setLogs((l.data as Log[]) ?? [])
  }, [])
  useEffect(() => { load() }, [load])

  const shown = useMemo(() => rows.filter((r) => `${r.name} ${r.issuer}`.toLowerCase().includes(q.toLowerCase())), [rows, q])
  const verified = rows.filter((r) => r.verification_status === "verified").length

  const toggle = async (r: Row) => {
    const next = r.verification_status === "verified" ? "pending" : "verified"
    const { error } = await sb.from("cards").update({ verification_status: next, last_checked: next === "verified" ? new Date().toISOString() : null }).eq("id", r.id)
    if (error) return setMsg(error.message)
    await logAction("card.status", { slug: r.slug, status: next })
    load()
  }
  const remove = async (r: Row) => {
    if (!confirm(`Delete ${r.name} and its reward rules? This cannot be undone.`)) return
    const { error } = await sb.from("cards").delete().eq("id", r.id)
    if (error) return setMsg(error.message)
    await logAction("card.delete", { slug: r.slug, name: r.name })
    load()
  }
  const importSample = async () => {
    setBusy(true); setMsg("")
    for (const c of seed as any[]) {
      const { rules, ...card } = c
      const { data, error } = await sb.from("cards").upsert({ ...card, verification_status: "pending" }, { onConflict: "slug" }).select("id").single()
      if (error || !data) { setMsg(error?.message ?? "Import failed"); break }
      await sb.from("reward_rules").delete().eq("card_id", data.id)
      if (rules.length) await sb.from("reward_rules").insert(rules.map((r: any) => ({ card_id: data.id, category: r.category, rate_pct: r.rate, monthly_cap: r.cap, note: r.note ?? null })))
    }
    await logAction("catalogue.import_sample", { count: (seed as any[]).length })
    setBusy(false); load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/cards/new" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Add card</Link>
          <button onClick={signOut} className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold">Sign out</button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["Cards", rows.length], ["Verified", verified], ["Awaiting verification", rows.length - verified]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface p-4"><dt className="text-sm text-muted-foreground">{k}</dt><dd className="font-display text-3xl font-bold">{v}</dd></div>
        ))}
      </dl>

      {msg && <p role="alert" className="mt-4 rounded-xl bg-coin-soft px-4 py-3 text-sm text-warn">{msg}</p>}

      <div className="mt-8 flex gap-2" role="tablist">
        {(["cards", "activity"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-2 text-sm font-medium", tab === t ? "bg-foreground text-background" : "border border-line bg-surface")}>{t === "cards" ? "Cards" : "Activity"}</button>
        ))}
      </div>

      {tab === "cards" ? (
        <div className="mt-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards" aria-label="Search cards" className="w-full max-w-sm rounded-xl border border-line bg-surface px-3 py-2.5 text-sm" />
          {rows.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center">
              <p className="text-muted-foreground">The catalogue is empty. Add a card, or load the nine sample cards (they start as awaiting verification).</p>
              <button disabled={busy} onClick={importSample} className="mt-4 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-60">{busy ? "Importing…" : "Import sample cards"}</button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line text-muted-foreground"><tr>
                  <th className="p-3 font-medium">Card</th><th className="p-3 font-medium">Annual fee</th><th className="p-3 font-medium">Rules</th><th className="p-3 font-medium">Status</th><th className="p-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="p-3"><p className="font-semibold">{r.name}</p><p className="text-muted-foreground">{r.issuer}</p></td>
                      <td className="p-3">{r.annual_fee ? inr(r.annual_fee) : "Free"}</td>
                      <td className="p-3">{r.reward_rules?.[0]?.count ?? 0}</td>
                      <td className="p-3">
                        <button onClick={() => toggle(r)} title="Click to change" className={cn("rounded-full px-2.5 py-1 text-xs font-medium", r.verification_status === "verified" ? "bg-teal-soft text-teal" : "bg-coin-soft text-warn")}>
                          {r.verification_status === "verified" ? "Verified" : "Awaiting verification"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/cards/${r.slug}`} className="mr-3 font-medium text-teal underline underline-offset-4">Edit</Link>
                        <button onClick={() => remove(r)} className="font-medium text-red-700 underline underline-offset-4">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {logs.length === 0 && <li className="p-4 text-muted-foreground">No activity recorded yet.</li>}
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
              <span><strong>{l.action}</strong> <span className="text-muted-foreground">{l.detail ? JSON.stringify(l.detail) : ""}</span></span>
              <time className="text-muted-foreground">{new Date(l.created_at).toLocaleString("en-IN")}</time>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Public pages refresh within a minute of a change.</p>
    </div>
  )
}
