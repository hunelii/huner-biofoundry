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
  const [introOpacity, setIntroOpacity] = useState(1);
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
      { rootMargin: "180% 0px" }
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
        // Handshake: bioprocess is ready to receive handoff & scroll progress
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

        // Handoff window: first 12% of the sticky section
        const handoffRatio = 0.12;

        if (rawProgress < handoffRatio) {
          const t = Math.max(0, Math.min(1, rawProgress / handoffRatio));
          const finale = cellFinale(t);

          // Update greenish-gold veil
          setVeilOpacity(finale.veil);
          // Intro card fades out during handoff
          setIntroOpacity(Math.max(0, 1 - t * 2.2));
          // Station 1 during handoff
          setActiveStation(1);

          // Post handoff to iframe
          postToIframe({ type: "huner:handoff", t });
        } else {
          // Beyond handoff: stations journey
          setVeilOpacity(0);
          setIntroOpacity(0);

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

    const handoffRatio = 0.12;
    const journeyRatio = 1 - handoffRatio;
    const targetP = handoffRatio + ((stationNum - 1) / 8) * journeyRatio + 0.01;
    const targetY = stageTop + targetP * scrollDistance;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  const currentStation = STATIONS[activeStation - 1] ?? STATIONS[0];
  const embedUrl = `${source}${source.includes("?") ? "&" : "?"}embed=1`;

  return (
    <section id={id} ref={stageRef} className="bioprocess-stage" aria-labelledby={`${id}-title`}>
      <div className="bioprocess-sticky">
        {/* Greenish-Gold Bioluminescent Veil (bridges cell closing and hero spore appearance) */}
        <div
          className="bioprocess-glow-veil"
          style={{ opacity: veilOpacity }}
          aria-hidden="true"
        />

        {/* Bioprocess 3D WebGL iframe */}
        {isWarmedUp ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="Interactive 3D model of fungal bioprocess facility, from spore isolation to harvest"
            className="bioprocess-iframe"
            allow="fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="bioprocess-placeholder" aria-hidden="true" />
        )}

        {/* Minimal HUD: Station details & 8-Station timeline tracker */}
        <div className="bioprocess-hud" aria-live="polite">
          <div className="bioprocess-hud-header">
            <div className="bioprocess-hud-tagline">
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

          {/* 8-Station Interactive Timeline Tracker */}
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

        {/* Floating intro card at the start of the section */}
        <div
          className="bioprocess-intro-card"
          style={{
            opacity: introOpacity,
            pointerEvents: introOpacity > 0.05 ? "auto" : "none",
            transform: `translateY(${(1 - introOpacity) * -24}px)`,
          }}
        >
          <span className="eyebrow">06 / FROM CELL TO CULTURE</span>
          <h3>One cell.<br />A whole process.</h3>
          <p>
            The sealed cell enters the biofoundry. Scroll to advance through each stage
            of cultivation, from spore isolation to bioreactor harvest.
          </p>
          <div className="bioprocess-scroll-hint">
            <span>SCROLL TO ADVANCE PROCESS</span> <span aria-hidden="true">↓</span>
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
