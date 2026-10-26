import { notFound } from "next/navigation";
import { visibleArticles } from "@/content/server";
import { contentMetadata } from "@/lib/content-metadata";
import ArticleReader from "@/components/content/ArticleReader";
import EditorialPolicy from "@/components/content/EditorialPolicy";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return [{slug:"editorial-policy"}, ...visibleArticles.map(article => ({slug:article.slug}))]; }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug} = await params; if (slug === "editorial-policy") return contentMetadata("Journal editorial policy", "How Huner distinguishes educational writing, observations and ambitions.", "/journal/editorial-policy/"); const article = visibleArticles.find(item => item.slug === slug); return article ? contentMetadata(article.title,article.summary,`/journal/${slug}/`) : {}; }
export default async function Page({params}:{params:Promise<{slug:string}>}) { const {slug} = await params; if (slug === "editorial-policy") return <EditorialPolicy/>; const article = visibleArticles.find(item => item.slug === slug); if (!article) notFound(); return <ArticleReader article={article}/>; }
