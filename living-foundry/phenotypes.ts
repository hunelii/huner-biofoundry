// Artistic reaction-diffusion regimes, not scientific production parameters.
export function phenotype(stage: number) {
  if (stage >= 1 && stage <= 4) return { feed: 0.035, kill: 0.06, diffusion: 0.48 };
  if (stage === 7) return { feed: 0.042, kill: 0.062, diffusion: 0.48 }; // accumulation
  if (stage === 8) return { feed: 0.028, kill: 0.058, diffusion: 0.62 }; // diffusion
  if (stage === 9) return { feed: 0.035, kill: 0.06, diffusion: 0.4 }; // structure
  return { feed: 0.0367, kill: 0.0649, diffusion: 0.48 };
}
export function approach(current: number, target: number, seconds: number) {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, seconds) / 2.5));
}
