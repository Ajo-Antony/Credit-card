import { getCatalog } from "@/lib/data"
import { CompareClient } from "@/components/compare-client"

export const revalidate = 60

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams
  const { cards } = await getCatalog()
  const initial = (c ?? "").split(",").filter((s) => cards.some((x) => x.slug === s))
  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Compare cards</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Put up to three cards side by side. The best value in each row is highlighted.</p>
      <div className="mt-8"><CompareClient cards={cards} initial={initial} /></div>
    </div>
  )
}
