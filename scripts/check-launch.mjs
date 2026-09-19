import { readFile } from 'node:fs/promises';
const html = await readFile('out/index.html', 'utf8');
const robots = await readFile('out/robots.txt','utf8');
const sitemap = await readFile('out/sitemap.xml','utf8');
const failures = [];
if (/name="robots" content="[^"]*noindex/.test(html)) failures.push('Production indexing is not enabled in this exported build.');
if (!/rel="canonical" href="https:\/\//.test(html)) failures.push('The confirmed HTTPS canonical domain is missing.');
if (!/href="mailto:/.test(html)) failures.push('The approved public enquiry email is missing.');
if (!/<loc>https:\/\//.test(sitemap)) failures.push('The production sitemap has no URL.');
if (!/Sitemap: https:\/\//.test(robots) || /Disallow: \/\s*$/.test(robots)) failures.push('Production robots.txt is not ready.');
if (failures.length) { console.error('Launch still needs:\n' + failures.map(f => '- ' + f).join('\n')); process.exitCode = 1; }
else console.log('Local launch configuration checks pass. Still verify public HTTPS, account tracking IDs, consent, enquiry delivery, and physical devices.');
