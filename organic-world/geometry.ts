import * as THREE from "three";

const TAU = Math.PI * 2;
export const formationCenter = new THREE.Vector3(2.4, .15, 0);

function growthDirections(g:THREE.BufferGeometry,center?:[number,number]){
  const p=g.getAttribute("position"),values:number[]=[];
  for(let i=0;i<p.count;i++){
    if(center){const x=p.getX(i)-center[0],y=p.getY(i)-center[1],d=Math.hypot(x,y)||1;values.push(x/d,y/d,0);}
    else values.push(0,0,1);
  }
  g.setAttribute("growthDirection",new THREE.Float32BufferAttribute(values,3));
}

/** Clip triangles against a continuous pore field, interpolating boundary vertices.
 * This avoids the square staircase produced by dropping complete grid cells.
 */
function clipPores(positions:number[],uv:number[],colors:number[],indices:number[],values:number[]) {
  const result:number[]=[], edges=new Map<string,number>();
  const crossing=(a:number,b:number)=>{
    const key=Math.min(a,b)+":"+Math.max(a,b), existing=edges.get(key);
    if(existing!==undefined)return existing;
    const t=values[a]/(values[a]-values[b]),index=positions.length/3;
    for(let c=0;c<3;c++){positions.push(positions[a*3+c]+(positions[b*3+c]-positions[a*3+c])*t);colors.push(colors[a*3+c]+(colors[b*3+c]-colors[a*3+c])*t);}
    for(let c=0;c<2;c++)uv.push(uv[a*2+c]+(uv[b*2+c]-uv[a*2+c])*t);
    edges.set(key,index);return index;
  };
  for(let i=0;i<indices.length;i+=3){
    const tri=indices.slice(i,i+3),polygon:number[]=[];
    for(let j=0;j<3;j++){
      const a=tri[j],b=tri[(j+1)%3],insideA=values[a]<=0,insideB=values[b]<=0;
      if(insideA)polygon.push(a);
      if(insideA!==insideB)polygon.push(crossing(a,b));
    }
    for(let j=1;j+1<polygon.length;j++)result.push(polygon[0],polygon[j],polygon[j+1]);
  }
  return result;
}

/** An annular sheet with a flared throat. Ridges are vertices, not a normal map. */
export function lamellarSheet(layer: number, aperture: boolean, detail = 1) {
  const nu = Math.round(384 * detail), nv = Math.round(256 * detail);
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], colors: number[] = [];
  const paper = new THREE.Color("#F4F1E8"), green = new THREE.Color("#4A6741");
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv, a = u * TAU;
    const throat = aperture ? 1.14 : .025;
    const r = throat + v * (3.65 + .32 * Math.sin(a - 1)) + layer * .028;
    const warp = a + .13 * Math.sin(a * 3 + v * 5) * Math.sin(v * Math.PI);
    const lobe = 1 + .13 * Math.sin(a * 3 + .7) + .07 * Math.sin(a * 7 + v * 4);
    const ridgePhase = v * 48 + Math.sin(a * 3 + v * 4) * 1.3 + Math.sin(a * 7 - v * 3) * .33;
    const ridge = (.5 + .5 * Math.sin(ridgePhase * TAU)) ** 3;
    const rim = 1.15 * Math.exp(-(((v - .13) / .14) ** 2));
    const throatDepth = aperture ? -2.1 * Math.exp(-((v / .065) ** 2)) : 0;
    const macro = (Math.sin(a * 3 + v * 9) * .63 + Math.sin(a * 5 - v * 5) * .23) * Math.sin(v * Math.PI);
    const z = throatDepth + rim + macro + ridge * .048 + layer * .044 - v * .24;
    positions.push(
      formationCenter.x + Math.cos(warp) * r * .88 * lobe + v * .18,
      formationCenter.y + Math.sin(warp) * r * (1.35 - .28 * v) * lobe,
      z,
    );
    uv.push(u, v);
    const tone = .10 + .53 * v ** 1.6 + .12 * ridge;
    const color = green.clone().lerp(paper, tone);
    colors.push(color.r, color.g, color.b);
    if (i < nu && j < nv) {
      const k = j * (nu + 1) + i;
      indices.push(k, k + 1, k + nu + 1, k + 1, k + nu + 2, k + nu + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  growthDirections(geometry);
  return geometry;
}

/** A small cell-like opening, made of layered membrane geometry in the same scene. */
export function chamber(secondary = false, detail = 1, deep = false) {
  const nu = Math.round(448 * detail), nv = Math.round(160 * detail);
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], colors: number[] = [], pores:number[]=[];
  const green = new THREE.Color("#4A6741"), paper = new THREE.Color("#F4F1E8");
  const length = deep ? 6.6 : 1.4;
  const centerX = secondary ? 1.96 : 2.72, centerY = secondary ? .53 : -.32;
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv, a = u * TAU;
    const radius = secondary ? .34 : .64 + (deep ? .30 * Math.sin(v * Math.PI) : 0);
    const fold = .048 * Math.sin(a * 5 + v * 14) + .025 * Math.sin(a * 11 - v * 9);
    const lip = .12 * Math.exp(-((v / .06) ** 2));
    const lamella = .012 * Math.sin(a * 32 + Math.sin(v * 11) * 2 + v * 48) * Math.min(1, v * 25);
    const r = radius + fold + lip + lamella;
    positions.push(centerX + Math.cos(a) * r + v * .15, centerY + Math.sin(a) * r * 1.18 + Math.sin(v * 3) * .09, -2.15 - v * length + .10 * Math.cos(a * 3) * (1 - v));
    uv.push(u, .28 + v * .6);
    const color = green.clone().lerp(paper, .12 + .18 * Math.max(0, 1 - v * 4) + .06 * Math.sin(a * 5));
    colors.push(color.r,color.g,color.b);
    pores.push(deep && v>.22 && v<.88 ? Math.sin(a*13+v*6)*Math.sin(v*31+Math.sin(a*7))-.86 : -1);
    if (i < nu && j < nv) {
      const k = j * (nu + 1) + i;
      indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);
    }
  }
  const clipped=clipPores(positions,uv,colors,indices,pores);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(clipped); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  growthDirections(geometry,[centerX,centerY]);
  return geometry;
}

export function fiberBridges(detail = 1) {
  const geometries: THREE.BufferGeometry[] = [];
  const make = (points: THREE.Vector3[], radius: number) => {
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, radius, 5, false);
    const pos = g.getAttribute("position"), color: number[] = [];
    const tone = new THREE.Color("#4A6741").lerp(new THREE.Color("#F4F1E8"), .56);
    for (let i=0;i<pos.count;i++) color.push(tone.r,tone.g,tone.b);
    g.setAttribute("color",new THREE.Float32BufferAttribute(color,3));
    growthDirections(g,[2.72,-.32]);
    geometries.push(g);
  };
  // Tensile connections attach the inner chamber to its surrounding throat.
  for (let i = 0; i < Math.round(58 * detail); i++) {
    const a = i * 2.39996, b = a + .25 * Math.sin(i * 4.1);
    const smallRadius=.76+.048*Math.sin(a*5)+.025*Math.sin(a*11);
    const start = new THREE.Vector3(2.72 + Math.cos(a) * smallRadius, -.32 + Math.sin(a) * smallRadius*1.18, -2.15+.1*Math.cos(a*3));
    const lobe=1+.13*Math.sin(b*3+.7)+.07*Math.sin(b*7);
    const end = new THREE.Vector3(2.4 + Math.cos(b) * 1.14*.88*lobe, .15 + Math.sin(b) * 1.14*1.35*lobe, -2.1+1.15*Math.exp(-((.13/.14)**2)));
    const points = Array.from({length:9},(_,j) => {
      const t=j/8, v=start.clone().lerp(end,t);
      v.z -= Math.sin(t*Math.PI)*(.12 + .1*Math.sin(i)); return v;
    });
    make(points,.0025 + .0018*(.5+.5*Math.sin(i)));
  }
  // Perimeter bridges join different wall depths while keeping a clear camera passage.
  for (let i = 0; i < Math.round(74 * detail); i++) {
    const a = i * 2.39996, v0=.12+(i%13)/13*.65;
    const points = Array.from({length:12},(_,j) => {
      const t = j / 11, angle = a + t * (.55 + .15 * Math.sin(i)),v=v0+t*.11;
      const r=.64+.30*Math.sin(v*Math.PI)+.048*Math.sin(angle*5+v*14)+.025*Math.sin(angle*11-v*9)-Math.sin(t*Math.PI)*.09;
      return new THREE.Vector3(2.72 + Math.cos(angle)*r+v*.15, -.32 + Math.sin(angle)*r*1.18+Math.sin(v*3)*.09, -2.15-v*6.6+.10*Math.cos(angle*3)*(1-v));
    });
    make(points,.002 + .002 * (i % 3) / 3);
  }
  return geometries;
}

/** Nested transverse membranes remain real perforated surfaces deep inside the chamber. */
export function innerMembrane(depth: number, phase: number) {
  const nu=256, nv=96, vertices:number[]=[], uvs:number[]=[], colors:number[]=[], indices:number[]=[], pores:number[]=[];
  const color=new THREE.Color("#4A6741").lerp(new THREE.Color("#F4F1E8"),.28);
  for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){
    const u=i/nu,v=j/nv,a=u*TAU;
    const r=.28+v*.68+.055*Math.sin(a*5+phase)+.025*Math.sin(a*11+v*8);
    const ridges=.012*Math.sin(v*94+a*3+phase)*Math.sin(v*Math.PI);
    vertices.push(2.87+Math.cos(a)*r,-.2+Math.sin(a)*r*1.2,depth+Math.sin(v*Math.PI)*.20+.065*Math.sin(a*4+phase)+ridges);
    uvs.push(u,.45+v*.3);
    colors.push(color.r,color.g,color.b);
    pores.push(v>.24?Math.sin(a*13+v*7+phase)*Math.cos(v*20+a*3)-.71:-1);
    if(i<nu&&j<nv) {
      const k=j*(nu+1)+i;
      indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);
    }
  }
  const clipped=clipPores(vertices,uvs,colors,indices,pores);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(clipped);geometry.computeVertexNormals();geometry.computeBoundingSphere();
  growthDirections(geometry);
  return geometry;
}
