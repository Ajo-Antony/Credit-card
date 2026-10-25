import { getCatalog } from "@/lib/data"
import { SavedClient } from "@/components/saved-client"

export const revalidate = 60

export default async function SavedPage() {
  const { cards } = await getCatalog()
  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Saved cards</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Cards you have bookmarked on this device.</p>
      <div className="mt-8"><SavedClient cards={cards} /></div>
    </div>
  )
}
