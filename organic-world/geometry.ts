import * as THREE from "three";
import { seededRandom } from "../living-foundry/seed";

const TAU = Math.PI * 2;
export const formationCenter = new THREE.Vector3(2.4, .15, 0);

function growthDirections(g:THREE.BufferGeometry,center?:[number,number]){
  if(!g.getAttribute("edgeOpacity"))g.setAttribute("edgeOpacity",new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute("position").count).fill(1),1));
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

const smooth=(a:number,b:number,x:number)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

/** Shared surface parameterization keeps the terrain, throat and fiber attachments continuous. */
function surfacePoint(u:number,v:number,aperture=true){
  const a=u*TAU,q=v*2.6,r=(aperture?1.14:.025)+v*9;
  const near=Math.exp(-Math.pow(q/1.2,3));
  const warp=a+.16*Math.sin(a*3+q*5)*Math.sin(Math.min(1,q)*Math.PI)*near;
  const lobe=1+(.13*Math.sin(a*3+.7)+.07*Math.sin(a*7+q*4))*near;
  const phase=v*72+Math.sin(a*3+q*4)*1.3*near+Math.sin(a*7-q*3)*.33*near+(1-near)*(Math.sin(a*3+v*5)*4+Math.sin(a*5-v*9)*2);
  const ridge=(.5+.5*Math.sin(phase*TAU))**3;
  const rim=1.15*Math.exp(-(((q-.13)/.14)**2));
  const throat=aperture?-2.1*Math.exp(-((q/.065)**2)):0;
  const left=(.5-.5*Math.cos(a));
  const macro=(Math.sin(a*3+q*9)*(.36+.6*left)+Math.sin(a*5-q*5)*.22)*Math.sin(Math.min(1,q)*Math.PI)*near;
  const terrain=.10*Math.sin(a*2+q*5)*Math.sin(q*3)*Math.exp(-q*.5)*smooth(.4,1,q);
  const roll=Math.exp(-(((q-.52)/.24)**2))*left;
  const rolledRadius=r-.78*Math.sin((q-.44)*10)*roll;
  const lifted=roll*(.9+.35*Math.sin(a*2+.5));
  return {point:new THREE.Vector3(
    formationCenter.x+Math.cos(warp)*rolledRadius*(.88+.20*smooth(.5,1.4,q))*lobe+v*.18,
    formationCenter.y+Math.sin(warp)*rolledRadius*(1.35-.4*smooth(0,1.4,q))*lobe,
    throat+rim+macro+terrain+lifted+ridge*(.010+.025*near)-.23*smooth(.3,1.8,q)),ridge};
}

/** The raised aperture is continuous with a much larger, gradually flattening terrain. */
export function lamellarSheet(layer:number,aperture:boolean,detail=1){
  const nu=Math.round(384*detail),nv=Math.round(512*detail);
  const positions:number[]=[],uv:number[]=[],indices:number[]=[],colors:number[]=[],opacity:number[]=[];
  const paper=new THREE.Color("#F4F1E8"),green=new THREE.Color("#4A6741");
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
    const u=i/nu,v=j/nv,{point,ridge}=surfacePoint(u,v,aperture);
    positions.push(point.x,point.y,point.z+layer*.04);uv.push(u,.15+v*.75);
    const tone=THREE.MathUtils.clamp(.13+.87*smooth(.12,.59,v)+.06*ridge,0,1);
    const color=green.clone().lerp(paper,tone);colors.push(color.r,color.g,color.b);
    opacity.push(1-smooth(.35,.8,v/(1+.11*Math.sin(u*TAU*3)+.05*Math.sin(u*TAU*7))));
    if(i<nu&&j<nv){const k=j*(nu+1)+i;indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  g.setAttribute("edgeOpacity",new THREE.Float32BufferAttribute(opacity,1));
  g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();growthDirections(g);return g;
}

function porousField(seed:number,count:number){
  const random=seededRandom(seed);
  const holes=Array.from({length:count},()=>{
    const large=random()>.85;
    return {u:random(),v:.20+random()*.78,ru:large?.022+random()*.026:.011+random()*.013,rv:large?.075+random()*.10:.030+random()*.034};
  });
  return (u:number,v:number)=>{
    let field=-1;
    for(const h of holes){
      let du=Math.abs(u-h.u);du=Math.min(du,1-du);
      if(du>h.ru*1.2||Math.abs(v-h.v)>h.rv*1.2)continue;
      const d=1-du*du/(h.ru*h.ru)-(v-h.v)**2/(h.rv*h.rv);
      field=Math.max(field,d);
    }
    return field;
  };
}

/** A small cell-like opening, made of layered membrane geometry in the same scene. */
export function chamber(secondary = false, detail = 1, deep = false) {
  const nu = Math.round(448 * detail), nv = Math.round(160 * detail);
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], colors: number[] = [], pores:number[]=[];
  const green = new THREE.Color("#4A6741"), paper = new THREE.Color("#F4F1E8");
  const length = deep ? 6.6 : 1.4;
  const centerX = secondary ? 1.96 : 2.72, centerY = secondary ? .53 : -.32;
  const poreField=porousField(secondary?327:745,110);
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv, a = u * TAU;
    const radius = secondary ? .34 : .64 + (deep ? .30 * Math.sin(v * Math.PI) : 0);
    const fold = (.020+.035*smooth(0,.25,v))*Math.sin(a*5+v*14)+(.008+.018*smooth(0,.25,v))*Math.sin(a*11-v*9);
    const lip = .12 * Math.exp(-((v / .06) ** 2));
    const lamella = .012 * Math.sin(a * 32 + Math.sin(v * 11) * 2 + v * 48) * Math.min(1, v * 25);
    const r = radius + fold + lip + lamella;
    positions.push(centerX + Math.cos(a) * r + v * .15, centerY + Math.sin(a) * r * 1.18 + Math.sin(v * 3) * .09, -2.15 - v * length + .10 * Math.cos(a * 3) * (1 - v));
    uv.push(u, .28 + v * .6);
    const color = green.clone().lerp(paper, .12 + .25 * Math.max(0, 1 - v * 4) + .06 * Math.sin(a * 5)).lerp(new THREE.Color("#22311D"),smooth(.3,1,v)*.62);
    colors.push(color.r,color.g,color.b);
    pores.push(deep&&v>.14&&v<.91?poreField(u,v):-1);
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
    const smallRadius=.76+.020*Math.sin(a*5)+.008*Math.sin(a*11);
    const start = new THREE.Vector3(2.72 + Math.cos(a) * smallRadius, -.32 + Math.sin(a) * smallRadius*1.18, -2.15+.1*Math.cos(a*3));
    const end=surfacePoint(b/TAU,0).point;
    const points = Array.from({length:9},(_,j) => {
      const t=j/8, v=start.clone().lerp(end,t);
      v.z -= Math.sin(t*Math.PI)*(.12 + .1*Math.sin(i)); return v;
    });
    make(points,.0018 + .0022*(.5+.5*Math.sin(i)));
    if(i%2===0){
      const join=points[4],branchEnd=surfacePoint((b+.18*Math.sin(i+1))/TAU,.025).point;
      const branch=Array.from({length:9},(_,j)=>{const t=j/8,p=join.clone().lerp(branchEnd,t);p.z-=Math.sin(t*Math.PI)*.065;return p;});
      make(branch,.0012);
    }
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
export function innerMembrane(depth:number,phase:number,scale=1,cx=2.87,cy=-.2) {
  const nu=256, nv=96, vertices:number[]=[], uvs:number[]=[], colors:number[]=[], indices:number[]=[], pores:number[]=[];
  const color=new THREE.Color("#4A6741").lerp(new THREE.Color("#F4F1E8"),.30).lerp(new THREE.Color("#22311D"),smooth(-4,-9,depth)*.65);
  const poreField=porousField(917+Math.floor(phase*83),110);
  for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){
    const u=i/nu,v=j/nv,a=u*TAU;
    const r=.30+v*.68+.036*Math.sin(a*3+phase)+.014*Math.sin(a*7+v*8);
    const ridges=.012*Math.sin(v*94+a*3+phase)*Math.sin(v*Math.PI);
    vertices.push(cx+Math.cos(a)*r*scale,cy+Math.sin(a)*r*1.2*scale,depth+(Math.sin(v*Math.PI)*.20+.065*Math.sin(a*4+phase)+ridges)*scale);
    uvs.push(u,.45+v*.3);
    colors.push(color.r,color.g,color.b);
    pores.push(v>.20?poreField(u,v):-1);
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

/** A concave back wall gives the same chamber a physical end and soft olive depth. */
export function terminalBasin(){
  const nu=160,nv=56,points:number[]=[],uv:number[]=[],colors:number[]=[],indices:number[]=[];
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
    const u=i/nu,v=j/nv,a=u*TAU,r=v*.97;
    points.push(2.88+Math.cos(a)*r,-.18+Math.sin(a)*r*1.2,-9.8+v*v*.7+.02*Math.sin(v*70+a*4));
    uv.push(u,.4+v*.4);
    const color=new THREE.Color("#22311D").lerp(new THREE.Color("#4A6741"),.20+v*.25);
    colors.push(color.r,color.g,color.b);
    if(i<nu&&j<nv){const k=j*(nu+1)+i;indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(points,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();growthDirections(g);return g;
}
