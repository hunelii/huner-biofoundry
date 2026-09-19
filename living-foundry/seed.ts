/** Repeatable seed, independent of viewport and input. Values are visual model parameters, not laboratory measurements. */
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function seedField(width: number, height: number, seed = 2718) {
  const data = new Float32Array(width * height * 4);
  const random = seededRandom(seed);
  const aspect = width / height;
  const colonies = Array.from({ length: 12 }, () => ({
    x: 0.698 + ((random() - 0.5) * 0.052) / aspect,
    y: 0.61 + (random() - 0.5) * 0.049,
    r: 0.003 + random() * 0.005,
  }));
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let inside = false;
      for (const c of colonies)
        if (Math.hypot((x / width - c.x) * aspect, y / height - c.y) < c.r)
          inside = true;
      data[i] = inside ? 0.48 : 1;
      data[i + 1] = inside ? 0.28 + random() * 0.1 : 0;
      data[i + 3] = 1;
    }
  return data;
}
