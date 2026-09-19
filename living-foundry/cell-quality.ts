/** Cell pixels are independent of the much smaller biological simulation grid. */
export function cellRenderSize(width: number, height: number, dpr: number, coarse: boolean, degraded = false) {
  const maxPixels = (coarse || width <= 600 ? 1_800_000 : 4_200_000) * (degraded ? .5 : 1);
  const ratio = Math.min(Math.max(1, dpr), 2, 3840 / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));
  return { width: Math.max(1, Math.floor(width * ratio)), height: Math.max(1, Math.floor(height * ratio)), ratio };
}
