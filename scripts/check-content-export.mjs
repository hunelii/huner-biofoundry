import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve('out');
async function files(dir) { return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry => entry.isDirectory() ? files(path.join(dir,entry.name)) : path.join(dir,entry.name)))).flat(); }
const exported = await files(root), htmlFiles = exported.filter(file=>file.endsWith('.html'));
const errors = [], titles = new Map(); let links = 0;
const read = new Map();
for(const file of htmlFiles) read.set(file,await readFile(file,'utf8'));
for(const [file,html] of read) {
  const relative = path.relative(root,file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  if(!title) errors.push(`${relative}: missing title`);
  if((html.match(/<h1[ >]/g)||[]).length!==1) errors.push(`${relative}: heading count`);
  if(relative.startsWith('lab/')) continue;
  if(relative!=='404.html' && !relative.startsWith('_not-found')) {
    if(titles.has(title)) errors.push(`${relative}: duplicate page title`); titles.set(title,relative);
    if(!html.includes('name="description"')) errors.push(`${relative}: missing description`);
  }
  if(/href="(?:mailto:|tel:)/i.test(html)) errors.push(`${relative}: public contact link`);
  for(const match of html.matchAll(/href="([^"<>]+)"/g)) {
    const href = match[1].replaceAll('&amp;','&');
    if(!href.startsWith('/') && !href.startsWith('#')) continue;
    if(href.startsWith('//')) continue;
    const current = relative==='index.html' ? '/' : '/'+relative.replace(/index\.html$/,'');
    const url = new URL(href,'http://local'+current);
    let target = path.join(root,decodeURIComponent(url.pathname));
    try { const entry = await stat(target); if(entry.isDirectory()) target=path.join(target,'index.html'); await stat(target); }
    catch { errors.push(`${relative}: missing target ${href}`); continue; }
    if(url.hash && target.endsWith('.html')) {
      const source = read.get(target) ?? await readFile(target,'utf8');
      if(!source.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) errors.push(`${relative}: missing anchor ${href}`);
    }
    links++;
  }
}
const review = process.argv.includes('--review');
for(const slug of ['the-process-behind-the-product','a-model-is-not-yet-a-prediction','choosing-a-cultivation-route']) {
  const exists = exported.includes(path.join(root,'journal',slug,'index.html'));
  if(exists!==review) errors.push(`Draft generation gate failed: ${slug}`);
}
if(!review) {
  for(const file of exported.filter(file=>/\.(html|txt|js|json)$/.test(file))) {
    const text = await readFile(file,'utf8');
    if(text.includes('A model is not yet a prediction')) errors.push(`Draft text leaked: ${path.relative(root,file)}`);
  }
}
assert.deepEqual(errors,[],errors.join('\n'));
console.log(JSON.stringify({htmlPages:htmlFiles.length,localLinksChecked:links,draftMode:review,errors:0}));
