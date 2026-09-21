import type { GrowthField } from "./field";

/** Irreversible local deposition downstream of the existing delayed morphology field.
 * Artistic maturation rates, not measured cell biology. No camera/input API exists here.
 */
const neighborhood=[ [0,0],[-2,0],[2,0],[0,-2],[0,2] ] as const;
export class CellMaturation {
  readonly values: Float32Array;
  seconds = 0;
  constructor(readonly size: number) { this.values = new Float32Array(size * size); }
  step(dt: number, field: Pick<GrowthField,"morphology"|"size">) {
    if(field.size!==this.size)throw new Error("Cell and biological atlas dimensions must match");
    const seconds=Math.min(.08,Math.max(0,dt));
    if(!seconds)return;
    const n=this.size;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const k=y*n+x;
      // Local neighborhood supports developing tissue between reaction-diffusion colonies.
      let signal=0;
      for(const [dx,dy] of neighborhood){
        signal+=field.morphology[Math.max(0,Math.min(n-1,y+dy))*n+(x+dx+n)%n];
      }
      signal/=5;
      const competence=.72+.28*Math.sin(x*.37+y*.21)**2;
      const rate=(.0005+.055*Math.min(1,signal*5))*competence;
      this.values[k]=1-(1-this.values[k])*Math.exp(-rate*seconds);
    }
    this.seconds+=seconds;
  }
  writeTexture(bytes: Uint8Array) {
    for(let k=0;k<this.values.length;k++)bytes[k*4+3]=Math.round(this.values[k]*255);
  }
  summary(){
    let min=1,max=0,sum=0,count=0;
    for(let y=Math.floor(this.size*.49);y<this.size*.74;y++)for(let x=Math.floor(this.size*.59);x<this.size*.82;x++){
      const value=this.values[y*this.size+x];min=Math.min(min,value);max=Math.max(max,value);sum+=value;count++;
    }
    return {seconds:+this.seconds.toFixed(3),min,max,mean:sum/count};
  }
}
