"use client";
import { useEffect, useRef, useState } from "react";
import { milestones } from "@/lib/milestones";
import type { MilestoneSculpture } from "@/living-foundry/MilestoneSculpture";

export default function MilestoneJourney({ paused }: { paused: boolean }) {
  const section = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<MilestoneSculpture | null>(null), labels = useRef<(HTMLButtonElement | null)[]>([]);
  const [ready, setReady] = useState(false), [active, setActive] = useState(0), [overview, setOverview] = useState(true);
  const pausedRef = useRef(paused), selection = useRef({ active, overview });
  useEffect(() => { pausedRef.current = paused; scene.current?.freeze(paused); }, [paused]);
  useEffect(() => { selection.current = { active, overview }; scene.current?.select(active, overview); }, [active, overview]);
  useEffect(() => {
    const node = section.current!, reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, loading = false, near = false, visible = false, failed = false;
    const start = async () => {
      if (disposed || loading || failed || !near || scene.current || reduced.matches || new URLSearchParams(location.search).get("gpu") === "off") return;
      loading = true;
      try {
        const { MilestoneSculpture } = await import("@/living-foundry/MilestoneSculpture");
        if (disposed || reduced.matches) return;
        scene.current = new MilestoneSculpture(canvas.current!, labels.current.filter((x): x is HTMLButtonElement => Boolean(x)), () => { failed = true; scene.current = null; setReady(false); });
        scene.current.freeze(pausedRef.current); scene.current.show(visible && !document.hidden);
        scene.current.select(selection.current.active, selection.current.overview); setReady(true);
      } catch { failed = true; setReady(false); }
      finally { loading = false; }
    };
    const observer = new IntersectionObserver(entries => { near = entries[0].isIntersecting; void start(); }, { rootMargin: "400px" }); observer.observe(node);
    const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; scene.current?.show(visible && !document.hidden); }); visibility.observe(node);
    const tabVisibility = () => scene.current?.show(visible && !document.hidden);
    const resize = new ResizeObserver(() => scene.current?.resize()); resize.observe(canvas.current!);
    const motion = () => { if (reduced.matches) { scene.current?.dispose(); scene.current = null; setReady(false); } else void start(); };
    document.addEventListener("visibilitychange", tabVisibility); reduced.addEventListener("change", motion);
    return () => { disposed = true; observer.disconnect(); visibility.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", tabVisibility); reduced.removeEventListener("change", motion); scene.current?.dispose(); scene.current = null; };
  }, []);
  const focus = (index: number, reveal = false) => {
    setActive(index); setOverview(false);
    if (reveal && innerWidth <= 700) {
      document.getElementById("milestone-view")?.scrollIntoView({ block: "start", behavior: pausedRef.current || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  };
  return <section id="milestones" className="milestone-journey" ref={section} data-ready={ready} data-overview={overview} aria-labelledby="milestones-title">
    <div className="milestone-heading"><p className="eyebrow">07 / MILESTONES</p><h2 id="milestones-title">Taking root.<br /><span>Reaching<br className="milestone-desktop-break" /> further.</span></h2></div>
    <div id="milestone-view" className="milestone-world" aria-label="Three-dimensional milestone timeline">
      <canvas ref={canvas} aria-hidden="true" onClick={event => { const hit = scene.current?.hit(event.clientX, event.clientY); if (hit != null) focus(hit); }} />
      <div className="milestone-pins">{milestones.map((m, i) => <button key={m.id} ref={el => { labels.current[i] = el; }} onClick={() => focus(i)} tabIndex={ready ? 0 : -1} aria-label={`Explore ${m.title}`}><span>{String(i + 1).padStart(2, "0")}</span><span className="pin-name">{m.title}</span></button>)}</div>
      <span className="world-caption" aria-hidden="true">{overview ? "FIVE MILESTONES / ONE CONTINUOUS JOURNEY" : `${String(active + 1).padStart(2, "0")} / ${milestones[active].category.toUpperCase()}`}</span>
    </div>
    <div className="milestone-content">
      <p className="sr-only" role="status">{ready ? `${milestones[active].title}. ${milestones[active].result}.` : ""}</p>
      <ol className="milestone-list">{milestones.map((m, i) => <li id={`milestone-${m.id}`} key={m.id} data-active={i === active} hidden={ready && i !== active}>
        <div className="milestone-detail-heading"><span className="milestone-record" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p className="milestone-category">{m.category}</p></div>
        <h3>{m.title}</h3><p className="milestone-result">{m.result}</p><p className="milestone-description">{m.copy}<br /><small>Huner-supplied record · event date unconfirmed.</small><br /><a className="text-link" href="/progress/">Read the evidence & status ↗</a></p>
      </li>)}</ol>
      <div className="milestone-controls" hidden={!ready}>
        <button className="overview-control" aria-pressed={overview} onClick={() => setOverview(!overview)}>{overview ? "Take a closer look ↗" : "See the whole journey ↖"}</button>
        <div><button aria-label="Previous milestone" disabled={active === 0 && !overview} onClick={() => focus(Math.max(0, active - 1))}>←</button><span>{String(active + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}</span><button aria-label="Next milestone" disabled={active === milestones.length - 1 && !overview} onClick={() => focus(overview ? 0 : Math.min(milestones.length - 1, active + 1))}>→</button></div>
      </div>
    </div>
    <nav className="milestone-index" aria-label="Select a milestone" hidden={!ready}>{milestones.map((m, i) => <button key={m.id} aria-current={!overview && i === active ? "step" : undefined} onClick={() => focus(i, true)}><span className="milestone-index-number">{String(i + 1).padStart(2, "0")}</span><span className="milestone-index-title">{m.title}</span><span className="milestone-index-result">{m.result}</span><i /></button>)}</nav>
    <a className="journey-next" href="#team">Meet the people behind Huner ↓</a>
  </section>;
}
