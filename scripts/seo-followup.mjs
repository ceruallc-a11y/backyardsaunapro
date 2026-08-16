import { promises as fs } from 'node:fs';
import path from 'node:path';

const productionOrigin = 'https://backyardsaunapro.com';
const monitorOrigin = (process.env.SEO_MONITOR_BASE_URL || productionOrigin).replace(/\/$/, '');
const targets = [
  { path: '/guides/outdoor-sauna-buying-checklist/', plannerSource: 'outdoor_buying_checklist_after_intro' },
  { path: '/guides/best-barrel-saunas-cold-climates/', plannerSource: 'cold_climate_barrel_after_disclosure' },
  { path: '/guides/best-location-backyard-sauna/', plannerSource: 'backyard_sauna_location_after_scope' },
  { path: '/guides/how-to-build-a-sauna/', plannerSource: 'sauna_build_guide_after_scope' },
  { path: '/guides/sauna-health-benefits/' },
  { path: '/guides/sauna-during-pregnancy/' },
  { path: '/guides/sauna-for-weight-loss/' },
  { path: '/guides/sauna-for-back-pain/' },
];

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

const checkedAt = new Date();
const sitemapPaths = new Set();
let sitemapError = '';

try {
  const sitemapIndexResponse = await fetch(`${monitorOrigin}/sitemap-index.xml`, {
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'BackyardSaunaPro-Monitor/1.0' },
  });
  if (!sitemapIndexResponse.ok) throw new Error(`sitemap index returned ${sitemapIndexResponse.status}`);
  const sitemapIndex = await sitemapIndexResponse.text();
  const sitemapLocations = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());

  for (const sitemapLocation of sitemapLocations) {
    const sitemapPath = new URL(sitemapLocation, productionOrigin).pathname;
    const sitemapResponse = await fetch(`${monitorOrigin}${sitemapPath}`, {
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'BackyardSaunaPro-Monitor/1.0' },
    });
    if (!sitemapResponse.ok) throw new Error(`${sitemapPath} returned ${sitemapResponse.status}`);
    const sitemap = await sitemapResponse.text();
    for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      sitemapPaths.add(new URL(match[1].trim(), productionOrigin).pathname);
    }
  }
} catch (error) {
  sitemapError = error instanceof Error ? error.message : String(error);
}

const rows = [];
for (const target of targets) {
  const url = `${monitorOrigin}${target.path}`;
  const expectedCanonical = `${productionOrigin}${target.path}`;
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'BackyardSaunaPro-Monitor/1.0' },
    });
    const html = await response.text();
    const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
      || extract(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const title = extract(html, /<title>([^<]+)<\/title>/i);
    const robots = extract(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
      || extract(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
    const xRobotsTag = response.headers.get('x-robots-tag') || '';
    const indexable = !`${robots},${xRobotsTag}`.toLowerCase().includes('noindex');
    const inSitemap = sitemapPaths.has(target.path);
    const plannerPath = !target.plannerSource || html.includes(`data-cta-position="${target.plannerSource}"`);
    const ok = response.ok
      && canonical === expectedCanonical
      && Boolean(title)
      && indexable
      && inSitemap
      && plannerPath;
    rows.push({
      url: expectedCanonical,
      status: response.status,
      finalUrl: response.url,
      canonical,
      title,
      indexable,
      inSitemap,
      plannerPath,
      ok,
    });
  } catch (error) {
    rows.push({
      url: expectedCanonical,
      status: 0,
      finalUrl: '',
      canonical: '',
      title: '',
      indexable: false,
      inSitemap: sitemapPaths.has(target.path),
      plannerPath: false,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const lines = [
  '# SEO Follow-up Monitor',
  '',
  `Checked: ${checkedAt.toISOString()}`,
  `Origin tested: ${monitorOrigin}`,
  '',
  '| URL | HTTP | Canonical | Indexable | Sitemap | Planner path | Result |',
  '| --- | ---: | --- | --- | --- | --- | --- |',
  ...rows.map((row) => `| ${row.url} | ${row.status || 'error'} | ${row.canonical || '-'} | ${row.indexable ? 'yes' : 'no'} | ${row.inSitemap ? 'yes' : 'no'} | ${row.plannerPath ? 'yes' : 'no'} | ${row.ok ? 'PASS' : 'REVIEW'} |`),
  '',
  ...(sitemapError ? [`Sitemap review failed: ${sitemapError}`, ''] : []),
  'Search Console index coverage is reviewed separately because it requires authenticated property data. A manual indexing request does not prove that Google indexed a page.',
  '',
];

await fs.mkdir(path.resolve('reports'), { recursive: true });
await fs.writeFile(path.resolve('reports/seo-followup-latest.md'), lines.join('\n'), 'utf8');
console.log(`Checked ${rows.length} priority URLs; ${rows.filter((row) => !row.ok).length} need review.`);
if (rows.some((row) => !row.ok)) process.exitCode = 1;
