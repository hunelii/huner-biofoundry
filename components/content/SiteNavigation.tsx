const links = [["/approach/", "Approach"], ["/research/", "Research"], ["/applications/", "Applications"], ["/progress/", "Progress"], ["/journal/", "Journal"], ["/people/", "People"], ["/publications/", "Publications"], ["/collaborate/", "Collaborate"]] as const;
export default function SiteNavigation({ home = false }: { home?: boolean }) {
  return <header className={`brand-header content-navigation${home ? " home-navigation" : ""}`}>
    <a className="wordmark" href={home ? "#arrival" : "/"} aria-label="Huner Biofoundry home"><span>HUNER</span><span>BIOFOUNDRY</span></a>
    <nav className="reading-nav" aria-label="Main navigation">{links.slice(0, 5).map(([href, title]) => <a key={href} href={href}>{title}</a>)}</nav>
    <details className="site-menu"><summary>Explore <span aria-hidden="true">＋</span></summary><nav aria-label="All pages"><a href="/">Home</a>{links.map(([href, title]) => <a key={href} href={href}>{title}</a>)}</nav></details>
  </header>;
}
