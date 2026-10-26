import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
async function load(path) {
  const { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}
const schema = await load('../content/schema.ts');
const { articles, perspective } = await load('../content/articles.ts');
const { references } = await load('../content/references.ts');
const { claims } = await load('../content/claims.ts');
const { programs } = await load('../content/research.ts');
test('unapproved and private articles never enter public routes; review excludes private data', () => {
  assert.equal(schema.selectArticles(articles, false).length, 0);
  assert.equal(schema.selectArticles([...articles, {...articles[0], publicVisibility:'private'}], true).length, articles.length);
  const approved = {...articles[0], publicationStatus:'published', publicVisibility:'public', approval:'approved', author:'Confirmed author', publishedAt:'2026-10-25'};
  assert.equal(schema.selectArticles([approved], false).length, 1);
  for (const change of [{approval:'pending'}, {publicVisibility:'private'}, {author:null}, {publishedAt:null}, {publicationStatus:'draft'}]) assert.equal(schema.canPublish({...approved,...change}),false);
});
test('editorial review cannot be enabled in production or an indexable build', () => {
  assert.equal(schema.readReviewMode({}),false);
  assert.equal(schema.readReviewMode({HUNER_CONTENT_REVIEW:'true'}),true);
  for (const change of [{VERCEL_ENV:'production'}, {CONTEXT:'production'}, {NEXT_PUBLIC_ALLOW_INDEXING:'true'}]) assert.throws(()=>schema.readReviewMode({HUNER_CONTENT_REVIEW:'true',...change}));
});
test('publication requires real metadata and known sources; impossible dates are rejected', () => {
  for (const article of [...articles,perspective]) assert.doesNotThrow(()=>schema.validateArticle(article,references));
  for (const change of [{publishedAt:'2026-02-30'}, {sources:['invented-doi']}, {publicationStatus:'published'}, {sections:[]}, {updatedAt:'2026-01-01',publishedAt:'2026-02-01'}]) assert.throws(()=>schema.validateArticle({...articles[0],...change},references));
  assert.throws(()=>schema.assertUniqueIds([{id:'same'},{id:'same'}]));
});
test('research programs and articles resolve to real claims, sources and related content', () => {
  for (const program of programs) {
    assert.ok(claims.some(claim => claim.id === program.claimId));
    for(const id of program.sources) assert.ok(references.some(reference=>reference.id === id));
  }
  for (const article of articles) for (const slug of article.researchProgram) assert.ok(programs.some(program=>program.slug === slug));
  assert.doesNotThrow(()=>schema.validateClaims(claims));
  assert.throws(()=>schema.validateClaims([{...claims[0],visibility:'private'}]));
  assert.throws(()=>schema.validateClaims([{...claims[0],approval:'pending'}]));
});
test('reading estimates use article content, not invented fixed durations', () => {
  assert.equal(schema.readingMinutes({...articles[0],sections:[{id:'one',title:'Title',paragraphs:['word '.repeat(400)]}]}),3);
  assert.equal(schema.readingMinutes({...articles[0],sections:[{id:'one',title:'Title',paragraphs:['Short note.']}]}),1);
});
