import type { Config } from "tailwindcss";

const themed = (token: string) => `rgb(var(--${token}) / <alpha-value>)`;

const config: Config = {
  // Every `hover:` variant only applies on devices that can actually hover,
  // so taps on touch screens never leave a stuck hover state behind.
  future: { hoverOnlyWhenSupported: true },
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "clamp(20px, 4vw, 48px)", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // Colours are theme roles, not literals: each reads a channel triplet
        // from design-tokens.css, so the same class re-colours with the theme
        // and `/50` alpha modifiers still work. Change colours there.
        ink: { 950: themed("ink-950"), 900: themed("ink-900"), 800: themed("ink-800"), 700: themed("ink-700") },
        verdigris: { 950: themed("verdigris-950"), 900: themed("verdigris-900"), 700: themed("verdigris-700"), 300: themed("verdigris-300") },
        copper: { 700: themed("copper-700"), 600: themed("copper-600"), 500: themed("copper-500"), 300: themed("copper-300") },
        paper: { 100: themed("paper-100"), 50: themed("paper-50") },
        // Already carries its own strength (--shade-alpha), so it takes no /alpha.
        shade: "rgb(var(--shade) / var(--shade-alpha))",
        panel: themed("panel"),
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
