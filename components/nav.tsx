"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/cards", label: "Cards" },
  { href: "/compare", label: "Compare" },
  { href: "/optimizer", label: "Find my card" },
  { href: "/saved", label: "Saved" },
]

export function Nav() {
  const path = usePathname()
  return (
    <header className="border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-coin text-[11px] font-bold text-foreground">₹</span>
          Swipewise
        </Link>
        <nav className="flex gap-1 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path.startsWith(l.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors hover:bg-foreground/5",
                path.startsWith(l.href) && "bg-foreground text-background hover:bg-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
