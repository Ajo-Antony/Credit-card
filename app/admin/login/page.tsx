"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sb } from "@/lib/supabase-browser"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError("")
    const { error } = await sb.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) return setError(error.message)
    router.push("/admin")
  }

  return (
    <div className="mx-auto max-w-sm pt-10">
      <h1 className="font-display text-3xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use the email and password of an admin user from your Supabase project.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5" autoComplete="username" />
        </label>
        <label className="block text-sm">Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5" autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="rounded-xl bg-coin-soft px-3 py-2 text-sm text-warn">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-foreground py-3 font-semibold text-background disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  )
}
