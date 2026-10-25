import Link from "next/link"
import { notFound } from "next/navigation"
import { getCatalog } from "@/lib/data"
import { CATEGORIES, GST_ON_FEES } from "@/lib/rewards"
import { inr } from "@/lib/utils"
import { CardFace } from "@/components/card-face"
import { SaveButton } from "@/components/save-button"
import { StatusBadge } from "@/components/status-badge"

export const revalidate = 60

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { cards } = await getCatalog()
  const card = cards.find((c) => c.slug === slug)
  if (!card) notFound()
  const label = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div>
      <Link href="/cards" className="text-sm text-muted-foreground underline underline-offset-4">All cards</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <CardFace card={card} />
          <div className="flex items-center justify-between gap-2"><StatusBadge card={card} /><SaveButton slug={card.slug} label /></div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">{card.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{card.tagline}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Joining fee", card.joining_fee ? inr(card.joining_fee) : "Free"],
              ["Annual fee", card.annual_fee ? inr(card.annual_fee) : "Free"],
              ["Fee waived at", card.fee_waiver_spend ? inr(card.fee_waiver_spend) + " a year" : "Not offered"],
              ["Everything else", card.base_rate + "%"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-display text-xl font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Fees are shown before GST. Calculations here add {GST_ON_FEES * 100}% GST to the annual fee.</p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold">Reward rates</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted-foreground">
                <tr><th className="p-3 font-medium">Spend on</th><th className="p-3 font-medium">Value back</th><th className="p-3 font-medium">Monthly limit</th></tr>
              </thead>
              <tbody>
                {card.rules.map((r) => (
                  <tr key={r.category} className="border-b border-line last:border-0">
                    <td className="p-3">{label(r.category)}{r.note ? <span className="text-muted-foreground"> ({r.note})</span> : null}</td>
                    <td className="p-3 font-semibold">{r.rate}%</td>
                    <td className="p-3">{r.cap != null ? inr(r.cap) + " in rewards" : "None known"}</td>
                  </tr>
                ))}
                <tr><td className="p-3">All other spends</td><td className="p-3 font-semibold">{card.base_rate}%</td><td className="p-3">None known</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Rates are the estimated value of points or cashback, not the points earned.</p>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold">What you get</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">{card.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">What does not earn rewards</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">{card.exclusions.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Who can apply</h2>
            <p className="mt-3">{card.eligibility}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">Source</p>
            <a href={card.source_url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-teal underline underline-offset-4">{card.source_url}</a>
            <p className="mt-2 text-muted-foreground">Last checked: {card.last_checked ? new Date(card.last_checked).toLocaleDateString("en-IN") : "not yet checked"}</p>
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/optimizer" className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">See if it suits your spending</Link>
        <Link href={`/compare?c=${card.slug}`} className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold">Compare with other cards</Link>
      </div>
    </div>
  )
}
