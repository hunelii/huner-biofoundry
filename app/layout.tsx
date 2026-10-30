import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./content.css";
import "./visual-stories.css";
import "./research-journey.css";
import { site, description } from "@/lib/site";
import TrackingConsent from "@/components/TrackingConsent";
import { reviewMode } from "@/content/server";

export const viewport: Viewport = {
  themeColor: "#22311d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Huner Biofoundry | Fungal Bioprocess Research",
  description,
  metadataBase: new URL(site.origin ?? "https://huner-biofoundry.vercel.app"),
  robots: { index: site.indexable && !reviewMode, follow: !reviewMode },
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
        {site.origin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Huner Biofoundry", url: site.origin, description }).replace(/</g, "\\u003c") }} />}
        {children}
        <TrackingConsent gaId={reviewMode ? "" : site.ga} pixelId={reviewMode ? "" : site.pixel} origin={site.origin} />
      </body>
    </html>
  );
}
