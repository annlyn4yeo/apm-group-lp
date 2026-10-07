import type { Metadata } from "next";
import { Big_Shoulders, JetBrains_Mono, Work_Sans } from "next/font/google";
import "@/styles/globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";

// Big Shoulders: a condensed, bold industrial display face (Chicago
// ironwork/skyscraper lettering) — thematically correct for a steel,
// construction, and real-estate conglomerate, and distinctive rather than
// another generic geometric sans.
const display = Big_Shoulders({ variable: "--font-display", subsets: ["latin"], display: "swap", weight: ["700", "800"] });
const body = Work_Sans({ variable: "--font-body", subsets: ["latin"], display: "swap", weight: ["400", "600"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap", weight: ["500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE_URL, siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION },
  twitter: { card: "summary", title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

const organizationSchema = { "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION, areaServed: "India", sameAs: [] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning: the theme script sets `data-theme` on <html>
  // before React hydrates when the visitor has saved the other theme, which is
  // the one thing the server cannot know.
  return <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} data-theme={DEFAULT_THEME} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head><body className="overflow-x-hidden">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} /></body></html>;
}
