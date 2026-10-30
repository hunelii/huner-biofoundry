import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' ? '/huner-biofoundry' : '');
if (!basePath) {
  console.log('No basePath configured, skipping GitHub Pages link adaptation.');
  process.exit(0);
}

const root = path.resolve('out');

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const res = path.join(dir, entry.name);
    return entry.isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

const allFiles = await getFiles(root);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

let modifiedCount = 0;
for (const file of htmlFiles) {
  let content = await readFile(file, 'utf8');
  const original = content;

  // Replace root link href="/"
  content = content.replaceAll('href="/"', `href="${basePath}/"`);

  // Replace href="/..." but not already prefixed with basePath or external/system protocols
  content = content.replace(/href="\/([a-zA-Z0-9_\-#?&=/.]+)"/g, (match, p1) => {
    if (p1.startsWith('huner-biofoundry') || p1.startsWith('_next')) return match;
    return `href="${basePath}/${p1}"`;
  });

  if (content !== original) {
    await writeFile(file, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`GitHub Pages preparation complete: ${modifiedCount} HTML files adapted with basePath "${basePath}".`);
