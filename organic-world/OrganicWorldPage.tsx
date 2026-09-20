"use client";

import { useEffect, useRef, useState } from "react";
import FoundryExperience from "@/components/FoundryExperience";
import type { OrganicWorld } from "./World";
import { journeyAt, reviewStops, type JourneyAnchors } from "./journey";
import styles from "./page.module.css";

function SpatialLayer({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<OrganicWorld | null>(null);
  const pause = useRef(paused);
  const [failed, setFailed] = useState(false);
  useEffect(() => { pause.current = paused; engine.current?.setPaused(paused); }, [paused]);
  useEffect(() => {
    let alive = true, unavailable = false, statusTimer: ReturnType<typeof setTimeout> | undefined;
    const root = document.querySelector<HTMLElement>("[data-organic-page]")!;
    const action = root.querySelector<HTMLButtonElement>(".condition-action")!;
    const status = root.querySelector<HTMLElement>("#condition-status")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let anchors: JourneyAnchors;
    const measure = () => {
      const top = (id: string) => document.getElementById(id)!.getBoundingClientRect().top + scrollY;
      anchors = { life: top("life"), conditions: top("conditions"), foundry: top("foundry"), cultivation: top("cultivation"), material: top("material"), applications: top("applications"), end: document.documentElement.scrollHeight };
      root.dataset.stops = JSON.stringify(reviewStops(anchors, innerHeight));
      engine.current?.scroll();
    };
    const presentation = () => journeyAt(scrollY, innerHeight, anchors);
    const update = () => {
      const p = presentation();
      root.style.setProperty("--journey", String(p.page));
      root.style.setProperty("--interior", String(p.progress));
      root.dataset.cameraState = p.progress < .17 ? "A" : p.progress < .515 ? "B" : p.progress < .845 ? "C" : "D";
      action.disabled = unavailable || !engine.current || pause.current || reduced.matches;
      if (!unavailable && reduced.matches) status.textContent = "Still growth · reduced motion.";
      else if (!unavailable && status.textContent === "Still growth · reduced motion.") status.textContent = pause.current ? "Growth paused." : "";
    };
    const condition = () => engine.current?.addCondition();
    const fail = () => { if (alive) { unavailable = true; setFailed(true); root.dataset.world = "static"; status.textContent = "Still view · the living scene is unavailable on this device."; action.disabled = true; } };
    const observer = new ResizeObserver(measure);
    observer.observe(root); measure(); update();
    addEventListener("resize", measure); addEventListener("scroll", update, { passive: true });
    addEventListener("huner:influence", condition); reduced.addEventListener("change", update);
    void document.fonts.ready.then(() => { if (alive) measure(); });
    if (new URLSearchParams(location.search).get("gpu") === "off") fail();
    else void import("./World").then(({ OrganicWorld }) => {
      if (!alive || !canvas.current) return;
      const world = new OrganicWorld(canvas.current, { presentation });
      world.setPaused(pause.current);
      let lastNotice = 0;
      world.onCondition = () => {
        if (performance.now() - lastNotice < 5000) return;
        lastNotice = performance.now(); clearTimeout(statusTimer);
        status.textContent = "Conditions changed. The living system responds in its own time.";
        statusTimer = setTimeout(() => { if (alive && !unavailable) status.textContent = reduced.matches ? "Still growth · reduced motion." : pause.current ? "Growth paused." : "Growth continues to respond to the conditions."; }, 6500);
      };
      world.onFailure = fail;
      engine.current = world; root.dataset.world = "live"; update();
    }).catch(fail);
    return () => {
      alive = false; clearTimeout(statusTimer); observer.disconnect();
      removeEventListener("resize", measure); removeEventListener("scroll", update);
      removeEventListener("huner:influence", condition); reduced.removeEventListener("change", update);
      engine.current?.dispose(); engine.current = null;
    };
  }, []);
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>("[data-organic-page] .condition-action");
    if (button) button.disabled = paused || !engine.current || failed || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const status = document.querySelector<HTMLElement>("[data-organic-page] #condition-status");
    if (status && !failed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (paused) status.textContent = "Growth paused.";
      else if (status.textContent === "Growth paused.") status.textContent = "Growth resumed.";
    }
  }, [paused, failed]);
  return <>
    <canvas ref={canvas} className={styles.canvas} hidden={failed} />
    {failed && <svg className={styles.fallback} viewBox="0 0 1440 900" aria-hidden="true">
      {Array.from({ length: 48 }, (_, i) => <ellipse key={i} cx={1080} cy={440} rx={50 + i * 5} ry={74 + i * 6} transform="rotate(-14 1080 440)" fill="none" stroke="#4A6741" strokeWidth=".7" opacity={.16} />)}
    </svg>}
  </>;
}

/** The checkpoint's actual DOM and copy, with a replaceable spatial layer. */
export default function OrganicWorldPage() {
  return <div className={styles.page} data-organic-page data-world="loading">
    <FoundryExperience SpatialLayer={SpatialLayer} />
  </div>;
}
