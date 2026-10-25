"use client"

import { useCallback, useEffect, useState } from "react"

const KEY = "swipewise:saved"

export function useSaved() {
  const [saved, setSaved] = useState<string[]>([])
  useEffect(() => {
    const read = () => {
      try { setSaved(JSON.parse(localStorage.getItem(KEY) || "[]")) } catch { setSaved([]) }
    }
    read()
    window.addEventListener("storage", read)
    window.addEventListener("swipewise:saved", read)
    return () => {
      window.removeEventListener("storage", read)
      window.removeEventListener("swipewise:saved", read)
    }
  }, [])
  const toggle = useCallback((slug: string) => {
    let cur: string[] = []
    try { cur = JSON.parse(localStorage.getItem(KEY) || "[]") } catch {}
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    window.dispatchEvent(new Event("swipewise:saved"))
  }, [])
  return { saved, toggle }
}
