"use client";
import { useEffect, useRef, useState } from "react";

/** Live Bioprocess 3D deployment. Because it is embedded from its own published
 * address, every update to that project appears here without rebuilding this site. */
const source = process.env.NEXT_PUBLIC_BIOPROCESS_URL || "https://hunelii.github.io/bioprocess-modeling/";

export default function BioprocessStage({ id = "bioprocess" }: { id?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  // The second WebGL scene is created only when the reader approaches it.
  useEffect(() => {
    const node = frame.current;
    if (!node || load) return;
    if (!("IntersectionObserver" in window)) { setLoad(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setLoad(true); observer.disconnect(); }
    }, { rootMargin: "100% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [load]);
  return (
    <section id={id} className="bioprocess-stage" aria-labelledby={`${id}-title`}>
      <div className="bioprocess-intro">
        <p className="eyebrow">06 / FROM CELL TO CULTURE</p>
        <h2 id={`${id}-title`}>One cell.<br />A whole process.</h2>
        <p>A single cell cannot become a process on its own. Follow it from isolation to cultivation, growth and observation. The scene below is an illustrative laboratory model, not a Huner facility.</p>
      </div>
      <div className="bioprocess-frame" ref={frame}>
        {load ? (
          <iframe
            src={source}
            title="Interactive 3D model of a fungal bioprocess, from isolation to observation"
            loading="lazy"
            allow="fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="bioprocess-placeholder" aria-hidden="true" />
        )}
      </div>
      <p className="scope-caption">Illustrative model · scroll inside the scene to move through the stations. <a href={source} target="_blank" rel="noreferrer">Open full screen ↗</a></p>
    </section>
  );
}
