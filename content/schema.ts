export type EvidenceLevel = "proposed" | "under_investigation" | "observed" | "replicated" | "validated";
export type Visibility = "public" | "review" | "private";
export type Approval = "approved" | "pending";
export type Reference = { id: string; title: string; url: string; attribution: string; scope: string };
export type Claim = {
  id: string; text: string; subject: string; source: string;
  sourceType: "company_statement" | "external_research" | "strategic_hypothesis" | "future_target" | "historical";
  evidence: EvidenceLevel; limitations: string; reviewedAt: string;
  visibility: Visibility; approval: Approval; approvedWording: string; pages: string[];
};
export type Section = { id: string; title: string; paragraphs: string[]; sources?: string[] };
export type Article = {
  slug: string; title: string; summary: string; author: string | null;
  category: "Laboratory Notes" | "Modeling Notes" | "Market Intelligence" | "Foundry Updates";
  publishedAt: string | null; updatedAt: string | null; reviewedAt: string;
  sources: string[]; researchProgram: string[]; publicationStatus: "draft" | "published";
  publicVisibility: Visibility; approval: Approval; sections: Section[];
};
export type ResearchProgram = {
  slug: string; title: string; organism: string; summary: string; question: string;
  hypothesis: string; approach: string; measurements: { name: string; purpose: string; limitation: string }[];
  status: "Candidate research direction"; limitations: string; next: string; sources: string[];
  updatedAt: string; claimId: string;
};
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function assertUniqueIds(items: { id: string }[]) {
  const ids = new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) throw new Error(`Invalid or duplicate content ID: ${item.id}`);
    ids.add(item.id);
  }
}
export function validateArticle(article: Article, references: readonly Reference[]) {
  assertUniqueIds([{ id: article.slug }]); assertUniqueIds(article.sections);
  if (!article.title.trim() || !article.summary.trim() || !article.sections.length) throw new Error("Article content is missing");
  for (const date of [article.publishedAt, article.updatedAt, article.reviewedAt]) if (date && !validDate(date)) throw new Error("Invalid editorial date");
  if (article.updatedAt && article.publishedAt && article.updatedAt < article.publishedAt) throw new Error("Update precedes publication");
  const ids = new Set(references.map(reference => reference.id));
  for (const id of [...article.sources, ...article.sections.flatMap(section => section.sources ?? [])]) if (!ids.has(id)) throw new Error(`Unknown source: ${id}`);
  if (article.publicationStatus === "published" && (article.approval !== "approved" || article.publicVisibility !== "public" || !article.author?.trim() || !article.publishedAt)) throw new Error("Publication requires approval, public visibility, author and a real date");
  return article;
}
export function canPublish(article: Article) {
  return article.publicationStatus === "published" && article.approval === "approved" && article.publicVisibility === "public" && Boolean(article.author && article.publishedAt);
}
export function validateClaims(claims: Claim[]) {
  assertUniqueIds(claims);
  for (const claim of claims) {
    if (!validDate(claim.reviewedAt) || !claim.source || !claim.limitations || !claim.approvedWording || !claim.pages.length) throw new Error(`Incomplete claim: ${claim.id}`);
    if (claim.visibility !== "public" || claim.approval !== "approved") throw new Error(`Non-public claim in public manifest: ${claim.id}`);
  }
  return claims;
}
export function selectArticles(articles: Article[], review: boolean) {
  return articles.filter(article => canPublish(article) || (review && article.publicVisibility === "review" && article.publicationStatus === "draft"));
}
export function readReviewMode(env: Record<string, string | undefined>) {
  const enabled = env.HUNER_CONTENT_REVIEW === "true";
  if (enabled && (env.VERCEL_ENV === "production" || env.CONTEXT === "production" || env.NEXT_PUBLIC_ALLOW_INDEXING === "true")) throw new Error("Editorial review cannot be built for production or indexing");
  return enabled;
}
export function readingMinutes(article: Article) {
  const words = article.sections.flatMap(section => [section.title, ...section.paragraphs]).join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
