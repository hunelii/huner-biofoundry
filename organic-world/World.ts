import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lamellarSheet, chamber, fiberBridges, innerMembrane, terminalBasin } from "./geometry";
import { livingMaterial } from "./material";
import { poseAt } from "./camera";
import { GrowthField } from "./field";

export class OrganicWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private formation = new THREE.Group();
  private camera = new THREE.PerspectiveCamera(38, 1, .035, 90);
  private geometries: THREE.BufferGeometry[] = [];
  private material: THREE.MeshStandardMaterial;
  private fiberMaterial: THREE.MeshStandardMaterial;
  private field = new GrowthField();
  private bytes = new Uint8Array(72 * 72 * 4);
  private texture: THREE.DataTexture;
  private progress = 0;
  private target = 0;
  private frame = 0;
  private last = 0;
  private accumulated = 0;
  private frames = 0;
  private sampleStart = 0;
  private cpuTotal = 0;
  private slowWindows = 0;
  private quality = innerWidth < 600 || matchMedia("(pointer:coarse)").matches ? .65 : 1;
  private reduced = matchMedia("(prefers-reduced-motion: reduce)");
  private paused = false;
  private stopped = false;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private lastInput = 0;
  private down: { x:number; y:number; at:number } | null = null;
  onProgress?: (progress: number) => void;
  onCondition?: () => void;
  onFailure?: () => void;
  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor("#F4F1E8");
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.debug.onShaderError = () => { this.stopped=true; this.onFailure?.(); };
    this.texture = new THREE.DataTexture(this.bytes,72,72,THREE.RGBAFormat);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.minFilter=this.texture.magFilter=THREE.LinearFilter;
    this.field.writeTexture(this.bytes);this.texture.needsUpdate=true;
    this.material = livingMaterial(this.texture);
    this.fiberMaterial = livingMaterial(this.texture,.06);
    this.scene.add(this.formation, new THREE.HemisphereLight("#F4F1E8", "#374F2F", 2));
    const key = new THREE.DirectionalLight("#F4F1E8", 2.4);
    key.position.set(-5, 7, 8); this.scene.add(key);
    const fill = new THREE.DirectionalLight("#F4F1E8", .6);
    fill.position.set(3, -2, 5); this.scene.add(fill);
    this.canvas.dataset.paused="false";
    this.build(); this.resize(); this.scroll();
    if(this.stopped){this.dispose();throw new Error("Organic World shader initialization failed");}
    addEventListener("resize", this.resize);
    addEventListener("scroll", this.scroll, { passive:true });
    addEventListener("pointermove", this.pointerMove, { passive:true });
    addEventListener("pointerdown", this.pointerDown, { passive:true });
    addEventListener("pointerup", this.pointerUp, { passive:true });
    addEventListener("pointercancel", this.pointerCancel, { passive:true });
    this.reduced.addEventListener("change",this.motionChange);
    canvas.addEventListener("webglcontextlost",this.contextLost);
    this.frame=requestAnimationFrame(this.tick);
  }
  private build() {
    this.formation.clear();this.geometries.forEach(g=>g.dispose());this.geometries=[];
    const geometries=[lamellarSheet(0,true,this.quality),chamber(false,this.quality,true),chamber(true,this.quality,true),innerMembrane(-2.7,.5,.62,2.72,-.32),...[-5.2,-6.1,-7.1,-8.3].map((z,i)=>innerMembrane(z,i*1.1)),terminalBasin()];
    for(const g of geometries){this.geometries.push(g);this.formation.add(new THREE.Mesh(g,this.material));}
    const fibers=fiberBridges(this.quality), merged=mergeGeometries(fibers);
    fibers.forEach(g=>g.dispose());
    if(merged){this.geometries.push(merged);this.formation.add(new THREE.Mesh(merged,this.fiberMaterial));}
  }
  resize = () => {
    const pixelBudget=this.quality<1 ? 1_050_000 : 2_200_000;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality<1?1.2:1.5,Math.sqrt(pixelBudget/(innerWidth*innerHeight))));
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.draw();this.canvas.dataset.ready="true";
    this.canvas.dataset.quality=String(this.quality);
  };
  scroll = () => {
    this.target=Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    if(this.reduced.matches){this.progress=this.target;this.draw();}
  };
  setPaused(value:boolean){this.paused=value;this.canvas.dataset.paused=String(value);}
  addCondition = () => { if(this.paused||this.reduced.matches||this.stopped)return;this.field.addCondition(.7,.61);this.onCondition?.(); };
  private applyPointer(x:number,y:number){
    if(this.paused||this.reduced.matches||this.stopped||performance.now()-this.lastInput<160)return;
    this.lastInput=performance.now();this.pointer.set(x/innerWidth*2-1,1-y/innerHeight*2);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hit=this.raycaster.intersectObjects(this.formation.children,false)[0];
    if(hit?.uv){this.field.addCondition(hit.uv.x,hit.uv.y,.18);this.onCondition?.();}
  }
  private pointerMove = (event:PointerEvent) => {
    if(event.target instanceof Element&&event.target.closest("button,nav,header,footer"))return;
    if(innerWidth>600&&(event.pointerType==="mouse"||this.down))this.applyPointer(event.clientX,event.clientY);
  };
  private pointerDown = (e:PointerEvent) => { this.down={x:e.clientX,y:e.clientY,at:performance.now()}; };
  private pointerUp = (e:PointerEvent) => {
    if(this.down&&Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)<12&&performance.now()-this.down.at<600 && !(e.target instanceof Element&&e.target.closest("button,nav,header,footer")))this.applyPointer(e.clientX,e.clientY);
    this.down=null;
  };
  private pointerCancel = () => {this.down=null;};
  private motionChange = () => {this.accumulated=0;this.progress=this.target;this.draw();};
  private contextLost = (event:Event) => {event.preventDefault();this.stopped=true;cancelAnimationFrame(this.frame);this.onFailure?.();};
  tick = (now:number) => {
    if(this.stopped)return;
    this.frame=requestAnimationFrame(this.tick);
    const dt=Math.min(.05,(now-(this.last||now))/1000);this.last=now;
    if(document.hidden||this.reduced.matches)return;
    const start=performance.now();
    const moving=Math.abs(this.target-this.progress)>.00005;
    if(moving)this.progress+=(this.target-this.progress)*(1-Math.exp(-dt*7));
    // Biology has its own clock; camera motion never suspends it.
    if(!this.paused){
      this.accumulated+=dt;
      const interval=this.quality<.6?1/20:1/30;
      if(this.accumulated>=interval){this.field.step(this.accumulated,this.quality<.6?4:5);this.accumulated=0;this.field.writeTexture(this.bytes);this.texture.needsUpdate=true;}
    }
    if(!this.paused||moving)this.draw();
    this.cpuTotal+=performance.now()-start;this.frames++;
    if(!this.sampleStart)this.sampleStart=now;
    if(now-this.sampleStart>2000){
      const fps=this.frames*1000/(now-this.sampleStart);
      this.canvas.dataset.metrics=JSON.stringify({fps:Math.round(fps),cpuMs:+(this.cpuTotal/this.frames).toFixed(2),triangles:this.renderer.info.render.triangles,drawCalls:this.renderer.info.render.calls,pixels:this.canvas.width*this.canvas.height,field:this.field.summary()});
      this.slowWindows=fps<27 ? this.slowWindows+1 : 0;
      if(this.slowWindows>=2&&this.quality>.5){this.quality=.5;this.build();this.resize();this.slowWindows=0;}
      this.frames=0;this.cpuTotal=0;this.sampleStart=now;
    }
  };
  private draw() {
    const pose=poseAt(this.progress,this.camera.aspect);
    this.camera.position.copy(pose.position);this.camera.lookAt(pose.target);this.camera.updateMatrixWorld();
    this.renderer.render(this.scene,this.camera);
    this.canvas.dataset.progress=this.progress.toFixed(4);
    this.canvas.dataset.camera=pose.position.toArray().map(x=>x.toFixed(3)).join(",");
    this.onProgress?.(this.progress);
  }
  dispose() {
    this.stopped=true;cancelAnimationFrame(this.frame);
    removeEventListener("resize",this.resize);removeEventListener("scroll",this.scroll);
    removeEventListener("pointermove",this.pointerMove);removeEventListener("pointerdown",this.pointerDown);
    removeEventListener("pointerup",this.pointerUp);removeEventListener("pointercancel",this.pointerCancel);
    this.reduced.removeEventListener("change",this.motionChange);this.canvas.removeEventListener("webglcontextlost",this.contextLost);
    this.geometries.forEach(g=>g.dispose());this.material.dispose();this.fiberMaterial.dispose();this.texture.dispose();this.renderer.dispose();
  }
}
