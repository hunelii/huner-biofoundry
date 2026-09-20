export type JourneyAnchors = { life: number; conditions: number; foundry: number; cultivation: number; material: number; applications: number; end: number };
export type WorldPresentation = { progress: number; emergence: number; settle: number; page: number };
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

/** Existing content positions pace the same approved A–D camera curve. */
export function reviewStops(a: JourneyAnchors, height: number) {
  return [a.foundry + height * .35, a.cultivation + height * .40, a.material + height * .85, a.material + height * 2.45];
}
export function journeyAt(y: number, height: number, anchors: JourneyAnchors): WorldPresentation {
  const points = reviewStops(anchors, height), values = [0, .34, .69, 1];
  let progress = y >= points[3] ? 1 : 0;
  for (let i = 0; i < 3; i++) if (y >= points[i] && y < points[i + 1]) {
    // Linear pacing with the renderer's existing damped camera interpolation.
    progress = values[i] + (values[i + 1] - values[i]) * (y - points[i]) / (points[i + 1] - points[i]);
  }
  return {
    progress,
    emergence: ease((y + height * .1) / Math.max(1, points[0])),
    settle: ease((y - points[3] - height * .25) / Math.max(height, anchors.applications - points[3] - height * .25)),
    page: clamp(y / Math.max(1, anchors.end - height)),
  };
}
