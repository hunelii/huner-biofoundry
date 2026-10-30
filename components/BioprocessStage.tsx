"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { cellFinale } from "@/living-foundry/material-transition";

/** Live Bioprocess 3D deployment. Embedded from its standalone published address,
 * so every 3D model update to that repository is automatically reflected here. */
const DEFAULT_SOURCE = "https://hunelii.github.io/bioprocess-modeling/";
const source = process.env.NEXT_PUBLIC_BIOPROCESS_URL || DEFAULT_SOURCE;

interface StationInfo {
  id: number;
  tag: string;
  title: string;
  tr: string;
  desc: string;
}

const STATIONS: StationInfo[] = [
  { id: 1, tag: "01", title: "Spore Isolation", tr: "Spor İzolasyonu", desc: "Single cell selection and illustrative microscopic spore preparation." },
  { id: 2, tag: "02", title: "Inoculation & Seed", tr: "Aşılama & Ön Kültür", desc: "Transfer of verified fungal culture into nutrient pre-culture media." },
  { id: 3, tag: "03", title: "Bioreactor Cultivation", tr: "Biyoreaktör Fermantasyonu", desc: "Stirred vessel with automated pH, dissolved oxygen and temperature control." },
  { id: 4, tag: "04", title: "Nutrient Feed Dynamics", tr: "Besin Besleme", desc: "Fed-batch substrate addition sustaining metabolic activity without overflow." },
  { id: 5, tag: "05", title: "Mycelial Expansion", tr: "Miselyal Büyüme", desc: "Dense hyphal branching forming cohesive biological structural biomass." },
  { id: 6, tag: "06", title: "Process Analytics", tr: "Analitik Örnekleme", desc: "Real-time biomass density, broth viscosity and metabolite profiling." },
  { id: 7, tag: "07", title: "Separation & Filtration", tr: "Ayrıştırma", desc: "Downstream solid-liquid separation and gentle biomass washing." },
  { id: 8, tag: "08", title: "Harvest & Evaluation", tr: "Hasat & Gözlem", desc: "Final characterization of purified mycelial yield and macro-structure." },
];

export default function BioprocessStage({ id = "bioprocess" }: { id?: string }) {
  const stageRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isWarmedUp, setIsWarmedUp] = useState(false);
  const [veilOpacity, setVeilOpacity] = useState(0);
  const [activeStation, setActiveStation] = useState(1);
  const [handoffT, setHandoffT] = useState(0);
  const [inStationJourney, setInStationJourney] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Pre-load / warm up iframe WebGL context when reader scrolls near the section
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isWarmedUp) return;
    if (!("IntersectionObserver" in window)) {
      setIsWarmedUp(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsWarmedUp(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200% 0px" }
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [isWarmedUp]);

  // Safe postMessage helper
  const postToIframe = useCallback((payload: Record<string, unknown>) => {
    const frame = iframeRef.current;
    if (!frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage(payload, "*");
    } catch {
      // Ignore cross-origin frame post errors
    }
  }, []);

  // Handle incoming messages from Bioprocess 3D iframe
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "bioprocess:ready") {
        postToIframe({ type: "huner:handshake", status: "ok" });
      } else if (data.type === "bioprocess:error") {
        setHasError(true);
      } else if (data.type === "bioprocess:stationChange" && typeof data.station === "number") {
        setActiveStation(Math.max(1, Math.min(8, data.station)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postToIframe]);

  // Main scroll driver for the sticky 850svh stage
  useEffect(() => {
    let ticking = false;
    let wasVisible = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const stage = stageRef.current;
        if (!stage) return;

        const currentY = window.scrollY;
        const vh = window.innerHeight;
        const stageTop = stage.offsetTop;
        const stageHeight = stage.offsetHeight;
        const scrollDistance = Math.max(1, stageHeight - vh);

        // Visibility window
        const isNear = currentY >= stageTop - vh * 0.8 && currentY <= stageTop + stageHeight + vh * 0.5;
        if (isNear !== wasVisible) {
          wasVisible = isNear;
          postToIframe({ type: "huner:visibility", visible: isNear });
        }
        if (!isNear) return;

        // Normalized scroll progress across the 850svh section [0, 1]
        const rawProgress = Math.max(0, Math.min(1, (currentY - stageTop) / scrollDistance));

        // Handoff window: first 16% of the sticky section (~136svh for cinematic, unhurried pacing)
        const handoffRatio = 0.16;

        if (rawProgress < handoffRatio) {
          const t = Math.max(0, Math.min(1, rawProgress / handoffRatio));
          const finale = cellFinale(t);

          setHandoffT(t);
          setInStationJourney(false);
          // Soft ambient optical bloom (never an opaque blocking veil)
          setVeilOpacity(finale.veil * 0.38);
          setActiveStation(1);

          // Phase-aligned handoff: Bioprocess spore stays at peak glow during superposition (t < 0.70),
          // then pulls back the camera (t = 0.70 -> 1.0) into Station 01
          const bioprocessT = t < 0.70 ? 0 : Math.max(0, Math.min(1, (t - 0.70) / 0.30));
          postToIframe({ type: "huner:handoff", t: bioprocessT });
        } else {
          // Beyond handoff: stations journey (8 stations)
          setHandoffT(1);
          setInStationJourney(true);
          setVeilOpacity(0);

          const stationP = Math.max(0, Math.min(1, (rawProgress - handoffRatio) / (1 - handoffRatio)));
          const stationIdx = Math.min(7, Math.floor(stationP * 8));
          const currentStationNum = stationIdx + 1;

          setActiveStation(currentStationNum);
          postToIframe({
            type: "huner:progress",
            p: stationP,
            station: currentStationNum,
          });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [postToIframe]);

  // Jump to specific station when user clicks on a timeline pill
  const jumpToStation = useCallback((stationNum: number) => {
    const stage = stageRef.current;
    if (!stage) return;

    const vh = window.innerHeight;
    const stageTop = stage.offsetTop;
    const stageHeight = stage.offsetHeight;
    const scrollDistance = Math.max(1, stageHeight - vh);

    const handoffRatio = 0.16;
    const journeyRatio = 1 - handoffRatio;
    const targetP = handoffRatio + ((stationNum - 1) / 8) * journeyRatio + 0.01;
    const targetY = stageTop + targetP * scrollDistance;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  const currentStation = STATIONS[activeStation - 1] ?? STATIONS[0];
  const embedUrl = `${source}${source.includes("?") ? "&" : "?"}embed=1`;

  return (
    <section
      id={id}
      ref={stageRef}
      className="bioprocess-stage"
      data-station-mode={inStationJourney}
      aria-labelledby={`${id}-title`}
    >
      <div className="bioprocess-sticky">
        {/* Soft bioluminescent bloom radiating from the cell (non-occluding) */}
        <div
          className="bioprocess-glow-veil"
          style={{ opacity: veilOpacity }}
          aria-hidden="true"
        />

        {/* Bioprocess 3D WebGL iframe (superimposes directly on Huner's cell) */}
        {isWarmedUp ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="Interactive 3D model of fungal bioprocess facility, from spore isolation to harvest"
            className="bioprocess-iframe"
            allow="fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              opacity: inStationJourney
                ? 1
                : (() => {
                    const raw = Math.max(0, Math.min(1, (handoffT - 0.35) / 0.35));
                    return raw * raw * (3 - 2 * raw);
                  })(),
              pointerEvents: inStationJourney ? "auto" : "none",
            }}
          />
        ) : (
          <div className="bioprocess-placeholder" aria-hidden="true" />
        )}

        {/* Phase A: Handoff Narrative Banner (visible ONLY during cell closing & glow) */}
        <div
          className="bioprocess-handoff-banner"
          style={{
            opacity: inStationJourney ? 0 : Math.max(0, 1 - handoffT * 2.2),
            pointerEvents: !inStationJourney && handoffT < 0.35 ? "auto" : "none",
            transform: `translateY(${-handoffT * 18}px)`,
          }}
        >
          <span className="eyebrow">06 / FROM CELL TO CULTURE</span>
          <h2 className="bioprocess-handoff-title">One cell.<br />A whole process.</h2>
          <p className="bioprocess-handoff-subtitle">
            The sealed cell enters the biofoundry. Scroll to advance through each stage of cultivation.
          </p>
        </div>

        {/* Phase B: Station HUD (fades in smoothly ONLY when Stations 01-08 begin) */}
        <div
          className="bioprocess-hud"
          aria-live="polite"
          style={{
            opacity: inStationJourney ? 1 : 0,
            pointerEvents: inStationJourney ? "auto" : "none",
            transition: "opacity 320ms ease",
          }}
        >
          {/* Top Bar: Station details & standalone link, well clear of the page navbar */}
          <div className="bioprocess-hud-header">
            <div className="bioprocess-hud-meta">
              <span className="bioprocess-eyebrow">06 / FROM CELL TO CULTURE</span>
              <h2 id={`${id}-title`} className="bioprocess-station-title">
                <span className="station-num">{currentStation.tag}</span> {currentStation.title}
              </h2>
              <p className="bioprocess-station-desc">{currentStation.desc}</p>
            </div>
            <div className="bioprocess-hud-actions">
              <a
                href={source}
                target="_blank"
                rel="noreferrer"
                className="bioprocess-standalone-link"
                title="Open full interactive Bioprocess 3D scene in a new tab"
              >
                Open Standalone ↗
              </a>
            </div>
          </div>

          {/* Bottom Dock: 8-Station Interactive Timeline Tracker */}
          <div className="bioprocess-timeline" role="navigation" aria-label="Bioprocess Stations">
            {STATIONS.map((station, idx) => {
              const num = idx + 1;
              const isCurrent = num === activeStation;
              const isCompleted = num < activeStation;
              return (
                <button
                  key={station.id}
                  type="button"
                  className={`timeline-step ${isCurrent ? "current" : isCompleted ? "completed" : ""}`}
                  onClick={() => jumpToStation(num)}
                  title={`Station ${station.tag}: ${station.title}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className="step-bar" />
                  <span className="step-label">{station.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Graceful fallback message if WebGL or network fails */}
        {hasError && (
          <div className="bioprocess-error-card" role="alert">
            <p>Could not load the interactive 3D bioprocess scene directly.</p>
            <a href={source} target="_blank" rel="noreferrer">
              Open Bioprocess 3D in separate window ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
