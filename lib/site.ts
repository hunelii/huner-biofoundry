export function readSiteConfig(env: Record<string, string | undefined>) {
  let origin: string | undefined;
  if (env.NEXT_PUBLIC_SITE_URL) {
    const url = new URL(env.NEXT_PUBLIC_SITE_URL);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash)
      throw new Error("NEXT_PUBLIC_SITE_URL must be the public HTTPS origin, without a path, query or credentials.");
    origin = url.origin;
  }
  const preview = (env.VERCEL_ENV && env.VERCEL_ENV !== "production") || (env.CONTEXT && env.CONTEXT !== "production");
  const indexable = Boolean(origin && env.NEXT_PUBLIC_ALLOW_INDEXING === "true" && !preview);
  const email = env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (email && !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) throw new Error("Invalid public contact email");
  const ga = env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
  const pixel = env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  if (ga && !/^G-[A-Z0-9]+$/.test(ga)) throw new Error("GA4 ID must start with G-");
  if (pixel && !/^\d+$/.test(pixel)) throw new Error("Meta Pixel ID must contain only digits");
  return { origin, indexable, email, ga, pixel, verification: env.GOOGLE_SITE_VERIFICATION?.trim() };
}
export const site = readSiteConfig({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  VERCEL_ENV: process.env.VERCEL_ENV,
  CONTEXT: process.env.CONTEXT,
});
export const description = "Explore Huner Biofoundry: cultivating living systems for food, fragrance and biological raw materials. Making with life, for life.";
