"use client";

import { useEffect, useRef } from "react";

const links = [["/approach/", "Approach"], ["/research/", "Research"], ["/applications/", "Applications"], ["/progress/", "Progress"], ["/people/", "People"], ["/collaborate/", "Collaborate"]] as const;
export default function SiteNavigation({ home = false }: { home?: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) menu.current.open = false;
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);
  return <header className={`brand-header content-navigation${home ? " home-navigation" : ""}`}>
    <a className="wordmark" href={home ? "#arrival" : "/"} aria-label="Huner Biofoundry home"><span>HUNER</span><span>BIOFOUNDRY</span></a>
    <nav className="reading-nav" aria-label="Main navigation">{links.map(([href, title]) => <a key={href} href={href}>{title}</a>)}</nav>
    <details className="site-menu" ref={menu}><summary>Explore</summary><nav aria-label="More pages" onClick={event => { if ((event.target as Element).closest("a") && menu.current) menu.current.open = false; }}><a href="/">Home</a>{links.map(([href, title], index) => <a key={href} className={index < 3 ? "menu-primary" : index < 5 ? "menu-secondary" : undefined} href={href}>{title}</a>)}</nav></details>
  </header>;
}
