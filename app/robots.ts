import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { reviewMode } from "@/content/server";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return site.indexable && site.origin && !reviewMode
    ? { rules: { userAgent: "*", allow: "/", disallow: "/lab/" }, sitemap: `${site.origin}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
