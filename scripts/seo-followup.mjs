import { promises as fs } from 'node:fs';
import path from 'node:path';

const urls = [
  'https://backyardsaunapro.com/guides/outdoor-sauna-buying-checklist/',
  'https://backyardsaunapro.com/guides/best-barrel-saunas-cold-climates/',
  'https://backyardsaunapro.com/guides/best-location-backyard-sauna/',
  'https://backyardsaunapro.com/guides/how-to-build-a-sauna/',
  'https://backyardsaunapro.com/guides/sauna-health-benefits/',
  'https://backyardsaunapro.com/guides/sauna-during-pregnancy/',
  'https://backyardsaunapro.com/guides/sauna-for-weight-loss/',
  'https://backyardsaunapro.com/guides/sauna-for-back-pain/',
];

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

const checkedAt = new Date();
const rows = [];
for (const url of urls) {
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
    rows.push({ url, status: response.status, finalUrl: response.url, canonical, title, ok: response.ok && canonical === url && Boolean(title) });
  } catch (error) {
    rows.push({ url, status: 0, finalUrl: '', canonical: '', title: '', ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

const lines = [
  '# SEO Follow-up Monitor',
  '',
  `Checked: ${checkedAt.toISOString()}`,
  '',
  '| URL | HTTP | Canonical | Title | Result |',
  '| --- | ---: | --- | --- | --- |',
  ...rows.map((row) => `| ${row.url} | ${row.status || 'error'} | ${row.canonical || '-'} | ${(row.title || row.error || '-').replaceAll('|', '\\|')} | ${row.ok ? 'PASS' : 'REVIEW'} |`),
  '',
  'Search Console index coverage is reviewed separately because it requires authenticated property data. Manual indexing requests for these URLs were submitted on August 5, 2026.',
  '',
];

await fs.mkdir(path.resolve('reports'), { recursive: true });
await fs.writeFile(path.resolve('reports/seo-followup-latest.md'), lines.join('\n'), 'utf8');
console.log(`Checked ${rows.length} priority URLs; ${rows.filter((row) => !row.ok).length} need review.`);
if (rows.some((row) => !row.ok)) process.exitCode = 1;
