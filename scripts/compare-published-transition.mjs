import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.HUNER_PLAYWRIGHT_PATH || 'playwright');
const output = path.resolve('../output/published-transition-reference');
const browser = await chromium.launch({headless:true,executablePath:process.env.HUNER_TEST_BROWSER});
const phone = process.env.HUNER_COMPARE_PHONE === 'true';
const targets = process.env.HUNER_COMPARE_TARGET === 'local'
  ? [['local-after','http://127.0.0.1:3000']]
  : [['live','https://huner-biofoundry.vercel.app'],['local-before','http://127.0.0.1:3000']];
try {
  for (const [label, origin] of targets) {
    const folder=path.join(output,label+(phone?'-phone':''));await mkdir(folder,{recursive:true});
    const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1440,height:900},hasTouch:phone}),page=await context.newPage();
    const errors=[],states=[],resources=[],pending=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{
      if(label==='live' && /\.(js|css)(\?|$)/.test(response.url())) pending.push((async()=>{
        try { const name=path.basename(new URL(response.url()).pathname);await writeFile(path.join(folder,name),await response.body());resources.push({url:response.url(),file:name}); } catch {}
      })());
    });
    await page.goto(origin+'/#cultivation',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.documentElement.dataset.engine==='live' && document.documentElement.dataset.materialReady==='true');
    for (const [name,progress] of [['cultivation',null],['threshold',0],['approach',.2],['opening',.45],['close',.7],['interior',.95],['exit',1.25]]) {
      await page.evaluate(({progress})=>{
        const m=document.getElementById('material'),c=document.getElementById('cultivation');
        const top=progress===null ? c.offsetTop+(c.offsetHeight-innerHeight)*.65 : progress>1 ? m.offsetTop+m.offsetHeight+innerHeight*.15 : m.offsetTop+(m.offsetHeight-innerHeight)*progress;
        scrollTo({top,behavior:'instant'});
      },{progress});
      await page.waitForTimeout(2400);
      const state=await page.evaluate(()=>({root:{...document.documentElement.dataset},canvas:{...document.querySelector('.field-layer canvas')?.dataset},material:{...document.getElementById('material')?.dataset},scroll:scrollY}));
      assert.equal(state.root.engine,'live',`${label}/${name}: rendering fell back`);
      if(progress>0 && progress<=1) {
        assert.ok(Math.abs(Number(state.material.progress)-progress)<.005,`${label}/${name}: camera did not settle`);
        assert.ok(Number(state.canvas.cellTriangles)>0,`${label}/${name}: no 3D cell`);
      }
      states.push({name,progress,...state});
      await page.screenshot({path:path.join(folder,`${name}.png`)});
    }
    await Promise.allSettled(pending);
    await writeFile(path.join(folder,'inspection.json'),JSON.stringify({origin,states,errors,resources},null,2));
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({label,phone,states:states.length,errors}));await context.close();
  }
} finally {await browser.close();}
