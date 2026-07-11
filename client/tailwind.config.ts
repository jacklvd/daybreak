import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(150 12% 86%)",
        input: "hsl(150 12% 86%)",
        ring: "hsl(167 65% 26%)",
        background: "hsl(180 12% 97%)",
        foreground: "hsl(140 14% 11%)",
        muted: {
          DEFAULT: "hsl(130 11% 94%)",
          foreground: "hsl(139 8% 42%)",
        },
        primary: {
          DEFAULT: "hsl(169 65% 25%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(206 38% 94%)",
          foreground: "hsl(204 56% 31%)",
        },
        accent: {
          DEFAULT: "hsl(137 25% 94%)",
          foreground: "hsl(153 28% 22%)",
        },
        warning: {
          DEFAULT: "hsl(37 100% 94%)",
          foreground: "hsl(29 70% 35%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(140 14% 11%)",
        },
      },
      boxShadow: {
        soft: "0 1px 2px hsl(140 18% 12% / 0.05), 0 10px 28px hsl(140 18% 12% / 0.06)",
      },
      borderRadius: {
        lg: "8px",
        md: "7px",
        sm: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
