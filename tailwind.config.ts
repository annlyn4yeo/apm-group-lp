import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "clamp(20px, 4vw, 48px)", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: { 950: "#15130E", 900: "#1E1B14", 800: "#29241B", 700: "#3A3326" },
        verdigris: { 950: "#0F201B", 900: "#1C3A32", 700: "#2E5A4C", 300: "#96C9B7" },
        copper: { 700: "#8A3D1B", 600: "#A8501F", 500: "#C06430", 300: "#E8A273" },
        paper: { 100: "#ECE7DC", 50: "#F7F5F1" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: { tick: "2px" },
      maxWidth: { site: "1280px" },
      transitionTimingFunction: { engineered: "cubic-bezier(0.16, 1, 0.3, 1)" },
      transitionDuration: { direct: "160ms", reveal: "500ms", draw: "800ms" },
      keyframes: {
        "line-draw": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "signal-pulse": { "0%, 100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
      },
      animation: { "line-draw": "line-draw 800ms cubic-bezier(0.16, 1, 0.3, 1) both", "signal-pulse": "signal-pulse 2.4s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
