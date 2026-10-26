import { notFound } from "next/navigation";
import { visiblePublications } from "@/content/server";
import { contentMetadata } from "@/lib/content-metadata";
import ArticleReader from "@/components/content/ArticleReader";
import EditorialPolicy from "@/components/content/EditorialPolicy";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return [{slug:"review-policy"}, ...visiblePublications.map(article => ({slug:article.slug}))]; }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug} = await params; if (slug === "review-policy") return contentMetadata("Publication review policy", "The review requirements for technical documents published by Huner.", "/publications/review-policy/"); const article = visiblePublications.find(item => item.slug === slug); return article ? contentMetadata(article.title,article.summary,`/publications/${slug}/`) : {}; }
export default async function Page({params}:{params:Promise<{slug:string}>}) { const {slug} = await params; if (slug === "review-policy") return <EditorialPolicy publication/>; const article = visiblePublications.find(item => item.slug === slug); if (!article) notFound(); return <ArticleReader article={article} publication/>; }
