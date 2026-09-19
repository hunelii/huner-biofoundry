export type Quality = "spatial" | "tactile" | "narrative";
export function selectQuality(
  width: number,
  coarse: boolean,
): { name: Quality; grid: number; steps: number; fps: number; dpr: number } {
  if (width <= 600)
    return { name: "narrative", grid: 256, steps: 3, fps: 24, dpr: 1 };
  if (coarse)
    return { name: "tactile", grid: 384, steps: 4, fps: 30, dpr: 1.25 };
  return { name: "spatial", grid: 512, steps: 5, fps: 30, dpr: 1.5 };
}
export class PerformanceBudget {
  private count = 0;
  private slow = 0;
  degraded = false;
  observe(ms: number) {
    this.count++;
    if (ms > 48) this.slow++;
    if (this.count < 120) return "keep";
    const ratio = this.slow / this.count;
    this.count = 0;
    this.slow = 0;
    if (ratio < 0.35) return "keep";
    if (this.degraded) return "fallback";
    this.degraded = true;
    return "reduce";
  }
}
