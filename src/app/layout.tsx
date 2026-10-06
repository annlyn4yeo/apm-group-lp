import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import "@/styles/globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], display: "swap", weight: ["700", "800"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], display: "swap", weight: ["400", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], display: "swap", weight: ["500"] });

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
  return <html lang="en" className={`${archivo.variable} ${sourceSans.variable} ${plexMono.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} /></body></html>;
}
