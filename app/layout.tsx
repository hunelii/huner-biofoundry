import type { Metadata } from "next";
import "./globals.css";
import { site, description } from "@/lib/site";
import TrackingConsent from "@/components/TrackingConsent";
export const metadata: Metadata = {
  title: "Huner Biofoundry | Food, Fragrance & Biological Materials",
  description,
  ...(site.origin ? { metadataBase: new URL(site.origin), alternates: { canonical: "/" } } : {}),
  robots: { index: site.indexable, follow: true },
  openGraph: { type: "website", title: "Huner Biofoundry — Making with life, for life.", description, siteName: "Huner Biofoundry", locale: "en_US", ...(site.origin ? { url: site.origin } : {}) },
  twitter: { card: "summary", title: "Huner Biofoundry", description },
  ...(site.verification ? { verification: { google: site.verification } } : {}),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {site.origin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Huner Biofoundry", url: site.origin, description, ...(site.email ? { email: site.email } : {}) }).replace(/</g, "\\u003c") }} />}
        {children}
        <TrackingConsent gaId={site.ga} pixelId={site.pixel} origin={site.origin} />
      </body>
    </html>
  );
}
