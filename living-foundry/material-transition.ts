/** Native scroll progress, bounded for direct links, short screens and reverse scrolling. */
export function materialProgress(
  scroll: number,
  top: number,
  height: number,
  viewport: number,
) {
  return Math.max(
    0,
    Math.min(1, (scroll - top) / Math.max(1, height - viewport)),
  );
}

export function smoothRange(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

/** Frame-independent damping; long pauses never become catch-up animation. */
export function settleCellProgress(current: number, target: number, seconds: number) {
  const goal = Math.max(0, Math.min(1, target));
  const next = current + (goal - current) * (1 - Math.exp(-Math.max(0, Math.min(.05, seconds)) * 10));
  return Math.abs(next - goal) < .0002 ? goal : next;
}

export function cellJourney(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  return {
    approach: smoothRange(.02, .76, p),
    center: smoothRange(.02, .5, p),
    opening: smoothRange(.32, .67, p),
    inspect: smoothRange(.68, 1, p),
    heading: 1 - smoothRange(.03, .27, p),
  };
}

export function cellFinale(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  return {
    close: smoothRange(0, 0.3, t),
    glow: smoothRange(0.25, 0.85, t),
    handoff: smoothRange(0.65, 1, t),
    veil: smoothRange(0.25, 0.68, t) * (1 - smoothRange(0.72, 1, t)),
  };
}

