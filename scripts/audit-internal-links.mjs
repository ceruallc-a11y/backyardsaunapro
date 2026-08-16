import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const siteOrigin = 'https://backyardsaunapro.com';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

function routeFor(file) {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/index\.html$/, '')}`;
}

function normalizeTarget(href) {
  if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  const target = new URL(href, siteOrigin);
  if (target.origin !== siteOrigin) return null;
  if (path.posix.extname(target.pathname)) return null;
  return target.pathname === '/' ? '/' : `${target.pathname.replace(/\/+$/, '')}/`;
}

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const pages = new Map(htmlFiles.map((file) => [routeFor(file), file]));
const incoming = new Map([...pages.keys()].map((route) => [route, new Set()]));
const outgoing = new Map([...pages.keys()].map((route) => [route, new Set()]));
const missing = [];

for (const [sourceRoute, file] of pages) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const targetRoute = normalizeTarget(match[1]);
    if (!targetRoute || targetRoute === sourceRoute) continue;
    outgoing.get(sourceRoute).add(targetRoute);
    if (pages.has(targetRoute)) incoming.get(targetRoute).add(sourceRoute);
    else missing.push({ sourceRoute, targetRoute });
  }
}

const isContentRoute = (route) => /^\/(?:best-saunas|brands\/[^/]+|guides\/[^/]+|reviews\/[^/]+)\/$/.test(route);
const weakContent = [...incoming.entries()]
  .filter(([route]) => isContentRoute(route))
  .map(([route, sources]) => ({ route, inbound: sources.size, outbound: outgoing.get(route).size }))
  .filter((row) => row.inbound <= 2)
  .sort((a, b) => a.inbound - b.inbound || a.route.localeCompare(b.route));

const lines = [
  '# Internal Link Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `- HTML pages checked: ${pages.size}`,
  `- Internal links to missing page routes: ${missing.length}`,
  `- Commercial or guide pages with no more than two unique inbound pages: ${weakContent.length}`,
  '',
  '## Weakly Linked Content',
  '',
  '| Route | Unique inbound pages | Unique outbound pages |',
  '| --- | ---: | ---: |',
  ...weakContent.map((row) => `| ${row.route} | ${row.inbound} | ${row.outbound} |`),
  '',
  '## Missing Targets',
  '',
  ...(missing.length
    ? ['| Source | Target |', '| --- | --- |', ...missing.map((row) => `| ${row.sourceRoute} | ${row.targetRoute} |`)]
    : ['None.']),
  '',
];

await mkdir(path.join(root, 'reports'), { recursive: true });
await writeFile(path.join(root, 'reports', 'internal-link-audit-latest.md'), lines.join('\n'), 'utf8');

console.log(`Checked ${pages.size} HTML pages; ${weakContent.length} content pages have at most two unique inbound pages; ${missing.length} targets are missing.`);
if (missing.length) process.exitCode = 1;
