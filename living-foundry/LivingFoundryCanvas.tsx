"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { chapters, materialWindow, contactIsTap, clamp } from "./journey";
import type { FoundryEngine } from "./engine";
export default function LivingFoundryCanvas({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<FoundryEngine | null>(null),
    pausedRef = useRef(paused);
  const [status, setStatus] = useState("initializing"),
    [debug, setDebug] = useState(false),
    [stats, setStats] = useState(""),
    [feed, setFeed] = useState(0.0367),
    [kill, setKill] = useState(0.0649),
    [view, setView] = useState(0),
    [verification, setVerification] = useState("");
  useEffect(() => {
    pausedRef.current = paused;
    if (engine.current) engine.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    if (engine.current) { engine.current.settings = { feed, kill, view }; engine.current.render(); }
  }, [feed, kill, view]);
  useEffect(() => {
    let disposed = false, scrollFrame = 0;
    const query = new URLSearchParams(location.search);
    const lab = process.env.NODE_ENV === "development" && query.has("lab");
    setDebug(lab);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let down: { x: number; y: number; at: number } | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let responseTimer: ReturnType<typeof setTimeout>;
    const readingSurfaces = [...document.querySelectorAll<HTMLElement>(".science-home")];
    const notice = (text: string) => {
      const el = document.getElementById("condition-status");
      if (el) el.textContent = text;
    };
    let elements: {
      chapters: { id: string; el: HTMLElement | null }[];
      material: HTMLElement | null;
      cultivation: HTMLElement | null;
      milestones: HTMLElement | null;
    } | null = null;
    let metrics = {
      chapterTops: [] as { id: string; top: number }[],
      materialTop: 0,
      materialHeight: 0,
      cultivationTop: 0,
      cultivationHeight: 0,
      milestonesTop: 0,
      maxScroll: 1,
    };
    const getElements = () => {
      if (!elements) {
        elements = {
          chapters: chapters.map(id => ({ id, el: document.getElementById(id) })),
          material: document.getElementById("material"),
          cultivation: document.getElementById("cultivation"),
          milestones: document.getElementById("milestones"),
        };
      }
      return elements;
    };
    const measure = () => {
      const els = getElements();
      metrics = {
        chapterTops: els.chapters.map(({ id, el }) => ({ id, top: el ? el.offsetTop : 0 })),
        materialTop: els.material ? els.material.offsetTop : 0,
        materialHeight: els.material ? els.material.offsetHeight : 0,
        cultivationTop: els.cultivation ? els.cultivation.offsetTop : 0,
        cultivationHeight: els.cultivation ? els.cultivation.offsetHeight : 0,
        milestonesTop: els.milestones ? els.milestones.offsetTop : 0,
        maxScroll: Math.max(1, document.documentElement.scrollHeight - innerHeight),
      };
    };
    const stage = () => {
      if (!metrics.materialTop) measure();
      const y = scrollY + innerHeight * 0.45;
      let chapterIdx = 0;
      for (let i = 0; i < metrics.chapterTops.length; i++) {
        if (y >= metrics.chapterTops[i].top) chapterIdx = i;
      }
      const chapterName = chapters[chapterIdx] ?? "arrival";
      if (document.documentElement.dataset.chapter !== chapterName) {
        document.documentElement.dataset.chapter = chapterName;
      }
      const journeyVal = (scrollY / metrics.maxScroll).toFixed(4);
      document.documentElement.style.setProperty("--journey", journeyVal);
      const e = engine.current;
      if (!e || e.failed) return;
      e.stage = chapterIdx;
      const windowState = materialWindow(scrollY, metrics.materialTop, metrics.materialHeight, innerHeight);
      e.boundary = e.stage === 3 || e.stage === 4 ? 1 : 0;
      const restoredMaterial = e.setMaterialTarget(windowState.progress, scrollY >= metrics.materialTop + metrics.materialHeight);
      const cultivation = getElements().cultivation;
      e.tissue = scrollY < metrics.materialTop + metrics.materialHeight
        ? clamp((scrollY - metrics.cultivationTop + innerHeight * .2) / Math.max(1, metrics.cultivationHeight - innerHeight * .5))
        : 0;
      if (cultivation) {
        cultivation.style.setProperty("--tissue", String(e.tissue));
        const phase = e.tissue < .33 ? "connect" : e.tissue < .7 ? "concentrate" : "become";
        if (cultivation.dataset.phase !== phase) cultivation.dataset.phase = phase;
      }
      if (scrollY + innerHeight * 3 > metrics.materialTop) e.loadMaterial();
      const covered = readingSurfaces.some(surface => { const box = surface.getBoundingClientRect(); return box.top <= 0 && box.bottom >= innerHeight; });
      e.visible = scrollY < metrics.milestonesTop && !covered;
      if (canvas.current) {
        const opacityStr = !e.visible ? "0" : String(windowState.opacity);
        if (canvas.current.style.opacity !== opacityStr) canvas.current.style.opacity = opacityStr;
        canvas.current.style.transform = `translate3d(0, ${windowState.offset}px, 0)`;
        if (canvas.current.dataset.chapter !== chapterName) canvas.current.dataset.chapter = chapterName;
      }
      if (e.visible && (e.paused || restoredMaterial)) e.render();
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; stage(); });
    };
    const fallback = (reason: string) => {
      const hadEngine = Boolean(engine.current);
      const anchor = document.getElementById(document.documentElement.dataset.chapter ?? "arrival");
      const before = anchor?.getBoundingClientRect().top ?? 0;
      engine.current?.dispose();
      engine.current = null;
      document.documentElement.dataset.engine = "static";
      if (canvas.current) canvas.current.style.visibility = "hidden";
      setStatus(reason);
      // Collapsing the pinned sequence must not throw the reader into another chapter.
      if (hadEngine && anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: "instant" });
      stage();
    };
    const start = async () => {
      if (reduced.matches || query.get("gpu") === "off") {
        fallback(reduced.matches ? "reduced-motion" : "gpu-disabled");
        return;
      }
      try {
        const { FoundryEngine } = await import("./engine");
        if (disposed || reduced.matches) return;
        canvas.current!.style.visibility = "visible";
        const e = new FoundryEngine(canvas.current!, setStatus, fallback);
        engine.current = e;
        e.paused = pausedRef.current;
        // GPU activation lengthens the material section; restore the requested anchor
        // after that layout change rather than leaving deep links inside the cell reveal.
        const anchor = document.getElementById(location.hash.slice(1));
        if (anchor) anchor.scrollIntoView({ behavior: "instant" });
        stage();
      } catch {
        if (!disposed) fallback("gpu-unavailable");
      }
    };
    const motionChange = () => {
      if (reduced.matches) fallback("reduced-motion");
      else if (!engine.current) void start();
    };
    const pointerMove = (event: PointerEvent) => {
      const e = engine.current;
      if (!e || e.stage < 1) return;
      if (
        event.target instanceof Element &&
        event.target.closest("button,a,.lab-panel")
      )
        return;
      const isPhone = innerWidth <= 600;
      if (isPhone) return;
      if (event.pointerType !== "mouse" && !down) return;
      const x = event.clientX / innerWidth,
        y = event.clientY / innerHeight;
      if (x > 0.5 && y < 0.63)
        e.influence(x, y, event.pointerType === "mouse" ? 0.45 : 0.8);
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest("button,a,.lab-panel")) return;
      down = { x: event.clientX, y: event.clientY, at: performance.now() };
      const e = engine.current;
      if (e && e.stage >= 1 && innerWidth > 600 && event.pointerType !== "mouse" && event.clientY < innerHeight * .63) {
        e.influence(event.clientX / innerWidth, event.clientY / innerHeight, .8);
        e.held = true;
      }
    };
    const pointerCancel = () => {
      down = null;
      if (engine.current) engine.current.held = false;
    };
    const pointerUp = (event: PointerEvent) => {
      if (
        engine.current && engine.current.stage >= 1 &&
        down &&
        event.pointerType !== "mouse" &&
        contactIsTap(Math.hypot(event.clientX - down.x, event.clientY - down.y), performance.now() - down.at)
      ) {
        if (
          !(
            event.target instanceof Element &&
            event.target.closest("button,a,.lab-panel")
          ) &&
          event.clientY / innerHeight < 0.63
        )
          engine.current?.influence(
            event.clientX / innerWidth,
            event.clientY / innerHeight,
            1,
          );
      }
      pointerCancel();
    };
    const addCondition = () => {
      if (
        !engine.current ||
        reduced.matches ||
        pausedRef.current ||
        engine.current.failed
      ) {
        notice("The living field is resting. The narrative remains open.");
        return;
      }
      engine.current.influence();
      notice("Conditions changed. Give life a moment.");
      clearTimeout(responseTimer);
      responseTimer = setTimeout(
        () => notice("The condition fades. Its influence continues."),
        3200,
      );
    };
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        engine.current?.resize();
        stage();
      }, 100);
    };
    const lost = (e: Event) => {
      e.preventDefault();
      fallback("context-lost");
    };
    const target = canvas.current!;
    target.addEventListener("webglcontextlost", lost);
    reduced.addEventListener("change", motionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", pointerUp, { passive: true });
    window.addEventListener("pointercancel", pointerCancel, { passive: true });
    window.addEventListener("blur", pointerCancel);
    window.addEventListener("huner:influence", addCondition);
    stage();
    void start();
    void document.fonts.ready.then(() => { if (!disposed) { measure(); stage(); } });
    const timer = lab
      ? setInterval(() => {
          const e = engine.current;
          setStats(
            e
              ? `${e.quality.name} · ${e.width} × ${e.height}\n${e.steps} steps · ${e.elapsed.toFixed(1)}s\nBoundary ${e.boundary ? "active" : "open"}\n${e.paused ? "paused" : "running"}`
              : "Static composition",
          );
        }, 500)
      : undefined;
    return () => {
      disposed = true;
      clearTimeout(resizeTimer);
      clearTimeout(responseTimer);
      clearInterval(timer);
      engine.current?.dispose();
      engine.current = null;
      target.removeEventListener("webglcontextlost", lost);
      reduced.removeEventListener("change", motionChange);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerCancel);
      window.removeEventListener("blur", pointerCancel);
      window.removeEventListener("huner:influence", addCondition);
    };
  }, []);
  return (
    <>
      <canvas ref={canvas} data-status={status} />
      {debug &&
        createPortal(
          <details className="lab-panel" open>
            <summary>Living Foundry / laboratory</summary>
            <p>Visual model, not scientific data.</p>
            <label>
              Feed {feed.toFixed(4)}
              <input
                type="range"
                min="0.02"
                max="0.06"
                step="0.0001"
                value={feed}
                onChange={(e) => setFeed(+e.target.value)}
              />
            </label>
            <label>
              Decay {kill.toFixed(4)}
              <input
                type="range"
                min="0.05"
                max="0.07"
                step="0.0001"
                value={kill}
                onChange={(e) => setKill(+e.target.value)}
              />
            </label>
            <button onClick={() => setView(view ? 0 : 1)}>
              {view ? "Show biology" : "Show environment"}
            </button>
            <button onClick={() => engine.current?.reset()}>Reset seed</button>
            <button
              onClick={() =>
                setVerification(
                  engine.current?.verify() ?? "Static composition",
                )
              }
            >
              Verify model
            </button>
            <button onClick={() => engine.current?.renderer.forceContextLoss()}>
              Test fallback
            </button>
            <output>{verification}</output>
            <output>
              {status}
              {"\n"}
              {stats}
            </output>
          </details>,
          document.body,
        )}
    </>
  );
}
