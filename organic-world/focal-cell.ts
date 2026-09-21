import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { seededRandom } from "../living-foundry/seed";

export const CELL_CENTER = new THREE.Vector3(2.98, -.12, -6.02);
const TAU = Math.PI * 2;
const cream = new THREE.Color("#F4F1E8"), olive = new THREE.Color("#4A6741"), dark = new THREE.Color("#22311D");
const tilt = -.24;
export function cellPoint(x: number, y: number, z: number) {
  // The oblique cut exposes the left wall and the volume behind it.
  return new THREE.Vector3(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z + x * .16).add(CELL_CENTER);
}
function oval(a: number, r: number, z: number, maturity = 0) {
  const warp = 1 + .052 * Math.sin(a * 3 + .4) + .028 * Math.sin(a * 5 - .8);
  const localGrowth = maturity * (.025 + .020 * Math.sin(a * 3 + 1.2) + .014 * Math.cos(a * 5));
  return cellPoint(Math.cos(a) * r * (.40 + localGrowth) * warp, Math.sin(a) * r * (.58 + localGrowth * .7) * warp, z);
}

/** Every developmental endpoint belongs to this same indexed mesh. No state swaps. */
function attributes(g: THREE.BufferGeometry, mature: number[], tone: number, threshold = 0, span = 1, anchor = false) {
  const p = g.getAttribute("position"), colors: number[] = [], uv: number[] = [], growth: number[] = [], stages: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const local = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)).sub(CELL_CENTER);
    const color = dark.clone().lerp(olive, .75).lerp(cream, THREE.MathUtils.clamp(tone + .025 * Math.sin(local.y * 21 + local.x * 9), 0, 1));
    colors.push(color.r, color.g, color.b);
    uv.push(.7 + local.x * .19 + local.z * .018, .61 + local.y * .16);
    const mask = anchor ? Math.max(0, 1 - Math.max(0, local.length() - .62) * 3.2) : 1;
    local.normalize().multiplyScalar(mask);
    growth.push(local.x, local.y, local.z); stages.push(threshold, span);
  }
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setAttribute("growthDirection", new THREE.Float32BufferAttribute(growth, 3));
  g.setAttribute("development", new THREE.Float32BufferAttribute(stages, 2));
  g.setAttribute("edgeOpacity", new THREE.Float32BufferAttribute(new Float32Array(p.count).fill(1), 1));
  g.computeVertexNormals();
  // End-state normals let the shader light the deforming geometry, not the old surface.
  const target = new THREE.BufferGeometry(); target.setIndex(g.getIndex()!.clone());
  target.setAttribute("position", new THREE.Float32BufferAttribute(mature, 3)); target.computeVertexNormals();
  g.setAttribute("maturePosition", target.getAttribute("position"));
  g.setAttribute("matureNormal", target.getAttribute("normal")); target.dispose();
  g.computeBoundingSphere(); g.boundingSphere!.radius += .15;
  return g;
}
function patch(nu: number, nv: number, sample: (u: number, v: number, m: number) => THREE.Vector3, tone: number, threshold = 0, span = 1, anchor = false) {
  const positions: number[] = [], mature: number[] = [], indices: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    positions.push(...sample(i / nu, j / nv, 0).toArray()); mature.push(...sample(i / nu, j / nv, 1).toArray());
    if (i < nu && j < nv) { const k = j * (nu + 1) + i; indices.push(k, k + 1, k + nu + 1, k + 1, k + nu + 2, k + nu + 1); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); g.setIndex(indices);
  return attributes(g, mature, tone, threshold, span, anchor);
}

type XY = { x: number; y: number };
function clip(poly: XY[], nx: number, ny: number, limit: number) {
  const result: XY[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = a.x * nx + a.y * ny - limit, fb = b.x * nx + b.y * ny - limit;
    if (fa <= 0) result.push(a);
    if ((fa <= 0) !== (fb <= 0)) { const t = fa / (fa - fb); result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
  }
  return result;
}
/** Irregular Voronoi tissue: continuous outer joins, rounded holes, modeled pore throats. */
function poreLayer(seed: number, spacing: number, z: number, extent: number, tone: number, detail: number) {
  const random = seededRandom(seed), sites: XY[] = [], meshes: THREE.BufferGeometry[] = [];
  for (let row = -Math.ceil(1 / spacing); row <= Math.ceil(1 / spacing); row++) for (let col = -Math.ceil(1 / spacing); col <= Math.ceil(1 / spacing); col++) {
    const x = (col + (row % 2) * .5) * spacing + (random() - .5) * spacing * .55;
    const y = row * spacing * .87 + (random() - .5) * spacing * .50;
    if (x*x + y*y < .98) sites.push({ x, y });
  }
  const boundary = Array.from({ length: 64 }, (_, i) => ({ x: Math.cos(i / 64 * TAU) * .99, y: Math.sin(i / 64 * TAU) * .99 }));
  const surface = (x: number, y: number, depth: number, m: number) => {
    const r = Math.hypot(x, y), a = Math.atan2(y, x);
    const folds = .028 * Math.sin(x * 9 + y * 5) + .018 * Math.sin(y * 13 - x * 4);
    return oval(a, r * extent, z + depth + .043 * (1 - r*r) + folds + m * (.012 + .018 * Math.sin(x * 7 - y * 5)), m * .65);
  };
  sites.forEach((s, index) => {
    let poly = boundary;
    for (const other of sites) {
      const dx = other.x - s.x, dy = other.y - s.y;
      if (s === other || dx*dx + dy*dy > spacing * spacing * 9) continue;
      poly = clip(poly, dx, dy, (other.x**2 + other.y**2 - s.x**2 - s.y**2) / 2);
    }
    if (poly.length < 3) return;
    let radius = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      radius = Math.min(radius, Math.abs((b.x-a.x)*(a.y-s.y)-(a.x-s.x)*(b.y-a.y))/Math.hypot(b.x-a.x,b.y-a.y));
    }
    const opening = index % 9 === 0 ? .12 : .70 + random() * .10;
    const thickness = .011 + random() * .010;
    const segments=poly.length*Math.max(6,Math.round(8*detail));
    const mesh=patch(segments,16,(u,v,m)=>{
      const edge = Math.min(poly.length - 1, Math.floor(u * poly.length)), t = u * poly.length - edge;
      const a = poly[edge], b = poly[(edge+1)%poly.length];
      const ex = a.x + (b.x-a.x)*t - s.x, ey = a.y + (b.y-a.y)*t - s.y, angle = Math.atan2(ey,ex);
      const mouth = radius * Math.min(.94, opening + m * .22) * (1 + .07 * Math.sin(angle*3+index));
      const ring = Math.sin(v * Math.PI) ** .7; // outer front → mouth → outer back, real thickness
      const distance = THREE.MathUtils.lerp(Math.hypot(ex,ey), mouth, ring);
      const depth = -thickness * v * (1 + m * .45) + Math.sin(v*TAU) * .004;
      return surface(s.x+Math.cos(angle)*distance, s.y+Math.sin(angle)*distance, depth, m);
    },tone,index%9===0 ? .12 : 0,.82);
    // Neighbor patches share a tangent plane at the join; pore throats retain their normals.
    for(const mature of [false,true]){
      const normals=mesh.getAttribute(mature?"matureNormal":"normal");
      for(let j=0;j<=16;j++){
        const weight=j<=2 ? 1-j/3 : j>=14 ? 1-(16-j)/3 : 0;
        if(!weight)continue;
        for(let i=0;i<=segments;i++){
          const u=i/segments,edge=Math.min(poly.length-1,Math.floor(u*poly.length)),t=u*poly.length-edge;
          const a=poly[edge],b=poly[(edge+1)%poly.length],x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,m=Number(mature);
          const dx=surface(x+.001,y,0,m).sub(surface(x-.001,y,0,m));
          const dy=surface(x,y+.001,0,m).sub(surface(x,y-.001,0,m));
          const normal=dx.cross(dy).normalize().multiplyScalar(j>8?-1:1),k=j*(segments+1)+i;
          const blended=new THREE.Vector3().fromBufferAttribute(normals,k).lerp(normal,weight).normalize();
          normals.setXYZ(k,blended.x,blended.y,blended.z);
        }
      }
    }
    meshes.push(mesh);
  });
  return meshes;
}

export function focalCell(detail = 1) {
  const surfaces: THREE.BufferGeometry[] = [], fibers: THREE.BufferGeometry[] = [];
  const nu = Math.round(320 * detail), nv = Math.round(160 * detail);
  // A solid, deep ellipsoidal back and thick rolled cut wall. Curved lamellae are vertices.
  surfaces.push(patch(nu, nv, (u, v, m) => {
    const a = u * TAU, lat = .88 + v * (Math.PI - .88);
    const primary = (.5 + .5*Math.sin(lat * 108 + Math.sin(a*4)*1.5))**3;
    const secondary = (.5 + .5*Math.sin(lat * 216 + a*3))**5;
    const r = Math.sin(lat) * (1 + .015*primary + m*.011*secondary + .026*Math.sin(a*6+lat*3));
    return oval(a, r, Math.cos(lat)*(.45 + m*.034) + .018*Math.sin(a*3)*Math.sin(lat), m);
  }, .57));
  // The lip connects both faces across a broad wall, not a zero-thickness ring.
  surfaces.push(patch(nu, 48, (u,v,m) => {
    const a=u*TAU, r=.70+v*.17, ridge=(.5+.5*Math.sin(v*TAU*10+a*.7))**3;
    return oval(a,r,.20+.050*Math.sin(v*Math.PI)-v*.028+.012*ridge + .022*Math.sin(a*3) + m*(.022+.025*Math.sin(a*2+1)**2),m);
  },.70));
  // Continuous inner side wall sinks into a dense body; it cannot read as an empty tube.
  surfaces.push(patch(nu,64,(u,v,m)=>{
    const a=u*TAU,r=.71-v*.13,fold=.009*Math.sin(v*72+a*2);
    return oval(a,r,.20-v*.36+fold+.023*Math.sin(a*3)*(1-v)+m*.018*Math.cos(a*4),m*.7);
  },.31));
  surfaces.push(patch(nu,72,(u,v,m)=>{
    const a=u*TAU,r=v*.70;
    return oval(a,r,-.20+.065*(1-v*v)+.024*Math.sin(a*7+v*23)*v +m*(.025+.020*Math.sin(a*4+v*13)),m*.5);
  },.07));
  // Convoluted lamellar folds fill the deep mass beneath the porous outer tissue.
  for(let layer=0;layer<7;layer++){
    surfaces.push(patch(Math.round(120*detail),40,(u,v,m)=>{
      const x=(u-.5)*1.30,y=(layer-3)*.17+.045*Math.sin(x*7+layer*.7)+(v-.5)*.20;
      const r=Math.min(.71,Math.hypot(x,y)),a=Math.atan2(y,x);
      const fold=.042*Math.sin(v*Math.PI)+.012*Math.sin(v*TAU*5+x*5);
      return oval(a,r,-.14+fold+.018*Math.sin(x*8+layer)+m*(.018+.007*Math.sin(v*TAU*10+x*3)),m*.4);
    },.13+layer*.007,.02,.94));
  }
  surfaces.push(...poreLayer(1701,.15,-.115,.68,.06,detail));
  surfaces.push(...poreLayer(1907,.18,-.035,.73,.14,detail));
  surfaces.push(...poreLayer(2221,.21,.065,.77,.25,detail));

  const random=seededRandom(7719);
  const tube=(points:THREE.Vector3[],radius:number,tone:number,develop=false,anchor=false)=>{
    const path=new THREE.CatmullRomCurve3(points), n=20;
    const frames=path.computeFrenetFrames(n,false);
    const g=patch(n,6,(u,v,m)=>{
      const stage=develop ? .025 + m*.975 : 1;
      const t=develop ? u*stage : u, p=path.getPoint(t);
      const i=Math.min(n,Math.round(t*n)),r=radius*(develop ? .16+m*.84 : 1+m*.30)*(.18+.82*Math.sin(u*Math.PI)**.35);
      return p.addScaledVector(frames.normals[i],Math.cos(v*TAU)*r).addScaledVector(frames.binormals[i],Math.sin(v*TAU)*r);
    },tone,develop ? .06+random()*.20 : 0,develop ? .64 : 1,anchor);
    fibers.push(g);
  };
  // Three-dimensional branching tissue spans multiple depths; denser beneath the face.
  for(let i=0;i<Math.round(290*detail);i++){
    const a=random()*TAU,r=Math.sqrt(random())*.67,z=-.14+random()*.16;
    const direction=random()*TAU,span=.07+random()*.20;
    const points=Array.from({length:6},(_,j)=>{
      const t=j/5,x=Math.cos(a)*r+Math.cos(direction)*span*t,y=Math.sin(a)*r+Math.sin(direction)*span*t;
      return oval(Math.atan2(y,x),Math.min(.73,Math.hypot(x,y)),z+Math.sin(t*Math.PI)*.036+t*.035);
    });
    tube(points,.0018+random()*.0020,.30+random()*.12,i%3===0);
    if(i%4===0)tube([points[2],points[3].clone().add(new THREE.Vector3(.008,-.012,.03)),points[4].clone().add(new THREE.Vector3(.027,-.023,.055))],.0015,.55,true);
  }
  // Small, deeply seated biological folds add local occluding mass as they mature.
  for(let i=0;i<44;i++){
    const a=random()*TAU,r=Math.sqrt(random())*.61,c=oval(a,r,-.10+random()*.12),size=.017+random()*.026;
    surfaces.push(patch(24,14,(u,v,m)=>{
      const angle=u*TAU,lat=v*Math.PI,rr=size*(1+m*.60),ripple=1+.10*Math.sin(angle*5+lat*7);
      return c.clone().add(new THREE.Vector3(Math.cos(angle)*Math.sin(lat)*rr*ripple,Math.sin(angle)*Math.sin(lat)*rr*1.4,Math.cos(lat)*rr*.8+m*.025));
    },.22+random()*.12,.04,.9));
  }
  // Broad embedded folds cradle the cell. Tissue ends stay fixed at the throat.
  for(let i=0;i<7;i++){
    const a=1.0+i*.67;
    surfaces.push(patch(48,32,(u,v,m)=>{
      const angle=a+(u-.5)*(.24+v*.25),start=oval(angle,.94,.10,m);
      const end=new THREE.Vector3(2.80+Math.cos(angle)*.89,-.23+Math.sin(angle)*1.02,-5.82-i*.10);
      const p=start.lerp(end,v);p.z-=Math.sin(v*Math.PI)*(.06+m*.018)+.006*Math.sin(u*60+v*22)*Math.sin(v*Math.PI);return p;
    },.46,0,1,true));
  }
  for(let i=0;i<64;i++){
    const a=i*2.39996,start=oval(a,.99,.1),end=new THREE.Vector3(2.82+Math.cos(a)*.89,-.22+Math.sin(a)*1.02,-5.72-random()*.8);
    const points=Array.from({length:8},(_,j)=>{const t=j/7,p=start.clone().lerp(end,t);p.z-=Math.sin(t*Math.PI)*.08;return p;});
    tube(points,.0018+random()*.0022,.57,i%3===0,true);
  }
  const merge=(parts:THREE.BufferGeometry[])=>{const g=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());g.computeBoundingSphere();g.boundingSphere!.radius+=.18;return g;};
  return {body:merge(surfaces),fibers:merge(fibers)};
}
