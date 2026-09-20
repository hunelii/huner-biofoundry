import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { seededRandom } from "../living-foundry/seed";

// The destination sits within the existing throat; the approved camera is unchanged.
export const CELL_CENTER = new THREE.Vector3(2.98, -.12, -6.02);
const TAU = Math.PI * 2;
const cream = new THREE.Color("#F4F1E8"), olive = new THREE.Color("#4A6741"), dark = new THREE.Color("#22311D");
const tilt = -.24;

function point(x: number, y: number, z: number) {
  return new THREE.Vector3(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z).add(CELL_CENTER);
}

/** Common atlas coordinates and deformation directions keep cell layers attached. */
function attributes(g: THREE.BufferGeometry, tone: number, anchor = false) {
  const p = g.getAttribute("position"), colors: number[] = [], uv: number[] = [], growth: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const local = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).sub(CELL_CENTER);
    const variation = .035 * Math.sin(local.y * 22 + local.x * 8);
    const color = dark.clone().lerp(olive, .8).lerp(cream, THREE.MathUtils.clamp(tone + variation, 0, 1));
    colors.push(color.r, color.g, color.b);
    // A compact footprint lands in the same seeded living colony as Add a condition.
    uv.push(.7 + local.x * .13, .61 + local.y * .12);
    const length = local.length();
    local.normalize().multiplyScalar(anchor ? Math.max(0, 1 - Math.max(0, length - .6) * 2.7) : 1);
    growth.push(local.x, local.y, local.z);
  }
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setAttribute("growthDirection", new THREE.Float32BufferAttribute(growth, 3));
  g.setAttribute("edgeOpacity", new THREE.Float32BufferAttribute(new Float32Array(p.count).fill(1), 1));
  g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}

/** Parametric tissue with interpolated pore boundaries rather than removed grid squares. */
function tissue(nu: number, nv: number, sample: (u: number, v: number) => THREE.Vector3, tone: number,
  pore?: (u: number, v: number) => number) {
  const positions: number[] = [], values: number[] = [], indices: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv;
    positions.push(...sample(u, v).toArray()); values.push(pore?.(u, v) ?? -1);
  }
  const crossings = new Map<string, number>();
  const edge = (a: number, b: number) => {
    const key = Math.min(a, b) + ":" + Math.max(a, b), cached = crossings.get(key);
    if (cached !== undefined) return cached;
    const t = values[a] / (values[a] - values[b]), index = positions.length / 3;
    for (let k = 0; k < 3; k++) positions.push(THREE.MathUtils.lerp(positions[a * 3 + k], positions[b * 3 + k], t));
    crossings.set(key, index); return index;
  };
  const triangle = (a: number, b: number, c: number) => {
    const tri = [a, b, c], clipped: number[] = [];
    for (let j = 0; j < 3; j++) {
      const x = tri[j], y = tri[(j + 1) % 3];
      if (values[x] <= 0) clipped.push(x);
      if ((values[x] <= 0) !== (values[y] <= 0)) clipped.push(edge(x, y));
    }
    for (let j = 1; j + 1 < clipped.length; j++) indices.push(clipped[0], clipped[j], clipped[j + 1]);
  };
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * (nu + 1) + i;
    triangle(k, k + 1, k + nu + 1); triangle(k + 1, k + nu + 2, k + nu + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); g.setIndex(indices);
  return attributes(g, tone);
}

function poreField(seed: number, count: number) {
  const random = seededRandom(seed);
  const holes = Array.from({ length: count }, () => ({
    u: random(), v: .08 + random() * .86,
    ru: .012 + random() ** 2 * .035, rv: .019 + random() ** 2 * .072,
  }));
  return (u: number, v: number) => {
    let f = -1;
    for (const h of holes) {
      const du = Math.min(Math.abs(u - h.u), 1 - Math.abs(u - h.u));
      f = Math.max(f, 1 - (du / h.ru) ** 2 - ((v - h.v) / h.rv) ** 2);
    }
    return f;
  };
}

// Cartesian pores keep a consistent tissue scale all the way to the center of the face.
function corePores(seed: number) {
  const random = seededRandom(seed);
  const pores = Array.from({ length: 520 }, () => {
    const a = random() * TAU, r = Math.sqrt(random()) * .97;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, rx: .022 + random() ** 2 * .035, ry: .025 + random() ** 2 * .050 };
  });
  return (u: number, v: number) => {
    const x = Math.cos(u * TAU) * v, y = Math.sin(u * TAU) * v;
    let f = -1;
    for (const p of pores) {
      if (Math.abs(x - p.x) > p.rx || Math.abs(y - p.y) > p.ry) continue;
      f = Math.max(f, 1 - ((x - p.x) / p.rx) ** 2 - ((y - p.y) / p.ry) ** 2);
    }
    return f;
  };
}

/** A compressed, open-faced oval: closed back, thick rolled wall, dense porous core. */
export function focalCell(detail = 1) {
  const surfaces: THREE.BufferGeometry[] = [], fibers: THREE.BufferGeometry[] = [];
  const nu = Math.round(256 * detail), nv = Math.round(112 * detail);
  const oval = (a: number, radius: number, z: number) => {
    const warp = 1 + .047 * Math.sin(a * 3 + .4) + .024 * Math.sin(a * 5 - .8);
    return point((Math.cos(a) * radius * .53 * warp + .022 * Math.sin(a * 2) * radius) * .70, Math.sin(a) * radius * .74 * warp * .70, z * .70);
  };
  // Eight closely nested lips are real geometry and reveal irregular wall thickness.
  for (let layer = 0; layer < 8; layer++) {
    surfaces.push(tissue(nu, 22, (u, v) => {
      const a = u * TAU, radius = .79 + layer * .024 + v * .039;
      const ripple = .0035 * Math.sin(a * 47 + layer * .7) + .005 * Math.sin(a * 5);
      return oval(a, radius, .25 + Math.sin(v * Math.PI) * .017 - layer * .015 + .025 * Math.sin(a * 3) + ripple);
    }, .49 + layer * .033));
  }
  // The wall wraps continuously behind the cut face; this is a body, not a hole.
  surfaces.push(tissue(nu, nv, (u, v) => {
    const a = u * TAU, lat = .99 + v * (Math.PI - .99);
    const ridge = .005 * (.5 + .5 * Math.sin(lat * 118 + Math.sin(a * 4) * 1.3)) ** 3;
    const radius = Math.sin(lat) * (1 + ridge + .017 * Math.sin(a * 7 + lat * 3));
    return oval(a, radius, Math.cos(lat) * .45 + .013 * Math.sin(a * 4) * Math.sin(lat));
  }, .53));
  // A dark, solid inner mass prevents the fenestrated tissue reading as empty space.
  surfaces.push(tissue(nu, 56, (u, v) => {
    const a = u * TAU, r = v * .77;
    return oval(a, r, .035 + .10 * (1 - v * v) + .012 * Math.sin(a * 5 + v * 15) * v);
  }, .07));
  for (let layer = 0; layer < 3; layer++) {
    const pore = corePores(1409 + layer * 81);
    surfaces.push(tissue(nu, 96, (u, v) => {
      const a = u * TAU, r = v * (.80 - layer * .025);
      return oval(a, r, .16 + layer * .029 + .042 * (1 - v * v) + .011 * Math.sin(a * 6 + v * 18 + layer) * v);
    }, .16 + layer * .095, (u, v) => v < .018 || v > .96 ? -1 : pore(u, v)));
  }
  const tube = (points: THREE.Vector3[], radius: number, tone: number, anchor = false) => {
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, radius, 5, false);
    fibers.push(attributes(g, tone, anchor));
  };
  const random = seededRandom(7719);
  // Fibers follow short local paths inside the tissue, with several branching junctions.
  for (let i = 0; i < Math.round(145 * detail); i++) {
    const a = random() * TAU, r = Math.sqrt(random()) * .64, direction = random() * TAU, span = .06 + random() * .16;
    const points = Array.from({ length: 6 }, (_, j) => {
      const t = j / 5, x = Math.cos(a) * r + Math.cos(direction) * span * t, y = Math.sin(a) * r + Math.sin(direction) * span * t;
      return oval(Math.atan2(y,x),Math.hypot(x,y),.25+Math.sin(t*Math.PI)*.012);
    });
    tube(points, .0011 + random() * .0014, .56);
    if(i%3===0){
      const end=points[3].clone().add(new THREE.Vector3(.016*Math.cos(direction+1),.028*Math.sin(direction+1),-.018));
      tube([points[3],points[3].clone().lerp(end,.5).add(new THREE.Vector3(0,0,.004)),end],.0009,.50);
    }
  }
  // Broad cradling webs plus tensile bridges grow out of the existing throat wall.
  for (let i = 0; i < 5; i++) {
    const a = 1.1 + i * .72;
    surfaces.push(tissue(38, 26, (u, v) => {
      const angle = a + (u - .5) * (.18 + v * .22);
      const start = oval(angle, 1, .12);
      const end = new THREE.Vector3(2.80 + Math.cos(angle) * .89, -.23 + Math.sin(angle) * 1.02, -5.75 - i * .12);
      const p = start.lerp(end, v); p.z -= Math.sin(v * Math.PI) * .09;
      return p;
    }, .46, poreField(825 + i, 17)));
  }
  for (let i = 0; i < Math.round(56 * detail); i++) {
    const a = i * 2.39996, start = oval(a, .99, .13);
    const end = new THREE.Vector3(2.82 + Math.cos(a) * .89, -.22 + Math.sin(a) * 1.02, -5.62 - random() * .8);
    const points = Array.from({ length: 7 }, (_, j) => {
      const t = j / 6, p = start.clone().lerp(end, t); p.z -= Math.sin(t * Math.PI) * .06; return p;
    });
    tube(points, .0016 + random() * .0018, .58, true);
  }
  const merge = (parts: THREE.BufferGeometry[]) => {
    const result = mergeGeometries(parts)!; parts.forEach(g => g.dispose()); return result;
  };
  return { body: merge(surfaces), fibers: merge(fibers) };
}
