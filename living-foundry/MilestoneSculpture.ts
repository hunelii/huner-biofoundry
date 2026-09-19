import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** Five sculptural stations share one continuous growth path. */
export class MilestoneSculpture {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  private stations = [-5.4, -2.7, 0, 2.7, 5.4].map((x, i) => new THREE.Vector3(x, [0,.32,.1,.55,.28][i], [.6,-.5,.2,-.7,.1][i]));
  private groups: THREE.Group[] = [];
  private halos: THREE.Mesh[] = [];
  private environment: THREE.WebGLRenderTarget;
  private key: THREE.DirectionalLight;
  private target = new THREE.Vector3();
  private aim = new THREE.Vector3();
  private eye = new THREE.Vector3();
  private point = new THREE.Vector3();
  private fromEye = new THREE.Vector3();
  private fromAim = new THREE.Vector3();
  private travel = 1;
  private frame = 0;
  private last = 0;
  private visible = true;
  private paused = false;
  private index = 0;
  private disposed = false;
  private overview = true;
  private raycaster = new THREE.Raycaster();

  constructor(private canvas: HTMLCanvasElement, private labels: HTMLElement[], private onFailure: () => void) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    this.renderer.setClearColor(0, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(room, .05); this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = .7; room.dispose(); pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight("#f4f1e8", "#22311d", 1.2));
    this.key = new THREE.DirectionalLight("#fff7df", 3.4); this.key.position.set(-4, 9, 8); this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024,1024); this.key.shadow.camera.left = -10; this.key.shadow.camera.right = 10;
    this.key.shadow.camera.top = 6; this.key.shadow.camera.bottom = -6; this.key.shadow.camera.far = 35;
    this.key.shadow.normalBias = .025; this.key.shadow.bias = -.0002; this.key.shadow.radius = 4; this.scene.add(this.key);
    const rim = new THREE.DirectionalLight("#c4d1ae", 2.5); rim.position.set(5, 4, -6); this.scene.add(rim);
    const green = new THREE.MeshPhysicalMaterial({ color: "#374f2f", roughness: .29, metalness: .22, clearcoat: .8, clearcoatRoughness: .24 });
    const jade = new THREE.MeshPhysicalMaterial({ color: "#a8ba87", roughness: .25, metalness: .05, clearcoat: 1, clearcoatRoughness: .12 });
    const pale = new THREE.MeshStandardMaterial({ color: "#e0e4cd", roughness: .34, metalness: .2 });
    const dark = new THREE.MeshStandardMaterial({ color: "#22311d", roughness: .5, metalness: .18 });
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = this.scene) => {
      const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
    };
    const spine = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7.8,-.7,.5), ...this.stations.map(p=>p.clone().add(new THREE.Vector3(0,-.7,0))), new THREE.Vector3(8,-.3,-.7),
    ]);
    // Three coherent ribbons carry the eye between the five suspended specimens.
    for (let strand=0; strand<3; strand++) {
      const points = Array.from({length:180},(_,j)=> {
        const t=j/179, p=spine.getPoint(t); p.y+=Math.sin(t*Math.PI*10+strand*.55)*.08+strand*.038; p.z+=strand*.09; return p;
      });
      const mesh = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),240,strand ? .025 : .068,10,false),strand ? pale : green);
      mesh.receiveShadow=true;
    }
    const coreGeometry = new THREE.SphereGeometry(1,80,56);
    const surface = coreGeometry.attributes.position;
    for (let i=0;i<surface.count;i++) {
      const x=surface.getX(i),y=surface.getY(i),z=surface.getZ(i);
      const detail=1+.012*Math.sin(y*48+x*9)*Math.sin(z*13+y*8);
      surface.setXYZ(i,x*detail,y*detail,z*detail);
    }
    coreGeometry.computeVertexNormals();
    const hoopGeometry=new THREE.TorusGeometry(.8,.025,12,128);
    this.stations.forEach((position,index)=> {
      const group=new THREE.Group(); group.position.copy(position); group.rotation.y=[-.4,.18,-.2,.4,-.1][index]; group.userData.index=index;
      this.groups.push(group); this.scene.add(group);
      // Each marker has a solid, finely ridged kernel and a split protective shell.
      const kernel=add(coreGeometry,jade,group); kernel.scale.set(.44,.68+index*.035,.4); kernel.rotation.z=-.18+index*.07;
      const outerPoints=Array.from({length:180},(_,j)=>{
        const a=j/179*Math.PI*1.73+.17; return new THREE.Vector3(Math.cos(a)*.72,Math.sin(a)*.97,Math.sin(a*2)*.15);
      });
      const shell=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outerPoints),220,.105,20,false),green,group); shell.rotation.z=.2+index*.09;
      for (let band=0;band<4;band++) {
        const loop=add(hoopGeometry,band===0 ? pale : green,group);
        loop.scale.set(.94+band*.06,1.26+band*.07,1); loop.rotation.set(.1+band*.055,-.35+band*.10,index*.12-.2);
        if(!band)this.halos.push(loop);
      }
      const footing=add(new THREE.CylinderGeometry(.09,.2,.14,32),dark,group); footing.position.y=-.95;
      const pin=add(new THREE.CylinderGeometry(.01,.012,.45,8),pale,group); pin.position.y=1.46+index*.035;
      const seed=add(new THREE.SphereGeometry(.04,16,12),pale,group); seed.position.y=1.7+index*.035;
    });
    const floor=add(new THREE.PlaneGeometry(70,40),new THREE.ShadowMaterial({color:"#22311d",opacity:.13}));
    floor.rotation.x=-Math.PI/2; floor.position.y=-1.19; floor.castShadow=false;
    this.setTarget(); this.camera.position.copy(this.eye); this.aim.copy(this.target); this.resize();
    canvas.addEventListener("webglcontextlost",this.lost);
  }
  private lost=(event:Event)=>{event.preventDefault();this.dispose();this.onFailure();};
  private setTarget() {
    const aspect=this.canvas.clientWidth && this.canvas.clientHeight ? this.canvas.clientWidth/this.canvas.clientHeight : 1.4, compact=aspect<.9;
    if(this.overview){
      this.target.set(0,.35,0); this.eye.set(2,compact ? 8 : 6.5,Math.max(20,23/aspect));
    }else{
      this.target.copy(this.stations[this.index]).add(new THREE.Vector3(0,.6,0));
      this.eye.copy(this.target).add(new THREE.Vector3(2.6,1.5,compact ? 8.5 : 7.1));
    }
  }
  select(index:number,overview:boolean) {
    this.index=index;this.overview=overview;this.setTarget();
    this.fromEye.copy(this.camera.position);this.fromAim.copy(this.aim);this.travel=0;
    if(this.paused){this.camera.position.copy(this.eye);this.aim.copy(this.target);this.travel=1;this.render();}else this.wake();
  }
  freeze(paused:boolean){this.paused=paused;this.last=0;if(paused){cancelAnimationFrame(this.frame);this.frame=0;}else this.wake();}
  show(visible:boolean){this.visible=visible;this.last=0;if(visible)this.wake();else{cancelAnimationFrame(this.frame);this.frame=0;}}
  resize(){
    if(this.disposed)return;const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;
    const dpr=Math.min(devicePixelRatio,innerWidth<700?1.5:2,Math.sqrt(2800000/(w*h)));
    this.renderer.setPixelRatio(dpr);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.setTarget();this.camera.position.copy(this.eye);this.aim.copy(this.target);this.fromEye.copy(this.eye);this.fromAim.copy(this.target);this.travel=1;this.render();
  }
  hit(x:number,y:number){
    const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),this.camera);
    const hit=this.raycaster.intersectObjects(this.groups,true)[0];if(!hit)return null;
    let object:THREE.Object3D=hit.object;while(object.parent&&object.userData.index===undefined)object=object.parent;
    return typeof object.userData.index==="number"?object.userData.index:null;
  }
  private wake(){if(!this.disposed&&this.visible&&!this.paused&&!this.frame)this.frame=requestAnimationFrame(this.tick);}
  private tick=(now:number)=>{
    this.frame=0;if(this.disposed||!this.visible||this.paused){this.last=0;return;}
    if(this.last&&now-this.last<(innerWidth<700?32:16)){this.wake();return;}
    const dt=this.last?Math.min(.05,(now-this.last)/1000):.016;this.last=now;this.travel=Math.min(1,this.travel+dt/1.3);
    const t=this.travel,tween=t*t*t*(t*(t*6-15)+10);
    this.camera.position.lerpVectors(this.fromEye,this.eye,tween);this.aim.lerpVectors(this.fromAim,this.target,tween);
    this.camera.position.y+=Math.sin(t*Math.PI)*.65;
    this.render();if(t<1)this.wake();else this.last=0;
  };
  private render(){
    if(this.disposed)return;
    this.camera.lookAt(this.aim);this.camera.updateMatrixWorld();
    this.halos.forEach((mesh,i)=>mesh.scale.set((i===this.index&&!this.overview?1.03:.94),(i===this.index&&!this.overview?1.38:1.26),1));
    this.renderer.render(this.scene,this.camera);
    this.canvas.dataset.view=this.overview?"overview":String(this.index);
    this.canvas.dataset.camera=this.camera.position.toArray().map(v=>v.toFixed(2)).join(",");
    this.canvas.dataset.triangles=String(this.renderer.info.render.triangles);
    this.labels.forEach((label,i)=>{
      this.point.copy(this.stations[i]).add(new THREE.Vector3(0,2.02+i*.035,0)).project(this.camera);
      const x=(this.point.x*.5+.5)*this.canvas.clientWidth,y=(-this.point.y*.5+.5)*this.canvas.clientHeight;
      const shown=this.point.z<1&&x>25&&x<this.canvas.clientWidth-25&&y>30&&y<this.canvas.clientHeight-30&&(this.overview||i===this.index);
      label.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;label.style.visibility=shown?"visible":"hidden";
    });
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);this.canvas.removeEventListener("webglcontextlost",this.lost);
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
    this.scene.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.key.shadow.map?.dispose();this.environment.dispose();this.renderer.dispose();
  }
}
