import type { Metadata } from "next";
import { site } from "./site";
import { reviewMode } from "@/content/server";
export function contentMetadata(title: string, description: string, path: string): Metadata {
  return { title: `${title} | Huner Biofoundry`, description,
    alternates: { canonical: site.origin && !reviewMode ? `${site.origin}${path}` : undefined },
    robots: { index: site.indexable && !reviewMode, follow: !reviewMode },
    openGraph: { title, description, type: "website", siteName: "Huner Biofoundry", url: site.origin && !reviewMode ? `${site.origin}${path}` : undefined, images: [{ url: "/social/huner-research.png", width: 1200, height: 630, alt: "Huner Biofoundry — Fungal bioprocess research" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/social/huner-research.png"] },
  };
}
