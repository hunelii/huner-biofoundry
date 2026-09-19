import * as THREE from "three";

export const stops = [0, .34, .69, 1] as const;
const positions = [
  new THREE.Vector3(0, 1.4, 17.6),
  new THREE.Vector3(2.1, .8, 8.4),
  new THREE.Vector3(2.65, -.31, 1.1),
  new THREE.Vector3(2.76, -.26, -4.4),
];
const targets = [
  new THREE.Vector3(-.7, .1, -.4),
  new THREE.Vector3(2.4, -.05, -2),
  new THREE.Vector3(2.72, -.34, -3.7),
  new THREE.Vector3(2.9, -.12, -7.5),
];
const path = new THREE.CatmullRomCurve3(positions, false, "centripetal");
const look = new THREE.CatmullRomCurve3(targets, false, "centripetal");

/** One continuous reversible path; no replacement model, scale tween or cut. */
export function poseAt(progress: number, aspect: number) {
  const p = Math.max(0, Math.min(1, progress));
  const position = path.getPoint(p);
  const target = look.getPoint(p);
  // Keep the same world visible on a narrow review viewport.
  if (aspect < .8) position.z += (1 - p) ** 3 * 8;
  return { position, target };
}
