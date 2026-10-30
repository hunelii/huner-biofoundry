import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.HUNER_PLAYWRIGHT_PATH || '/Users/huneli/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({headless:true, executablePath:process.env.HUNER_TEST_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const output = path.resolve(process.env.HUNER_REVIEW_OUTPUT || '../output/feedback-review-2026-10-29');
await mkdir(output, {recursive:true});
const origin = process.env.HUNER_REVIEW_URL || 'http://127.0.0.1:3000';
const checks = [], errors = [], frames = [];
const attachErrors = page => {page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});};
const scrollPast = async (page, selector) => {
  const element=page.locator(selector);
  for(const fraction of [1.1,-.4,.2]) {
    await element.evaluate((el,f)=>scrollTo({top:scrollY+el.getBoundingClientRect().top+el.offsetHeight*f,behavior:'instant'}),fraction);
    await page.waitForTimeout(150);
  }
};
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}); attachErrors(page);
  await page.goto(origin+'/approach/', {waitUntil:'networkidle'});
  const lens=page.locator('.measurement-lens');
  await scrollPast(page,'.measurement-lens');
  assert.equal(await lens.getAttribute('data-step'),'0');
  for(const name of ['Target compound','Morphology','Biomass','Target compound']) {
    await lens.getByRole('button',{name:new RegExp(name)}).click();
    const observation=await lens.locator('.culture-specimen').getAttribute('data-observation');
    const selector={biomass:'.specimen-amount',morphology:'.specimen-form',compound:'.specimen-compound'}[observation];
    assert.equal(await lens.locator(selector).evaluate(e=>getComputedStyle(e).opacity),'1');
    assert.equal(await lens.locator(selector).evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  }
  await scrollPast(page,'.measurement-lens'); assert.equal(await lens.getAttribute('data-step'),'2');
  checks.push('Measurement selection stays fixed before and after user input; all illustration parts update without a delayed reveal');
  for(const name of ['Biomass','Morphology','Target compound']) {
    await lens.getByRole('button',{name:new RegExp(name)}).click();
    const disclosures=lens.locator('.record-disclosures details');assert.equal(await disclosures.count(),3);
    for(let i=0;i<3;i++) {
      await disclosures.nth(i).locator('summary').focus();await page.keyboard.press('Enter');
      assert.equal(await disclosures.nth(i).getAttribute('open'),'');
      assert.ok((await disclosures.nth(i).locator('p').innerText()).length>60);
      await page.keyboard.press('Space');assert.equal(await disclosures.nth(i).getAttribute('open'),null);
    }
  }
  await lens.locator('.record-disclosures summary').first().click();
  await lens.screenshot({path:path.join(output,'measurement-desktop.png'),style:'.brand-header{visibility:hidden}'});
  checks.push('All nine record fields have meaningful keyboard-operable explanations');
  await page.getByRole('tab',{name:/04 Specify/}).click();
  await scrollPast(page,'.visual-process'); assert.equal(await page.locator('.visual-process').getAttribute('data-step'),'3');
  await page.getByRole('tab',{name:/04 Specify/}).focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:/05 Transform/}).getAttribute('aria-selected'),'true');
  await page.goto(origin+'/research/',{waitUntil:'networkidle'});
  const modeling=page.getByRole('button',{name:/02 Modeling/});await modeling.click();
  await scrollPast(page,'.research-circuit');assert.equal(await modeling.getAttribute('aria-expanded'),'true');
  await modeling.click();assert.equal(await modeling.getAttribute('aria-expanded'),'false');
  await modeling.click();await page.locator('.research-circuit').screenshot({path:path.join(output,'research-desktop.png'),style:'.brand-header{visibility:hidden}'});
  checks.push('Process tabs and research disclosures respond to choices, not scrolling');
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['phone',390,844],['narrow',320,740],['landscape',844,390]]) {
    await page.setViewportSize({width,height});
    await page.goto(origin+'/approach/',{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const tabs=await page.locator('.process-tabs button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};}));
    assert.ok(tabs.every(r=>r.left>=0&&r.right<=width));
    const summary=page.locator('.site-menu summary');assert.equal(await summary.innerText(),'Explore');
    await summary.click();
    const routes=await page.locator('.reading-nav a:visible,.site-menu nav a:visible').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
    assert.equal(routes.length,9);assert.equal(new Set(routes).size,9);
    await page.keyboard.press('Escape');assert.equal(await page.locator('.site-menu').getAttribute('open'),null);
    assert.equal(await summary.evaluate(e=>e===document.activeElement),true);
    await summary.click();await page.mouse.click(8,150);assert.equal(await page.locator('.site-menu').getAttribute('open'),null);
    await page.getByRole('tab',{name:/05 Transform/}).click();
    if(name==='phone')await page.locator('.visual-process').screenshot({path:path.join(output,'process-phone.png'),style:'.brand-header{visibility:hidden}'});
    checks.push(`${name}: no horizontal overflow or clipped process controls; each navigation destination appears once; Escape and outside click close menu`);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.field-layer canvas')?.dataset.status==='spatial');
  assert.equal(await page.getByText('A LIVING POSSIBILITY',{exact:true}).count(),0);
  assert.equal(await page.locator('.visual-toolbar,.arrival-observation,.side-note,.behavior-note,.boundary-caption').count(),0);
  await page.screenshot({path:path.join(output,'arrival-desktop.png')});
  // Sample the same boundaries in both directions, with the actual simulation running.
  const scenes=[['life',.1],['conditions',.15],['foundry',.2],['cultivation',.2],['material',.08],['material',.72],['inquiry',0],['applications',0],['food',.1]];
  for(const direction of ['forward','reverse']) {
    for(const [id,fraction] of direction==='forward'?scenes:[...scenes].reverse()) {
      await page.locator('#'+id).evaluate((e,f)=>scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*f,behavior:'instant'}),fraction);
      await page.waitForTimeout(id==='material'?1800:900);
      const state=await page.evaluate(()=>({chapter:document.documentElement.dataset.chapter,overflow:document.documentElement.scrollWidth>innerWidth+1,canvas:{...document.querySelector('.field-layer canvas').dataset}}));
      assert.equal(state.overflow,false);
      if(id==='material'&&fraction>.5)assert.ok(Number(state.canvas.cellTriangles)>0);
      frames.push({direction,id,fraction,...state});
      await page.screenshot({path:path.join(output,`${direction}-${id}-${fraction}.png`)});
    }
  }
  checks.push('Forward and reverse journey captured; original 3D cell renders in both directions');
  for(const mode of ['reduce','gpu-off','no-js']) {
    const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:mode==='reduce'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
    const p=await context.newPage();attachErrors(p);await p.goto(origin+(mode==='gpu-off'?'/?gpu=off':'/'),{waitUntil:'networkidle'});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await p.locator('#inquiry .record-disclosures summary').first().click();
    assert.equal(await p.locator('#inquiry .record-disclosures details').first().getAttribute('open'),'');
    await p.locator('#inquiry .full-sequence summary').click();assert.match(await p.locator('#inquiry .full-sequence').innerText(),/More biomass does not/);
    if(mode!=='no-js') {
      await p.locator('#inquiry').getByRole('button',{name:/Target compound/}).click();
      assert.equal(await p.locator('#inquiry .specimen-compound').evaluate(e=>getComputedStyle(e).opacity),'1');
    }
    if(mode==='reduce')await p.screenshot({path:path.join(output,'measurement-phone.png')});
    checks.push(`${mode}: phone layout, record disclosures and complete explanation work`);await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors,output},null,2));
} finally {
  await writeFile(path.join(output,'results.json'),JSON.stringify({checks,errors,frames},null,2));
  await browser.close();
}
