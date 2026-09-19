import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
async function load(path) {
  const { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const { readSiteConfig } = await load('../lib/site.ts');
const { parseConsent } = await load('../lib/consent.ts');
test('launch indexing requires a confirmed domain and excludes host previews', () => {
  assert.equal(readSiteConfig({}).indexable, false);
  assert.equal(readSiteConfig({NEXT_PUBLIC_ALLOW_INDEXING:'true'}).indexable, false);
  const production = { NEXT_PUBLIC_SITE_URL:'https://www.example.com', NEXT_PUBLIC_ALLOW_INDEXING:'true' };
  assert.equal(readSiteConfig(production).indexable,true);
  assert.equal(readSiteConfig({...production, VERCEL_ENV:'preview'}).indexable,false);
  assert.equal(readSiteConfig({...production, CONTEXT:'deploy-preview'}).indexable,false);
  for (const url of ['http://example.com','https://example.com/path','https://user:password@example.com','https://example.com/?x=1']) assert.throws(()=>readSiteConfig({NEXT_PUBLIC_SITE_URL:url}));
});
test('invalid analytics IDs and contact addresses fail before deployment', () => {
  assert.throws(()=>readSiteConfig({NEXT_PUBLIC_GA_ID:'UA-123'}));
  assert.throws(()=>readSiteConfig({NEXT_PUBLIC_META_PIXEL_ID:'<script>'}));
  assert.throws(()=>readSiteConfig({NEXT_PUBLIC_CONTACT_EMAIL:'hello\n@example.com'}));
});
test('consent never interprets malformed or missing values as permission', () => {
  for (const value of [null,'{}','invalid','true','{"analytics":"true","marketing":false}']) assert.equal(parseConsent(value),null);
  assert.deepEqual(parseConsent('{"analytics":false,"marketing":false}'),{analytics:false,marketing:false});
  assert.deepEqual(parseConsent('{"analytics":true,"marketing":false}'),{analytics:true,marketing:false});
});
