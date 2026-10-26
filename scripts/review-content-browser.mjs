import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.HUNER_PLAYWRIGHT_PATH || 'playwright');
const origin = process.env.HUNER_REVIEW_URL || 'http://127.0.0.1:3000';
const sceneOnly = process.env.HUNER_REVIEW_SCENE_ONLY === 'true';
const output = path.resolve('../output/scientific-content-review');
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true,executablePath:process.env.HUNER_TEST_BROWSER});
const results = [], errors = [];
let lastPage;
const capture = async (page,name) => page.screenshot({path:path.join(output,`${name}.png`)});
const inspect = async (page,label) => {
  const state = await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,canvases:document.querySelectorAll('canvas').length,contact:document.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]').length,robots:document.querySelector('meta[name="robots"]')?.content,threeLoaded:performance.getEntriesByType('resource').some(entry=>/living-foundry|organic-world_World|three_build/.test(entry.name))}));
  assert.equal(state.overflow,false,`${label}: horizontal overflow`);assert.equal(state.h1,1,`${label}: h1`);assert.equal(state.contact,0,`${label}: contact disclosure`);
  results.push({label,...state}); return state;
};
try {
  const context=await browser.newContext({viewport:{width:1440,height:900}}), page=await context.newPage();
  lastPage = page;
  page.on('pageerror',error=>errors.push(error.message));
  if (!sceneOnly) {
  const routes=['/approach/','/research/','/research/cordyceps-militaris/','/research/tuber-melanosporum/','/applications/','/progress/','/people/','/collaborate/','/journal/','/journal/the-process-behind-the-product/','/journal/a-model-is-not-yet-a-prediction/','/journal/choosing-a-cultivation-route/','/publications/','/publications/towards-reproducible-fungal-bioprocesses/'];
  for(const route of routes) {
    const response=await page.goto(origin+route,{waitUntil:'networkidle'}); assert.equal(response.status(),200,route);
    const state=await inspect(page,route);assert.equal(state.canvases,0,route);assert.equal(state.threeLoaded,false,route);
    assert.match(state.robots,/noindex/,route);
  }
  await page.goto(origin+'/approach/',{waitUntil:'networkidle'});
  await capture(page,'approach-desktop-final');
  await page.getByRole('tab',{name:'04 Specify Biological intermediate'}).click();
  assert.match(await page.getByRole('tabpanel').innerText(),/Agree on what crosses/);
  await page.keyboard.press('ArrowRight');assert.match(await page.getByRole('tabpanel').innerText(),/Develop the finished/);
  await page.keyboard.press('Home');assert.match(await page.getByRole('tabpanel').innerText(),/Begin with a biological/);
  await page.locator('.process-explorer').scrollIntoViewIfNeeded();await capture(page,'process-desktop-final');
  await page.getByLabel('Explore a cultivation variable').selectOption('2');assert.match(await page.locator('.variables-explorer').innerText(),/Which conditions/);
  await page.locator('.methodology-stage summary').first().click();assert.equal(await page.locator('.methodology-stage').first().getAttribute('open'),'');
  await page.goto(origin+'/journal/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.journal-row').count(),3);
  await page.getByLabel('Search the journal').fill('<script>no-result</script>');assert.equal(await page.locator('.journal-row').count(),0);
  await page.getByRole('button',{name:'Clear filters'}).click();assert.equal(await page.locator('.journal-row').count(),3);
  await page.getByRole('combobox',{name:'Category',exact:true}).selectOption('Modeling Notes');assert.equal(await page.locator('.journal-row').count(),1);
  await capture(page,'journal-filtered-desktop');
  await page.goto(origin+'/progress/',{waitUntil:'networkidle'});
  await page.getByLabel('Filter the record').selectOption('Finalist selection');assert.equal(await page.locator('.progress-archive li').count(),1);
  await page.locator('.progress-archive summary').click();assert.match(await page.locator('.progress-archive').innerText(),/not a claim of winning/);
  await page.locator('.progress-archive').scrollIntoViewIfNeeded();await capture(page,'progress-expanded');
  await page.goto(origin+'/missing-page/',{waitUntil:'networkidle'});assert.match(await page.locator('h1').innerText(),/not taken root/);
  for(const [name,width,height,touch] of [['phone',390,844,true],['tablet-portrait',820,1180,true],['tablet-landscape',1180,820,true],['phone-landscape',844,390,true]]) {
    const device=await browser.newContext({viewport:{width,height},hasTouch:touch}), p=await device.newPage();p.on('pageerror',error=>errors.push(error.message));
    for(const route of ['/approach/','/research/cordyceps-militaris/','/journal/a-model-is-not-yet-a-prediction/']) { await p.goto(origin+route,{waitUntil:'networkidle'});await inspect(p,`${name} ${route}`);if(route.includes('journal/'))await capture(p,`article-${name}`); }
    await p.goto(origin+'/approach/',{waitUntil:'networkidle'});await capture(p,`approach-${name}-final`);
    await p.locator('.site-menu summary').click();assert.equal(await p.locator('.site-menu nav').isVisible(),true);await p.locator('.site-menu summary').click();
    await p.getByRole('tab',{name:/05\s*Transform/}).click();assert.match(await p.getByRole('tabpanel').innerText(),/Develop the finished/);await p.locator('.process-explorer').scrollIntoViewIfNeeded();await capture(p,`process-${name}-final`);
    await device.close();
  }
  }
  await page.goto(origin+'/',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('.field-layer canvas')?.dataset.status==='spatial');await inspect(page,'home with GPU');await capture(page,'home-arrival-final');
  await page.locator('#conditions').scrollIntoViewIfNeeded();await page.locator('.condition-action').click();assert.match(await page.locator('#condition-status').innerText(),/Conditions changed/);await capture(page,'home-conditions-final');
  await page.evaluate(()=>{const m=document.getElementById('material');scrollTo({top:m.offsetTop+(m.offsetHeight-innerHeight)*.7,behavior:'instant'});});
  await page.waitForFunction(()=>document.documentElement.dataset.materialReady==='true' && Number(document.getElementById('material').dataset.progress)>.69 && Number(document.querySelector('.field-layer canvas')?.dataset.cellTriangles)>0);
  // The chapter blend settles more slowly than camera travel after a large jump.
  await page.waitForTimeout(2200);
  await page.getByRole('button',{name:'Pause motion'}).click();await capture(page,'home-cell-3d-final');
  const cell=await page.locator('.field-layer canvas').evaluate(c=>({...c.dataset}));assert.ok(Number(cell.cellTriangles)>0);results.push({label:'preserved cell',...cell});
  await page.locator('.site-menu summary').click();
  assert.equal(await page.locator('.site-menu nav').evaluate(el=>getComputedStyle(el).color),'rgb(34, 49, 29)');
  await page.locator('.site-menu summary').click();
  await page.locator('#process').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForFunction(()=>document.documentElement.dataset.chapter==='raw-materials');
  await page.waitForTimeout(1000);await capture(page,'home-process-final');
  await page.getByRole('tab',{name:/04 Specify/}).click();assert.match(await page.getByRole('tabpanel').innerText(),/Agree on what crosses/);
  await page.goto(origin+'/?gpu=off#material',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.dataset.engine==='static');await inspect(page,'GPU off');await capture(page,'gpu-fallback');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/#material',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.dataset.engine==='static');await inspect(page,'reduced motion');
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}), p=await plain.newPage();await p.goto(origin+'/approach/');assert.ok((await p.locator('.full-sequence').innerText()).includes('Read the complete sequence'));assert.equal(await p.locator('h1').count(),1);await plain.close();
  // Reference capture is read-only. It never changes project settings or production.
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('https://huner-biofoundry.vercel.app/#material',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Number(document.querySelector('.field-layer canvas')?.dataset.cellTriangles)>0);
  await page.evaluate(()=>{const m=document.getElementById('material');scrollTo({top:m.offsetTop+(m.offsetHeight-innerHeight)*.7,behavior:'instant'});});
  await page.waitForFunction(()=>Number(document.getElementById('material').dataset.progress)>.69);
  await page.waitForTimeout(2200);
  await page.getByRole('button',{name:'Pause motion'}).click();await capture(page,'production-cell-reference');
  results.push({label:'production cell reference',...await page.locator('.field-layer canvas').evaluate(c=>({...c.dataset}))});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:results.length,errors:0,output}));
} catch (error) {
  console.error(await lastPage?.evaluate(()=>({url:location.href,root:{...document.documentElement.dataset},canvas:[...document.querySelectorAll('canvas')].map(c=>({...c.dataset})),material:{...document.getElementById('material')?.dataset},scroll:scrollY})));
  if (lastPage) await capture(lastPage,'failed-scene-diagnostic');
  throw error;
} finally { await writeFile(path.join(output,sceneOnly?'scene-results.json':'browser-results.json'),JSON.stringify({results,errors},null,2));await browser.close(); }
