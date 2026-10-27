"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

export const VisualMotionContext = createContext(false);

/** Scroll is an emphasis cue, never the only way to read the explanation. */
export function useVisualProgress(onStep?: (step: number) => void, steps = 1, stopped = false) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useContext(VisualMotionContext);
  const callback = useRef(onStep);
  useEffect(() => { callback.current = onStep; }, [onStep]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, visible = false, lastStep = -1;
    const draw = () => {
      frame = 0;
      if (!visible || paused || stopped || media.matches || document.hidden) return;
      const box = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .78 - box.top) / Math.max(1, box.height)));
      element.style.setProperty("--visual-progress", progress.toFixed(4));
      const step = Math.min(steps - 1, Math.floor(progress * steps));
      if (step !== lastStep) { lastStep = step; callback.current?.(step); }
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };
    const preference = () => {
      element.dataset.motion = media.matches || paused || stopped ? "still" : "scroll";
      if (media.matches) element.style.setProperty("--visual-progress", "1");
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(element);
    preference();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    media.addEventListener("change", preference);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", preference);
    };
  }, [paused, stopped, steps]);
  return ref;
}

export function ScrollDrawing({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useVisualProgress();
  return <div ref={ref} className={`scroll-drawing ${className}`}>{children}</div>;
}
