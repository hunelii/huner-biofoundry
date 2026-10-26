import type { Article } from "@/content/schema";
import { readingMinutes, canPublish } from "@/content/schema";
import { visibleArticles, reviewMode } from "@/content/server";
import ReadingPage from "./ReadingPage";
import { CitationList, UncertaintyNote } from "./Science";
import { site } from "@/lib/site";
export default function ArticleReader({ article, publication = false }: { article: Article; publication?: boolean }) {
  const base = publication ? "/publications/" : "/journal/", parent = publication ? "Publications" : "Journal";
  const related = visibleArticles.filter(item => item.slug !== article.slug).slice(0, 2);
  return <ReadingPage path={`${base}${article.slug}/`} chapter={publication ? "Research perspective" : article.category} parent={{title:parent,href:base}} title={article.title} intro={article.summary}>
    <div className="article-meta"><span>{canPublish(article) ? article.author : "Educational draft · authorship pending"}</span><span>{readingMinutes(article)} min read</span>{article.publishedAt ? <time dateTime={article.publishedAt}>Published {article.publishedAt}</time> : <span>Not published</span>}{article.updatedAt && <time dateTime={article.updatedAt}>Updated {article.updatedAt}</time>}</div>
    {article.publicationStatus === "draft" && <UncertaintyNote>This text is for editorial and scientific review. It is not a laboratory report, a peer-reviewed publication or an approved statement of experimental results.</UncertaintyNote>}
    <div className="article-layout"><nav className="article-toc" aria-label="On this page"><p className="eyebrow">ON THIS PAGE</p><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol><a href="#references">References ↓</a></nav><article className="article-body">{article.sections.map(section => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,i) => <p key={i}>{paragraph}</p>)}{section.sources && <CitationList ids={section.sources}/>}</section>)}<section id="references"><h2>References & scope</h2><p>External sources support the educational context. They are not evidence of Huner’s experimental performance.</p><CitationList ids={article.sources}/></section></article></div>
    <nav className="related-links" aria-label="Related reading"><a href="/approach/">Our approach ↗</a>{article.researchProgram.map(slug => <a key={slug} href={`/research/${slug}/`}>{slug.replaceAll("-", " ")} research direction ↗</a>)}{related.map(item => <a key={item.slug} href={`/journal/${item.slug}/`}>{item.title} ↗</a>)}<a href={base}>Back to {parent.toLowerCase()} ↗</a></nav>
    {canPublish(article) && !reviewMode && site.origin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context":"https://schema.org", "@type":"Article", headline:article.title, description:article.summary, author:{"@type":"Person",name:article.author}, datePublished:article.publishedAt, ...(article.updatedAt ? {dateModified:article.updatedAt} : {}), mainEntityOfPage:`${site.origin}${base}${article.slug}/` }).replace(/</g,"\\u003c") }}/>} 
  </ReadingPage>;
}
