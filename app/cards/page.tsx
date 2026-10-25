import { getCatalog } from "@/lib/data"
import { CardBrowser } from "@/components/card-browser"

export const revalidate = 60

export default async function CardsPage() {
  const { cards, source } = await getCatalog()
  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Credit cards</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Every card shows its verification status. Figures marked &ldquo;Awaiting verification&rdquo; have not yet been checked against the issuer&apos;s own documents.
      </p>
      {source === "sample" && (
        <p className="mt-4 max-w-xl rounded-xl bg-coin-soft px-4 py-3 text-sm text-warn">
          Showing the built-in sample set. Run <code>supabase/schema.sql</code> and <code>supabase/seed.sql</code> in your Supabase project to load the catalogue from the database.
        </p>
      )}
      <div className="mt-8"><CardBrowser cards={cards} /></div>
    </div>
  )
}
