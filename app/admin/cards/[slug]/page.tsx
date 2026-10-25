"use client"

import { useParams } from "next/navigation"
import { AdminGate } from "@/components/admin/admin-gate"
import { CardEditor } from "@/components/admin/card-editor"

export default function EditCardPage() {
  const { slug } = useParams<{ slug: string }>()
  return <AdminGate>{() => <CardEditor slug={slug} />}</AdminGate>
}
