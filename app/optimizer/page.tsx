import { getCatalog } from "@/lib/data"
import { OptimizerClient } from "@/components/optimizer-client"

export const revalidate = 60

export default async function OptimizerPage() {
  const { cards } = await getCatalog()
  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Find the card for your spending</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Tell us what you spend each month. We work out what each card would pay back after fees, and show the arithmetic.</p>
      <div className="mt-8"><OptimizerClient cards={cards} /></div>
    </div>
  )
}
