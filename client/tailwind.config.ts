import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "hsl(var(--paper) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        ink: "hsl(var(--ink) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        sun: "hsl(var(--sun) / <alpha-value>)",
        coral: "hsl(var(--coral) / <alpha-value>)",
        peach: "hsl(var(--peach) / <alpha-value>)",
        sky: "hsl(var(--sky) / <alpha-value>)",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          '"SF Mono"',
          '"JetBrains Mono"',
          '"Cascadia Code"',
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        brutal: "3px 3px 0 0 hsl(var(--ink))",
        "brutal-sm": "2px 2px 0 0 hsl(var(--ink))",
        "brutal-lg": "5px 5px 0 0 hsl(var(--ink))",
      },
      borderRadius: { lg: "2px", md: "2px", sm: "1px" },
    },
  },
  plugins: [],
} satisfies Config;
