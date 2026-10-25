"use client"

import { AdminGate } from "@/components/admin/admin-gate"
import { Dashboard } from "@/components/admin/dashboard"

export default function AdminPage() {
  return <AdminGate>{(user, signOut) => <Dashboard email={user.email ?? ""} signOut={signOut} />}</AdminGate>
}
