import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile=async path=>ts.transpileModule(await readFile(new URL(path,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const url=code=>"data:text/javascript;base64,"+Buffer.from(code).toString("base64");
const seed=url(await compile("../living-foundry/seed.ts"));
const {GrowthField}=await import(url((await compile("../organic-world/field.ts")).replace("../living-foundry/seed",seed)));
const three=new URL("../node_modules/three/build/three.module.js",import.meta.url).href;
const {poseAt}=await import(url((await compile("../organic-world/camera.ts")).replace('"three"',JSON.stringify(three))));
const {journeyAt,reviewStops}=await import(url(await compile("../organic-world/journey.ts")));
const {focalCell,CELL_CENTER}=await import(url((await compile("../organic-world/focal-cell.ts"))
  .replace('"three"',JSON.stringify(three))
  .replace('"three/examples/jsm/utils/BufferGeometryUtils.js"',JSON.stringify(new URL("../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js",import.meta.url).href))
  .replace("../living-foundry/seed",seed)));

test("organic field is deterministic and input cannot directly deform the organism",()=>{
  const a=new GrowthField(48),b=new GrowthField(48);
  assert.deepEqual(a.b,b.b);
  const beforeBio=a.b.slice(),beforeMorph=a.morphology.slice();
  a.addCondition(.7,.61);
  assert.deepEqual(a.b,beforeBio);assert.deepEqual(a.morphology,beforeMorph);
  assert.equal(a.delayed.reduce((s,x)=>s+x,0),0);
  assert.ok(a.raw.some(x=>x>0));
});
test("environmental memory leads to a delayed biological and morphological difference",()=>{
  const treated=new GrowthField(48),control=new GrowthField(48);
  treated.addCondition(.7,.61);
  treated.step(1/30);control.step(1/30);
  assert.ok(Math.max(...treated.delayed)<Math.max(...treated.raw)*.02);
  const difference=(x,y)=>x.reduce((sum,v,i)=>sum+Math.abs(v-y[i]),0);
  const immediate=difference(treated.morphology,control.morphology);
  for(let i=0;i<360;i++){treated.step(1/30);control.step(1/30);}
  const later=difference(treated.morphology,control.morphology);
  assert.ok(later>immediate*50&&later>.05,JSON.stringify({immediate,later}));
  for(const field of [treated.a,treated.b,treated.delayed,treated.morphology])assert.ok(field.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
  const before=treated.morphology.slice();treated.step(0);assert.deepEqual(treated.morphology,before);
});
test("the camera follows one bounded continuous and reversible spatial path",()=>{
  for(const aspect of [1.6,.46]){
    let previous=poseAt(0,aspect).position;
    for(let i=1;i<=1000;i++){
      const {position,target}=poseAt(i/1000,aspect);
      assert.ok(position.distanceTo(previous)<.1);
      assert.ok(position.distanceTo(target)>1);
      assert.ok(position.toArray().every(Number.isFinite));
      previous=position;
    }
    assert.deepEqual(poseAt(.5,aspect),poseAt(.5,aspect));
    assert.ok(poseAt(1,aspect).position.z<-4,"camera crosses the original aperture");
  }
});

test("the page reaches the destination before applications and retains the same world afterward",()=>{
  const anchors={life:900,conditions:1755,foundry:2610,cultivation:3600,material:4950,applications:8910,end:15200};
  const stops=reviewStops(anchors,900);
  assert.ok(stops.every((s,i)=>s<anchors.applications&&(i===0||s>stops[i-1])));
  let previous=0;
  for(let y=0;y<anchors.end;y+=5){
    const p=journeyAt(y,900,anchors);
    assert.ok(p.progress>=previous&&p.progress<=1);
    if(y<stops[3])assert.equal(p.settle,0,"settling must not hide the approaching cell");
    previous=p.progress;
  }
  assert.equal(journeyAt(anchors.applications+900,900,anchors).progress,1);
  assert.equal(journeyAt(anchors.applications+900,900,anchors).settle,1);
});

test("the focal cell has finite volumetric geometry and shares the delayed condition footprint",()=>{
  const {body,fibers}=focalCell(.5);
  try {
    for(const g of [body,fibers]){
      const p=g.getAttribute("position");
      assert.ok(p.count>1000);
      assert.ok(p.array.every(Number.isFinite));
      assert.ok(g.getIndex().array.every(i=>i<p.count));
      assert.equal(g.getAttribute("growthDirection").count,p.count);
    }
    body.computeBoundingBox();
    assert.ok(body.boundingBox.max.z-body.boundingBox.min.z>.4,"cell must have depth, not a flat face");
    for(const p of [0,.34,.69,1])assert.ok(CELL_CENTER.z<poseAt(p,1.6).position.z,"cell stays ahead of the approved camera");
    const control=new GrowthField(48),treated=new GrowthField(48),uv=body.getAttribute("uv");
    const difference=()=>{
      let sum=0;
      for(let i=0;i<uv.count;i+=13){
        const x=Math.floor(uv.getX(i)*48),y=Math.floor(uv.getY(i)*48),k=y*48+x;
        sum+=Math.abs(treated.morphology[k]-control.morphology[k]);
      }
      return sum;
    };
    treated.addCondition(.7,.61);
    assert.equal(difference(),0,"input must not immediately deform the cell");
    for(let i=0;i<360;i++){treated.step(1/30);control.step(1/30);}
    assert.ok(difference()>.1,"the cell's own vertices must sample the delayed biological change");
  } finally { body.dispose();fibers.dispose(); }
});
