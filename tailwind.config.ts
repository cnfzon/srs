import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-dark": "#0f172a",
        "brand-blue": "#3b82f6",
        primary: "#3b82f6",
        "primary-container": "#dbeafe",
        "surface": "#0f172a",
        "surface-variant": "#1e293b",
        "surface-container": "#111c33",
        "surface-container-low": "#0b1220",
        "surface-container-lowest": "#020617",
        "on-surface": "#e2e8f0",
        "on-surface-variant": "#94a3b8",
        "background": "#020617",
        "background-strong": "#0b1220",
        "outline": "#334155",
        "outline-variant": "#475569",
        error: "#ef4444",
        "error-container": "#fcd9dc",
        success: "#22c55e",
        info: "#38bdf8"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.25), 0 10px 30px rgba(2,6,23,0.55)"
      },
      fontFamily: {
        sans: ["Public Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "glass-gradient": "radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 25%), radial-gradient(circle at bottom right, rgba(56,189,248,0.14), transparent 30%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.97))"
      }
    }
  },
  plugins: []
} satisfies Config;

