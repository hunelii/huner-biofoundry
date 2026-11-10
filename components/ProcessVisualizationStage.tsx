"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { STAGES_DATA } from "./visualization/stages";
import { UnifiedDiagram } from "./visualization/UnifiedDiagram";
import "./visualization/visualization.css";

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

interface ProcessVisualizationStageProps {
  id?: string;
  mode?: "scroll" | "compact";
  initialStageIndex?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  continueHref?: string;
  continueLabel?: string;
}

export default function ProcessVisualizationStage({
  id = "approach-pipeline",
  mode = "scroll",
  initialStageIndex = 0,
  eyebrow = "05 / APPROACH · FROM MOLASSES TO TRUFFLE AROMA",
  title = "The 8-stage fermentation & aroma pathway.",
  subtitle = "Follow our research workflow from sugar-industry molasses characterization and pure Tuber melanosporum submerged fermentation to GC-MS volatile profiling and food ingredient formulation.",
  continueHref = "#applications",
  continueLabel = "Explore target food matrices ↓",
}: ProcessVisualizationStageProps) {
  const maxIndex = STAGES_DATA.length - 1;
  const sectionRef = useRef<HTMLElement>(null);

  const [continuousStage, setContinuousStage] = useState<number>(initialStageIndex);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(initialStageIndex);

  const targetStageRef = useRef<number>(initialStageIndex);
  const currentStageRef = useRef<number>(initialStageIndex);
  const activeIndexRef = useRef<number>(initialStageIndex);
  const rafIdRef = useRef<number | null>(null);
  const isProgrammaticRef = useRef<boolean>(false);
  const programmaticTimerRef = useRef<number | null>(null);

  const startAnimationLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const tick = () => {
      const target = targetStageRef.current;
      const current = currentStageRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.002) {
        const next = current + diff * 0.2;
        currentStageRef.current = next;
        setContinuousStage(next);

        const rounded = clamp(Math.round(next), 0, maxIndex);
        if (rounded !== activeIndexRef.current) {
          activeIndexRef.current = rounded;
          setActiveStageIndex(rounded);
        }
        rafIdRef.current = window.requestAnimationFrame(tick);
      } else {
        currentStageRef.current = target;
        setContinuousStage(target);
        const rounded = clamp(Math.round(target), 0, maxIndex);
        if (rounded !== activeIndexRef.current) {
          activeIndexRef.current = rounded;
          setActiveStageIndex(rounded);
        }
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  }, [maxIndex]);

  const scrollToStage = useCallback(
    (index: number) => {
      const clampedIdx = clamp(index, 0, maxIndex);
      targetStageRef.current = clampedIdx;
      startAnimationLoop();

      if (mode === "scroll" && sectionRef.current && typeof window !== "undefined") {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const scrollDist = Math.max(0, rect.height - window.innerHeight);

        if (scrollDist > 40) {
          isProgrammaticRef.current = true;
          if (programmaticTimerRef.current !== null) {
            window.clearTimeout(programmaticTimerRef.current);
          }

          const targetScrollY = sectionTop + (clampedIdx / maxIndex) * scrollDist;
          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth",
          });

          programmaticTimerRef.current = window.setTimeout(() => {
            isProgrammaticRef.current = false;
          }, 650);
        }
      }
    },
    [maxIndex, mode, startAnimationLoop]
  );

  const scrubToProgress = useCallback(
    (progress0to1: number) => {
      const clampedProgress = clamp(progress0to1, 0, 1);
      const targetStage = clampedProgress * maxIndex;
      targetStageRef.current = targetStage;
      startAnimationLoop();

      if (mode === "scroll" && sectionRef.current && typeof window !== "undefined") {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const scrollDist = Math.max(0, rect.height - window.innerHeight);

        if (scrollDist > 40) {
          isProgrammaticRef.current = true;
          if (programmaticTimerRef.current !== null) {
            window.clearTimeout(programmaticTimerRef.current);
          }
          window.scrollTo({
            top: sectionTop + clampedProgress * scrollDist,
            behavior: "auto",
          });
          programmaticTimerRef.current = window.setTimeout(() => {
            isProgrammaticRef.current = false;
          }, 120);
        }
      }
    },
    [maxIndex, mode, startAnimationLoop]
  );

  useEffect(() => {
    if (mode !== "scroll") return;

    const handleScroll = () => {
      if (isProgrammaticRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollDist = Math.max(1, rect.height - window.innerHeight);

      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const ratio = clamp(-rect.top / scrollDist, 0, 1);
        targetStageRef.current = ratio * maxIndex;
        startAnimationLoop();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [mode, maxIndex, startAnimationLoop]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  const currentStageData = STAGES_DATA[activeStageIndex] || STAGES_DATA[0];

  return (
    <section
      ref={sectionRef}
      id={id}
      className="huner-vis-section science-home"
      aria-labelledby={`${id}-title`}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Active stage: {currentStageData.numberString} {currentStageData.name}.{" "}
        {currentStageData.description}
      </div>

      <div className={`huner-vis-scroll-runway ${mode === "compact" ? "is-compact" : ""}`}>
        <div className="sticky-diagram-viewport">
          <div className="vis-section-header">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2 id={`${id}-title`}>{title}</h2>
            </div>
            <p className="vis-subtitle">{subtitle}</p>
          </div>

          <div className="diagram-stage-shell">
            <UnifiedDiagram
              stages={STAGES_DATA}
              activeStageIndex={activeStageIndex}
              continuousStage={continuousStage}
              onSelectStage={scrollToStage}
              onScrubProgress={scrubToProgress}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "14px",
                fontSize: "12px",
              }}
            >
              <a
                className="text-link"
                href={`https://hunelii.github.io/visualization/#${currentStageData.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open standalone visualization ({currentStageData.numberString} {currentStageData.name}) ↗
              </a>
              {continueHref && (
                <a className="text-link" href={continueHref}>
                  {continueLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
