import Link from "next/link"
import GlassFolder, { type FolderFile } from "@/components/ui/glass-folder-cards"
import { getCatalog } from "@/lib/data"
import { inr } from "@/lib/utils"

export const revalidate = 60

const GROUPS = [
  { label: "Everyday cashback", art: "aurora" as const, seed: 3, slugs: ["sbi-cashback", "axis-ace", "amazon-pay-icici", "hdfc-millennia"], arts: ["ember", "dusk", undefined, "verdant"] },
  { label: "Shopping and food", art: "glacier" as const, seed: 7, slugs: ["flipkart-axis", "hdfc-swiggy", "amazon-pay-icici"], arts: ["dusk", "ember", undefined] },
  { label: "Travel and fuel", art: "verdant" as const, seed: 11, slugs: ["hdfc-regalia-gold", "tata-neu-infinity", "bpcl-sbi-octane"], arts: ["aurora", undefined, "ember"] },
]

export default async function Home() {
  const { cards } = await getCatalog()
  const folders = GROUPS.map((g) => ({
    ...g,
    files: g.slugs.flatMap((s, i): FolderFile[] => {
      const c = cards.find((x) => x.slug === s)
      if (!c) return []
      return [{ name: c.name, meta: c.annual_fee ? inr(c.annual_fee) + "/yr" : "Free", href: `/cards/${c.slug}`, art: g.arts[i] as FolderFile["art"] }]
    }),
  }))

  return (
    <div>
      <section className="pt-6 md:pt-12">
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.02] md:text-7xl">Find the card that pays you back for the way you spend.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Compare Indian credit cards on fees, reward rates and limits. Enter your monthly spending and see what each card would really return after fees, with the working shown.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/optimizer" className="rounded-full bg-foreground px-6 py-3.5 font-semibold text-background">Find my card</Link>
          <Link href="/cards" className="rounded-full border border-foreground/20 bg-surface px-6 py-3.5 font-semibold">Browse all cards</Link>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="folders-h">
        <h2 id="folders-h" className="font-display text-2xl font-bold">Start from how you shop</h2>
        <p className="mt-2 text-muted-foreground">Open a folder and pick a card.</p>
        <div className="mt-6 grid grid-cols-1 items-end justify-items-center gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {folders.map((f, i) => (
            <GlassFolder key={f.label} label={f.label} meta={`${f.files.length} cards`} art={f.art} seed={f.seed} files={f.files} action="none" appearDelay={i * 140} />
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-8 border-t border-line pt-10 md:grid-cols-3">
        {[
          ["Every figure has a source", "Fees and rates link back to the issuer page they came from, with a clear note when they have not been checked yet."],
          ["Changes are reviewed first", "Proposed updates wait for a person to approve them. Unapproved changes are never shown as facts."],
          ["The maths is visible", "Each result lists the spend, rate, limit and fee behind it, so you can check it against your own statement."],
        ].map(([t, d]) => (
          <div key={t}><h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p></div>
        ))}
      </section>
    </div>
  )
}
