import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "clamp(20px, 4vw, 48px)", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        navy: { 950: "#050B16", 900: "#0A1628", 800: "#102038", 700: "#1A3354" },
        green: { 950: "#04140E", 900: "#0B2F22", 700: "#155A41", 300: "#86D6B2" },
        gold: { 700: "#8A6310", 500: "#D9A63A", 300: "#EBC766" },
        paper: { 100: "#F4F0E6", 50: "#FBF9F4" },
      },
      fontFamily: {
        archivo: ["var(--font-archivo)", "Arial", "sans-serif"],
        source: ["var(--font-source-sans)", "Arial", "sans-serif"],
        plex: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: { machined: "2px", control: "4px", container: "8px" },
      maxWidth: { site: "1280px" },
      transitionTimingFunction: { mass: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      transitionDuration: { direct: "180ms", reveal: "600ms", draw: "900ms" },
      keyframes: {
        "line-draw": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "signal-pulse": { "0%, 100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
      },
      animation: { "line-draw": "line-draw 900ms cubic-bezier(0.22, 0.61, 0.36, 1) both", "signal-pulse": "signal-pulse 2.4s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
