import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        surface: "var(--surface)",
        line: "var(--line)",
        teal: { DEFAULT: "var(--teal)", soft: "var(--teal-soft)" },
        coin: { DEFAULT: "var(--coin)", soft: "var(--coin-soft)" },
        warn: "var(--warn)",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["'Instrument Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config
