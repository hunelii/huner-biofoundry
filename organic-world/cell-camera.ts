import * as THREE from "three";
import { poseAt } from "./camera";

/** Retain the approved entry through B, then ease onto a physical cell approach. */
const terminal = new THREE.CatmullRomCurve3([
  poseAt(.34,1.6).position, new THREE.Vector3(2.74,-.26,-4.13), new THREE.Vector3(2.91,-.19,-5.20),
],false,"centripetal");
const look = new THREE.CatmullRomCurve3([
  poseAt(.34,1.6).target, new THREE.Vector3(2.98,-.12,-6.02), new THREE.Vector3(3.13,-.06,-5.94),
],false,"centripetal");
export function cellPoseAt(progress:number,aspect:number){
  const base=poseAt(progress,aspect);
  if(progress<=.34)return base;
  const t=THREE.MathUtils.clamp((progress-.34)/.66,0,1),blend=THREE.MathUtils.smoothstep(progress,.34,.60);
  base.position.lerp(terminal.getPoint(t),blend);base.target.lerp(look.getPoint(t),blend);
  return base;
}

export const cellReviewViews = {
  distant: { position:[2.70,-.27,-2.65], target:[2.98,-.12,-6.02] },
  medium: { position:[3.05,.01,-4.12], target:[2.98,-.12,-6.02] },
  close: { position:[2.91,-.19,-5.20], target:[2.98,-.12,-5.98] },
  wall: { position:[3.33,-.01,-5.44], target:[3.23,-.07,-5.88] },
  interior: { position:[2.94,-.10,-5.52], target:[2.99,-.12,-6.02] },
} as const;
export type CellReviewView=keyof typeof cellReviewViews;
