import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        "elevated-2": "var(--elevated-2)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "c-cyan": "var(--c-cyan)",
        "c-emerald": "var(--c-emerald)",
        "c-amber": "var(--c-amber)",
        "c-rose": "var(--c-rose)",
        good: "var(--good)",
        warn: "var(--warn)",
        bad: "var(--bad)",
      },
      borderRadius: {
        radius: "var(--radius)",
        "radius-sm": "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
