import type { ReactNode } from "react";
import SiteNavigation from "./SiteNavigation";
import { site } from "@/lib/site";
import { reviewMode } from "@/content/server";
export default function ReadingPage({ chapter, title, intro, children, path, parent }: { chapter: string; title: string; intro: string; children: ReactNode; path: string; parent?: { title: string; href: string } }) {
  const crumbs = [{ name: "Huner", path: "/" }, ...(parent ? [{ name: parent.title, path: parent.href }] : []), { name: chapter, path }];
  return <div className="reading-site">
    <a className="skip-link" href="#content">Skip to content</a><SiteNavigation />
    {reviewMode && <p className="review-banner">Editorial preview · unpublished drafts are visible for review · search indexing disabled</p>}
    <main id="content" className="reading-main" tabIndex={-1}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">{crumbs.map((crumb, i) => <span key={crumb.path}>{i > 0 && <span aria-hidden="true"> / </span>}{i === crumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <a href={crumb.path}>{crumb.name}</a>}</span>)}</nav>
      <div className="reading-hero"><p className="eyebrow">HUNER / {chapter.toUpperCase()}</p><h1>{title}</h1><p className="reading-intro">{intro}</p></div>
      {children}
    </main>
    <footer className="reading-footer"><a href="/">HUNER BIOFOUNDRY</a><p>Making with life, for life.</p><nav aria-label="Footer"><a href="/research/">Research</a><a href="/people/">People</a><a href="/collaborate/">Collaboration</a><a href="/privacy/">Privacy</a></nav><a href="#content">Back to top ↑</a></footer>
    {site.origin && !reviewMode && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, name: crumb.name, item: `${site.origin}${crumb.path}` })) }).replace(/</g, "\\u003c") }} />}
  </div>;
}
