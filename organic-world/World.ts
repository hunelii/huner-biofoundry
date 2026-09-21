import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lamellarSheet, chamber, fiberBridges, innerMembrane, terminalBasin } from "./geometry";
import { livingMaterial, type ReadingComposition } from "./material";
import { cellPoseAt, cellReviewViews, type CellReviewView } from "./cell-camera";
import { GrowthField } from "./field";
import { CellMaturation } from "./cell-growth";
import { focalCellMaterial } from "./cell-material";
import { focalCell, CELL_CENTER } from "./focal-cell";
import type { WorldPresentation } from "./journey";

export class OrganicWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private formation = new THREE.Group();
  private camera = new THREE.PerspectiveCamera(38, 1, .035, 90);
  private geometries: THREE.BufferGeometry[] = [];
  private material: THREE.MeshStandardMaterial;
  private fiberMaterial: THREE.MeshStandardMaterial;
  private cellMaterial: THREE.MeshStandardMaterial;
  private composition: ReadingComposition = { room: { value: 0 }, sweep: { value: 0 }, viewport: { value: new THREE.Vector2(1,1) } };
  private field = new GrowthField();
  private maturation = new CellMaturation(72);
  private bytes = new Uint8Array(72 * 72 * 4);
  private texture: THREE.DataTexture;
  private reviewMode = new URLSearchParams(location.search).get("review") === "cell";
  private reviewView: CellReviewView | null = null;
  private reviewParallax = 0;
  private progress = 0;
  private target = 0;
  private emergence = 1;
  private settle = 0;
  private presentationTarget: WorldPresentation = { progress: 0, emergence: 1, settle: 0, page: 0 };
  private frame = 0;
  private last = 0;
  private accumulated = 0;
  private frames = 0;
  private sampleStart = 0;
  private renderedFrames = 0;
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
  constructor(private canvas: HTMLCanvasElement, private options: { presentation?: () => WorldPresentation } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor("#F4F1E8");
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.debug.onShaderError = () => { this.stopped=true; this.onFailure?.(); };
    this.texture = new THREE.DataTexture(this.bytes,72,72,THREE.RGBAFormat);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.minFilter=this.texture.magFilter=THREE.LinearFilter;
    this.updateTexture();
    this.material = livingMaterial(this.texture,1,this.composition);
    this.fiberMaterial = livingMaterial(this.texture,.06,this.composition);
    this.cellMaterial = focalCellMaterial(this.texture,this.composition);
    this.scene.add(this.formation, new THREE.HemisphereLight("#F4F1E8", "#374F2F", 2));
    const key = new THREE.DirectionalLight("#F4F1E8", 2.4);
    key.position.set(-5, 7, 8); this.scene.add(key);
    const fill = new THREE.DirectionalLight("#F4F1E8", .6);
    fill.position.set(3, -2, 5); this.scene.add(fill);
    this.canvas.dataset.paused="false";
    this.presentationTarget = this.options.presentation?.() ?? this.presentationTarget;
    this.progress = this.target = this.presentationTarget.progress;
    this.emergence = this.presentationTarget.emergence; this.settle = this.presentationTarget.settle;
    this.build(); this.resize(); this.scroll();
    if(this.reviewMode){
      this.setPaused(true);this.reviewView="medium";this.canvas.dataset.cellReview="true";
      this.canvas.closest("main")?.setAttribute("data-cell-review", "true");
      addEventListener("huner:cell-review",this.reviewEvent);this.draw();
    }
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
    const cell = focalCell(this.quality);
    for (const [name, g] of Object.entries(cell)) {
      this.geometries.push(g);
      const mesh = new THREE.Mesh(g, this.cellMaterial); mesh.name = "focal-cell-" + name;
      this.formation.add(mesh);
    }
    this.canvas.dataset.cellCenter = CELL_CENTER.toArray().join(",");
    this.canvas.dataset.cellTriangles=String(Object.values(cell).reduce((sum,g)=>sum+(g.index?.count??0)/3,0));
  }
  private reviewEvent = (event: Event) => {
    if(!this.reviewMode)return;
    const detail=(event as CustomEvent<{view?:CellReviewView;progress?:number;parallax?:number;condition?:boolean;seconds?:number;running?:boolean}>).detail;
    if(detail.view && detail.view in cellReviewViews)this.reviewView=detail.view;
    if(typeof detail.progress==="number"){this.reviewView=null;this.progress=this.target=THREE.MathUtils.clamp(detail.progress,0,1);}
    if(typeof detail.parallax==="number")this.reviewParallax=THREE.MathUtils.clamp(detail.parallax,-.1,.1);
    if(detail.condition)this.field.addCondition(.7,.61);
    if(typeof detail.seconds==="number")for(let i=0;i<Math.round(THREE.MathUtils.clamp(detail.seconds,0,180)*30);i++)this.stepBiology(1/30);
    if(typeof detail.running==="boolean")this.setPaused(!detail.running);
    this.draw();
  };
  private updateTexture(){this.field.writeTexture(this.bytes);this.maturation.writeTexture(this.bytes);this.texture.needsUpdate=true;}
  private stepBiology(dt:number){this.field.step(dt,5);this.maturation.step(dt,this.field);this.updateTexture();}
  resize = () => {
    const pixelBudget=this.quality<1 ? 1_050_000 : 2_200_000;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality<1?1.2:1.5,Math.sqrt(pixelBudget/(innerWidth*innerHeight))));
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.renderer.getDrawingBufferSize(this.composition.viewport.value);
    this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.draw();this.canvas.dataset.ready="true";
    this.canvas.dataset.quality=String(this.quality);
  };
  scroll = () => {
    this.presentationTarget = this.options.presentation?.() ?? { progress: Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))), emergence: 1, settle: 0, page: 0 };
    this.target=this.presentationTarget.progress;
    if(this.reduced.matches){this.progress=this.target;this.emergence=this.presentationTarget.emergence;this.settle=this.presentationTarget.settle;this.draw();}
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
    const dt=Math.min(.1,(now-(this.last||now))/1000);this.last=now;
    if(document.hidden||this.reduced.matches)return;
    const start=performance.now();
    const moving=Math.abs(this.target-this.progress)+Math.abs(this.emergence-this.presentationTarget.emergence)+Math.abs(this.settle-this.presentationTarget.settle)>.00005;
    if(moving){
      const smoothing=1-Math.exp(-dt*7);
      this.progress+=(this.target-this.progress)*smoothing;
      this.emergence+=(this.presentationTarget.emergence-this.emergence)*smoothing;
      this.settle+=(this.presentationTarget.settle-this.settle)*smoothing;
    }
    // Biology has its own clock; camera motion never suspends it.
    if(!this.paused){
      this.accumulated+=dt;
      // Fixed biology steps: display frame rate and scroll speed cannot change maturation.
      const interval=1/30;
      while(this.accumulated>=interval){this.stepBiology(interval);this.accumulated-=interval;}
    }
    if(!this.paused||moving)this.draw();
    this.cpuTotal+=performance.now()-start;this.frames++;
    if(!this.sampleStart)this.sampleStart=now;
    if(now-this.sampleStart>2000){
      const fps=this.frames*1000/(now-this.sampleStart);
      const cellSample=Math.floor(.61*this.field.size)*this.field.size+Math.floor(.7*this.field.size);
      this.canvas.dataset.metrics=JSON.stringify({fps:Math.round(this.renderedFrames*1000/(now-this.sampleStart)),displayFps:Math.round(fps),cpuMs:+(this.cpuTotal/this.frames).toFixed(2),triangles:this.renderer.info.render.triangles,drawCalls:this.renderer.info.render.calls,pixels:this.canvas.width*this.canvas.height,field:this.field.summary(),maturation:this.maturation.summary(),cell:{environment:this.field.delayed[cellSample],biology:this.field.b[cellSample],morphology:this.field.morphology[cellSample]}});
      this.slowWindows=fps<27 ? this.slowWindows+1 : 0;
      if(this.slowWindows>=2&&this.quality>.5){this.quality=.5;this.resize();this.slowWindows=0;}
      this.frames=0;this.renderedFrames=0;this.cpuTotal=0;this.sampleStart=now;
    }
  };
  private draw() {
    const pose=cellPoseAt(this.progress,this.camera.aspect);
    if(this.reviewMode&&this.reviewView){
      const view=cellReviewViews[this.reviewView];pose.position.fromArray(view.position);pose.target.fromArray(view.target);
      pose.position.x+=this.reviewParallax;
    }
    if(this.options.presentation){
      // The approved prelude and entry remain; the final spline physically reaches the cell.
      pose.position.z+=50*(1-this.emergence);
      const offset=this.progress*.14+Math.sin(this.progress*Math.PI)*.16+this.settle*.12+(1-this.emergence)*.24;
      this.camera.setViewOffset(innerWidth,innerHeight,-innerWidth*offset,innerHeight*.12*(1-this.emergence),innerWidth,innerHeight);
      this.camera.zoom=1-this.settle*.20;
      this.camera.updateProjectionMatrix();
      this.composition.room.value=this.emergence;
      this.composition.sweep.value=1-THREE.MathUtils.smoothstep(this.progress,.34,.69);
      this.canvas.style.opacity=String((.1+this.emergence*.9)*(1-this.settle*.83));
    }
    this.camera.position.copy(pose.position);this.camera.lookAt(pose.target);this.camera.updateMatrixWorld();
    this.renderer.render(this.scene,this.camera);this.renderedFrames++;
    this.canvas.dataset.progress=this.progress.toFixed(4);
    this.canvas.dataset.camera=pose.position.toArray().map(x=>x.toFixed(3)).join(",");
    this.canvas.dataset.cameraTarget=pose.target.toArray().map(x=>x.toFixed(3)).join(",");
    this.canvas.dataset.cellIdentity=this.formation.children.filter(o=>o.name.startsWith("focal-cell")).map(o=>o.uuid).join(",");
    this.canvas.dataset.settle=this.settle.toFixed(4);
    this.canvas.dataset.maturation=JSON.stringify(this.maturation.summary());
    this.canvas.dataset.field=JSON.stringify(this.field.summary());
    this.onProgress?.(this.progress);
  }
  dispose() {
    this.stopped=true;cancelAnimationFrame(this.frame);
    removeEventListener("huner:cell-review",this.reviewEvent);
    removeEventListener("resize",this.resize);removeEventListener("scroll",this.scroll);
    removeEventListener("pointermove",this.pointerMove);removeEventListener("pointerdown",this.pointerDown);
    removeEventListener("pointerup",this.pointerUp);removeEventListener("pointercancel",this.pointerCancel);
    this.reduced.removeEventListener("change",this.motionChange);this.canvas.removeEventListener("webglcontextlost",this.contextLost);
    this.geometries.forEach(g=>g.dispose());this.material.dispose();this.fiberMaterial.dispose();this.cellMaterial.dispose();this.texture.dispose();this.renderer.dispose();
  }
}
