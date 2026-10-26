import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  });
  return import(
    "data:text/javascript;base64," + Buffer.from(outputText).toString("base64")
  );
}
const { seedField } = await load("../living-foundry/seed.ts");
const { selectQuality, PerformanceBudget } = await load(
  "../living-foundry/performance.ts",
);
test("seed is repeatable, sparse, bounded, and distinct for a new seed", () => {
  const a = seedField(256, 160, 2718),
    b = seedField(256, 160, 2718),
    c = seedField(256, 160, 2719);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.ok(a.every((x) => Number.isFinite(x) && x >= 0 && x <= 1));
  let active = 0;
  for (let i = 1; i < a.length; i += 4) if (a[i] > 0) active++;
  assert.ok(active > 0 && active / (256 * 160) < 0.02);
});
test("capabilities select independent phone, tactile and spatial budgets", () => {
  assert.equal(selectQuality(390, true).name, "narrative");
  assert.equal(selectQuality(1024, true).name, "tactile");
  assert.equal(selectQuality(1440, false).name, "spatial");
  assert.ok(selectQuality(390, true).grid < selectQuality(1440, false).grid);
});
test("brief slow frames do not degrade the experience", () => {
  const b = new PerformanceBudget();
  let result;
  for (let i = 0; i < 120; i++) result = b.observe(i < 10 ? 80 : 8);
  assert.equal(result, "keep");
});
test("sustained slow rendering reduces quality before falling back", () => {
  const b = new PerformanceBudget();
  let result;
  for (let i = 0; i < 120; i++) result = b.observe(80);
  assert.equal(result, "reduce");
  for (let i = 0; i < 120; i++) result = b.observe(80);
  assert.equal(result, "fallback");
});
test("recovery after reducing resolution does not trigger fallback", () => {
  const b = new PerformanceBudget();
  for (let i = 0; i < 120; i++) b.observe(80);
  let result;
  for (let i = 0; i < 120; i++) result = b.observe(8);
  assert.equal(result, "keep");
});
const { materialProgress, settleCellProgress, cellJourney } = await load(
  "../living-foundry/material-transition.ts",
);
test("material reveal is bounded, reversible and independent of scroll speed", () => {
  assert.equal(materialProgress(900, 1000, 2800, 1000), 0);
  assert.equal(materialProgress(1900, 1000, 2800, 1000), 0.5);
  assert.equal(materialProgress(4000, 1000, 2800, 1000), 1);
  assert.equal(materialProgress(1450, 1000, 2800, 1000), 0.25);
  assert.equal(materialProgress(1000, 1000, 1000, 1000), 0);
});
test("cell approach settles at different frame rates and reverses without overshoot", () => {
  const settle = (fps) => { let p = 0; for(let i=0;i<fps;i++) p=settleCellProgress(p,1,1/fps); return p; };
  assert.ok(Math.abs(settle(30)-settle(60)) < .001);
  assert.ok(settle(30) > .999);
  let p=.8;
  for(let i=0;i<60;i++) { const next=settleCellProgress(p,0,1/60); assert.ok(next<=p && next>=0); p=next; }
  assert.equal(p,0);
  assert.ok(settleCellProgress(0,1,20)<.4, "a suspended tab cannot jump to the end");
});
test("cell wall opens only after the approach starts, with inspection at the end", () => {
  assert.equal(cellJourney(.2).opening,0);
  assert.ok(cellJourney(.2).approach>0);
  assert.equal(cellJourney(0).heading,1);
  assert.ok(cellJourney(.60).opening > 0 && cellJourney(.60).opening < 1);
  assert.equal(cellJourney(.60).inspect,0);
  assert.equal(cellJourney(1).opening,1);
  assert.equal(cellJourney(1).approach,1);
  assert.equal(cellJourney(1).center,1);
  assert.equal(cellJourney(1).inspect,1);
  assert.equal(cellJourney(1).heading,0);
});

const { phenotype, approach } = await load("../living-foundry/phenotypes.ts");
test("application regimes are distinct and settle gradually without overshoot", () => {
  const food = phenotype(7), scent = phenotype(8), raw = phenotype(9);
  assert.notDeepEqual(food, scent);
  assert.notDeepEqual(scent, raw);
  const start = food.feed, target = scent.feed;
  const first = approach(start, target, 1 / 30);
  assert.ok(first < start && first > target);
  assert.equal(approach(start, target, 0), start);
  assert.ok(Math.abs(approach(start, target, 30) - target) < 0.000001);
  assert.ok(Math.abs(approach(approach(start, target, 1), target, 1) - approach(start, target, 2)) < 1e-12);
});

const { materialWindow, contactIsTap } = await load("../living-foundry/journey.ts");
test("material exit is continuous and reverse scroll restores the reveal", () => {
  assert.equal(materialWindow(900, 1000, 2800, 1000).progress, 0);
  assert.equal(materialWindow(1900, 1000, 2800, 1000).progress, .5);
  for (let scroll = 900; scroll <= 4500; scroll += 50) {
    const view = materialWindow(scroll, 1000, 2800, 1000);
    assert.ok(view.opacity >= 0 && view.opacity <= 1);
    assert.ok(view.offset <= 0);
    assert.ok(view.progress >= 0 && view.progress <= 1);
  }
  assert.equal(materialWindow(2800,1000,2800,1000).opacity,1);
  assert.equal(materialWindow(3300,1000,2800,1000).opacity,.5);
  assert.equal(materialWindow(3300,1000,2800,1000).offset,-500);
  assert.equal(materialWindow(3800,1000,2800,1000).opacity,0);
  assert.equal(materialWindow(4350,1000,2800,1000).opacity,1);
  assert.equal(materialWindow(3300, 1000, 2800, 1000).progress, 1);
  const forward=[1000,1900,2300,2799,2800,3300,3799,3800].map(scroll=>cellJourney(materialWindow(scroll,1000,2800,1000).progress));
  const reverse=[3800,3799,3300,2800,2799,2300,1900,1000].map(scroll=>cellJourney(materialWindow(scroll,1000,2800,1000).progress)).reverse();
  assert.deepEqual(forward,reverse);
});
test("phone intervention excludes drags and long presses", () => {
  assert.equal(contactIsTap(0, 100), true);
  assert.equal(contactIsTap(11, 599), true);
  assert.equal(contactIsTap(12, 100), false);
  assert.equal(contactIsTap(0, 600), false);
});
const { fieldView, screenToField, fieldToScreen } = await load("../living-foundry/composition.ts");
test("the published approach keeps advancing into the open cell instead of pulling back", () => {
  let previous=cellJourney(0);
  for(let step=1;step<=100;step++) {
    const current=cellJourney(step/100);
    for(const key of ['approach','center','opening','inspect']) assert.ok(current[key]>=previous[key],`${key} reversed at ${step}%`);
    previous=current;
  }
  assert.ok(cellJourney(.5).approach<1,"the approach must continue through the second half");
  assert.equal(cellJourney(.76).approach,1);
  assert.equal(cellJourney(.67).opening,1);
  assert.equal(cellJourney(.68).inspect,0);
});
test("environment input and cell origin stay aligned through the Conditions composition", () => {
  for (const phone of [false,true]) for (const stage of [0,1.4,2,2.6,3,5]) {
    const view=fieldView(stage,phone);
    for (const point of [{x:.1,y:.2},{x:.7,y:.61},{x:.92,y:.85}]) {
      const roundTrip=fieldToScreen(screenToField(point,view),view);
      assert.ok(Math.abs(point.x-roundTrip.x)<1e-12);
      assert.ok(Math.abs(point.y-roundTrip.y)<1e-12);
    }
  }
  assert.equal(fieldView(2,false).conditions,1);
  assert.equal(fieldView(0,false).conditions,0);
  assert.equal(fieldView(5,false).conditions,0);
});
