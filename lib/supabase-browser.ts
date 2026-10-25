import { createClient } from "@supabase/supabase-js"

// Browser client that keeps the admin's session. Every write is still checked by row-level security in the database.
export const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.local",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "missing",
  { auth: { persistSession: true, autoRefreshToken: true } }
)

export async function logAction(action: string, detail: Record<string, unknown>) {
  const { data } = await sb.auth.getUser()
  await sb.from("audit_log").insert({ actor: data.user?.id ?? null, action, detail })
}
