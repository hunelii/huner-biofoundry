import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { contentPaths, reviewMode } from "@/content/server";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  // Hash chapters are sections of one page, not separate indexable URLs.
  return site.indexable && site.origin && !reviewMode ? contentPaths.map(path => ({ url: `${site.origin}${path}` })) : [];
}
