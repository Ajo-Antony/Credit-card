"use client"

import GlassFolder from "@/components/ui/glass-folder-cards"

export default function GlassFolderCardsDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-16" style={{ minHeight: "100svh" }}>
      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-14 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        <GlassFolder label="My Files" art="aurora" seed={3} appearDelay={0} />
        <GlassFolder
          label="Archives" art="none" action="more" labelPlacement="top-left" appearDelay={140}
          files={[
            { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
            { name: "Invoices", meta: "12 PDFs" },
            { name: "Contract.pdf", meta: "PDF · 320 KB" },
          ]}
          menu={[{ label: "Rename" }, { label: "Share…" }, { label: "Move to Trash", danger: true }]}
        />
        <GlassFolder label="My Files" meta="Wed 19 Aug" tone="dark" art="ember" seed={11} action="none" labelPlacement="top-right" appearDelay={280}
          files={[{ name: "Stills", meta: "64 images", art: "verdant" }, { name: "Edit notes", meta: "TXT · 4 KB" }]} />
      </div>
    </div>
  )
}
