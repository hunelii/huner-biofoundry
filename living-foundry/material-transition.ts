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
  const release = smoothRange(.70, .98, p);
  return {
    approach: smoothRange(.02, .50, p) * (1 - release),
    center: smoothRange(.02, .38, p) * (1 - release),
    opening: smoothRange(.28, .52, p) * (1 - smoothRange(.70, .86, p)),
    inspect: smoothRange(.48, .58, p) * (1 - smoothRange(.64, .74, p)),
    heading: 1 - smoothRange(.03, .20, p),
    labels: smoothRange(.44, .57, p) * (1 - smoothRange(.64, .74, p)),
    release,
  };
}

/** The small oval sits at the lower right of the opening, above phone copy. */
export function cellOrigin(phone: boolean) {
  return { x: phone ? .67 : .78, y: phone ? .72 : .38 };
}
