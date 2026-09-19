import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return site.indexable && site.origin
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.origin}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
