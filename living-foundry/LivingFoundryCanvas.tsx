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
    const stage = () => {
      // 1. Read phase: batch layout reads before writing styles to prevent forced reflow
      const currentScrollY = scrollY;
      const vh = innerHeight;
      const scrollH = document.documentElement.scrollHeight;
      const y = currentScrollY + vh * 0.45;

      const matEl = document.getElementById("material");
      const cultEl = document.getElementById("cultivation");
      const mileEl = document.getElementById("milestones");
      const bioEl = document.getElementById("bioprocess");

      const materialTop = matEl ? matEl.offsetTop : 0;
      const materialHeight = matEl ? matEl.offsetHeight : 0;
      const cultivationTop = cultEl ? cultEl.offsetTop : 0;
      const cultivationHeight = cultEl ? cultEl.offsetHeight : 0;
      const milestonesTop = mileEl ? mileEl.offsetTop : 0;
      const bioTop = bioEl ? bioEl.offsetTop : materialTop + materialHeight;
      const bioHeight = bioEl ? bioEl.offsetHeight : 0;

      let chapterIdx = 0;
      for (let i = 0; i < chapters.length; i++) {
        const el = document.getElementById(chapters[i]);
        if (el && y >= el.offsetTop) chapterIdx = i;
      }

      const windowState = materialWindow(currentScrollY, materialTop, materialHeight, vh);
      const end = materialTop + materialHeight;

      // Coordinate seamless cell handoff with Bioprocess 3D
      let handoffT = 0;
      let inHandoffZone = false;
      let inBioprocessStages = false;
      let inMaterialWithBio = false;

      if (bioEl && bioHeight > 0) {
        const bioScrollDist = Math.max(1, bioHeight - vh);
        const rawBioP = (currentScrollY - bioTop) / bioScrollDist;
        const bioHandoffRatio = 0.18;
        if (currentScrollY >= materialTop && currentScrollY < bioTop) {
          inMaterialWithBio = true;
        } else if (rawBioP >= 0 && rawBioP < bioHandoffRatio) {
          inHandoffZone = true;
          handoffT = clamp(rawBioP / bioHandoffRatio);
        } else if (rawBioP >= bioHandoffRatio && currentScrollY < bioTop + bioHeight) {
          inBioprocessStages = true;
          handoffT = 1;
        }
      }

      const tissueVal = currentScrollY < end
        ? clamp((currentScrollY - cultivationTop + vh * 0.2) / Math.max(1, cultivationHeight - vh * 0.5))
        : 0;

      const covered = readingSurfaces.some(surface => {
        const box = surface.getBoundingClientRect();
        return box.top <= 0 && box.bottom >= vh;
      });

      // 2. Write phase: update state, datasets and styles smoothly
      const chapterName = chapters[chapterIdx] ?? "arrival";
      if (document.documentElement.dataset.chapter !== chapterName) {
        document.documentElement.dataset.chapter = chapterName;
      }
      document.documentElement.style.setProperty("--journey", String(currentScrollY / Math.max(1, scrollH - vh)));

      const e = engine.current;
      if (!e || e.failed) return;

      e.stage = chapterIdx;
      e.boundary = e.stage === 3 || e.stage === 4 ? 1 : 0;

      // Cell target and handoff synchronization
      let restoredMaterial = false;
      if (inHandoffZone) {
        e.setCellHandoff(handoffT);
        restoredMaterial = e.setMaterialTarget(1, false);
      } else if (inBioprocessStages) {
        e.setCellHandoff(1);
        restoredMaterial = e.setMaterialTarget(0, true);
      } else if (inMaterialWithBio) {
        e.setCellHandoff(0);
        restoredMaterial = e.setMaterialTarget(windowState.progress, false);
      } else {
        e.setCellHandoff(0);
        restoredMaterial = e.setMaterialTarget(windowState.progress, currentScrollY >= end);
      }
      e.tissue = tissueVal;

      if (cultEl) {
        cultEl.style.setProperty("--tissue", String(e.tissue));
        const phase = e.tissue < 0.33 ? "connect" : e.tissue < 0.7 ? "concentrate" : "become";
        if (cultEl.dataset.phase !== phase) cultEl.dataset.phase = phase;
      }

      if (currentScrollY + vh * 3 > materialTop) e.loadMaterial();

      e.visible = currentScrollY < milestonesTop && !covered;
      if (canvas.current) {
        if (inHandoffZone) {
          // Direct 3D Cell Superposition with smoothstep S-curve equal-power blending:
          // t = 0..0.35: Huner cell closes and rotates into place (canvasAlpha = 1)
          // t = 0.35..0.75: Both cells locked in place; Huner fades 1 -> 0 as Bioprocess fades 0 -> 1
          // t >= 0.75: Bioprocess spore takes over completely (canvasAlpha = 0)
          const rawCrossfade = clamp((handoffT - 0.35) / 0.40);
          const easeCrossfade = rawCrossfade * rawCrossfade * (3 - 2 * rawCrossfade);
          const canvasAlpha = 1 - easeCrossfade;
          canvas.current.style.opacity = String(canvasAlpha);
          canvas.current.style.transform = "translateY(0px)";
        } else if (inMaterialWithBio) {
          // Never slide or fade the cell while reading Section 05 prior to Section 06
          canvas.current.style.opacity = !e.visible ? "0" : "1";
          canvas.current.style.transform = "translateY(0px)";
        } else if (inBioprocessStages) {
          canvas.current.style.opacity = "0";
        } else {
          canvas.current.style.opacity = !e.visible ? "0" : String(windowState.opacity);
          canvas.current.style.transform = `translateY(${windowState.offset}px)`;
        }
        canvas.current.dataset.chapter = chapters[e.stage] ?? "arrival";
      }

      if (e.visible && (e.paused || e.materialTarget === 0 || restoredMaterial || inHandoffZone)) e.render();

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
    void document.fonts.ready.then(() => { if (!disposed) stage(); });
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
