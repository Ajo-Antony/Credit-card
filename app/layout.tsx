import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: "Swipewise — pick the credit card that pays back on your spending",
  description: "Compare Indian credit cards, see exactly how rewards are calculated, and find the best card for your monthly spending.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8 sm:px-8">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground sm:px-8">
            Figures come from public issuer pages and can change. Check the issuer&apos;s current terms before you apply.{" "}
            <Link href="/cards" className="underline underline-offset-4">Browse cards</Link>{" · "}<Link href="/admin" className="underline underline-offset-4">Admin</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
