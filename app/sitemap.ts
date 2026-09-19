import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  // Hash chapters are sections of one page, not separate indexable URLs.
  return site.indexable && site.origin ? [{ url: `${site.origin}/` }] : [];
}
