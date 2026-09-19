import { seededRandom } from "../living-foundry/seed";

/** Same environment-memory → Gray–Scott response as the Living Foundry.
 * Independent CPU atlas lets geometry and deterministic tests sample the same field.
 * Parameters are artistic, not measurements of a Huner organism.
 */
export class GrowthField {
  readonly size: number;
  raw: Float32Array;
  delayed: Float32Array;
  a: Float32Array;
  b: Float32Array;
  morphology: Float32Array;
  private nextA: Float32Array;
  private nextB: Float32Array;
  private neighbors: Int32Array;
  ticks = 0;
  constructor(size = 72, seed = 2718) {
    this.size = size;
    const n = size * size;
    this.raw = new Float32Array(n); this.delayed = new Float32Array(n);
    this.a = new Float32Array(n); this.b = new Float32Array(n);
    this.nextA = new Float32Array(n); this.nextB = new Float32Array(n);
    this.morphology = new Float32Array(n); this.neighbors = new Int32Array(n * 4);
    const random=seededRandom(seed);
    // The atlas is much smaller than the screen-space GPU field: seed in texel-sized
    // patches so the initial colony survives diffusion at all supported resolutions.
    const colonies=[{x:.7,y:.61,r:.095},...Array.from({length:10},()=>({x:random(),y:.12+random()*.76,r:.06+random()*.035}))];
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      const k=y*size+x;
      const inside=colonies.some(c=>Math.hypot(x/size-c.x,y/size-c.y)<c.r);
      this.a[k]=inside?.48:1; this.b[k]=inside?.34+random()*.04:0;
      this.neighbors.set([y*size+(x+size-1)%size,y*size+(x+1)%size,Math.max(0,y-1)*size+x,Math.min(size-1,y+1)*size+x],k*4);
    }
    for(let i=0;i<280;i++) this.biology();
    this.morphology.set(this.b);
  }
  /** Input changes raw conditions only. No biological or morphological injection. */
  addCondition(u: number, v: number, amount = .7) {
    const n=this.size;
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      let dx=Math.abs(x/n-u); dx=Math.min(dx,1-dx);
      const dy=y/n-v, weight=Math.exp(-(dx*dx+dy*dy)/.007);
      const k=y*n+x; this.raw[k]=Math.min(1,this.raw[k]+weight*amount);
    }
  }
  step(dt: number, substeps = 5) {
    const seconds=Math.min(.08,Math.max(0,dt));
    if(!seconds) return;
    const memory=1-Math.exp(-seconds/2.8), growth=1-Math.exp(-seconds/4.5);
    for(let k=0;k<this.raw.length;k++) {
      this.raw[k]*=Math.exp(-seconds/9);
      this.delayed[k]+=(this.raw[k]-this.delayed[k])*memory;
    }
    for(let j=0;j<substeps;j++) this.biology();
    for(let k=0;k<this.b.length;k++) this.morphology[k]+=(this.b[k]-this.morphology[k])*growth;
    this.ticks++;
  }
  private biology() {
    for(let k=0;k<this.a.length;k++){
      const n=k*4,l=this.neighbors[n],r=this.neighbors[n+1],d=this.neighbors[n+2],u=this.neighbors[n+3];
      const a=this.a[k],b=this.b[k],e=this.delayed[k];
      const lapA=(this.a[l]+this.a[r]+this.a[d]+this.a[u])*.25-a;
      const lapB=(this.b[l]+this.b[r]+this.b[d]+this.b[u])*.25-b;
      const feed=.0367+e*.007,kill=.0649-e*.009, reaction=a*b*b;
      this.nextA[k]=Math.max(0,Math.min(1,a+.85*(lapA*.9-reaction+feed*(1-a))));
      this.nextB[k]=Math.max(0,Math.min(1,b+.85*(lapB*.44+reaction-(feed+kill)*b)));
    }
    [this.a,this.nextA]=[this.nextA,this.a]; [this.b,this.nextB]=[this.nextB,this.b];
  }
  writeTexture(bytes: Uint8Array) {
    for(let i=0;i<this.b.length;i++){
      bytes[i*4]=Math.round(this.delayed[i]*255);
      bytes[i*4+1]=Math.round(this.b[i]*255);
      bytes[i*4+2]=Math.round(this.morphology[i]*255);
      bytes[i*4+3]=255;
    }
  }
  summary() {
    let biology=0,morphology=0,environment=0;
    for(let i=0;i<this.b.length;i++){ biology+=this.b[i];morphology+=this.morphology[i];environment+=this.delayed[i]; }
    return { ticks:this.ticks,biology,morphology,environment };
  }
}
