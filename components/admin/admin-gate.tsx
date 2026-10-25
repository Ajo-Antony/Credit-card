"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { sb } from "@/lib/supabase-browser"

type State = "loading" | "denied" | "ok"

export function AdminGate({ children }: { children: (user: User, signOut: () => void) => React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [state, setState] = useState<State>("loading")

  useEffect(() => {
    let live = true
    const check = async () => {
      const { data } = await sb.auth.getSession()
      const u = data.session?.user
      if (!u) return router.replace("/admin/login")
      const { data: row } = await sb.from("admins").select("user_id").eq("user_id", u.id).maybeSingle()
      if (!live) return
      setUser(u)
      setState(row ? "ok" : "denied")
    }
    check()
    const { data: sub } = sb.auth.onAuthStateChange((e) => { if (e === "SIGNED_OUT") router.replace("/admin/login") })
    return () => { live = false; sub.subscription.unsubscribe() }
  }, [router])

  const signOut = async () => { await sb.auth.signOut(); router.replace("/admin/login") }

  if (state === "loading") return <p className="py-20 text-center text-muted-foreground">Checking access…</p>
  if (state === "denied" || !user)
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6">
        <h1 className="font-display text-2xl font-bold">This account is not an admin</h1>
        <p className="mt-2 text-muted-foreground">Signed in as {user?.email}. Add it as an admin by running this in the Supabase SQL editor, then reload:</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-background p-3 text-xs">{`insert into admins (user_id)\nselect id from auth.users where email = '${user?.email ?? "you@example.com"}';`}</pre>
        <button onClick={signOut} className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-medium">Sign out</button>
      </div>
    )
  return <>{children(user, signOut)}</>
}
