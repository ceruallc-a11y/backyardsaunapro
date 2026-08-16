import { promises as fs } from 'node:fs';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const outputPath = path.resolve('data/affiliate-link-inventory.csv');
const commerceRoutes = JSON.parse(
  await fs.readFile(path.resolve('src/data/product-commerce-routes.json'), 'utf8'),
);
const amazonTag = 'backyardsauna-20';
const selectSaunasRef = '10752576.S2huPg7gFg';
const maxRouteAgeDays = 30;

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  }));
  return nested.flat().filter((file) => /\.(astro|html|md|mdx)$/.test(file));
}

function csv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function classify(url) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  if (host === 'amazon.com') return url.includes(`tag=${amazonTag}`) ? ['affiliate', 'amazon', 'verified_parameter'] : ['affiliate', 'amazon', 'missing_tag'];
  if (host === 'selectsaunas.com') return url.includes('sca_ref=') ? ['affiliate', 'select_saunas', 'verified_parameter'] : ['affiliate', 'select_saunas', 'missing_referral'];
  if (host === 'sunhomesaunas.com') return ['affiliate_protected', 'sun_home', 'do_not_change'];
  if (host === 'redwoodoutdoors.com') return ['commerce_outbound', 'redwood_outdoors', 'relationship_unverified'];
  if (host === 'finnishsaunabuilders.com') return ['dealer_outbound', 'finnish_sauna_builders', 'relationship_unverified'];
  return null;
}

function appendParameter(url, key, value) {
  const parsed = new URL(url);
  parsed.searchParams.set(key, value);
  return parsed.toString();
}

function resolveAsin(asin, slug) {
  const route = commerceRoutes[asin];
  const ascsubtag = `bsp_${slug}`;
  if (route?.mode === 'select_saunas') {
    return {
      url: appendParameter(route.url, 'sca_ref', selectSaunasRef),
      classification: 'affiliate',
      partner: 'select_saunas',
      audit_status: 'verified_alternate',
      observed_status: route.observedStatus,
      last_checked: route.lastChecked,
    };
  }
  if (route?.mode === 'amazon_search') {
    const url = new URL('https://www.amazon.com/s');
    url.searchParams.set('k', route.query);
    url.searchParams.set('tag', amazonTag);
    url.searchParams.set('ascsubtag', ascsubtag);
    return {
      url: url.toString(),
      classification: 'affiliate',
      partner: 'amazon',
      audit_status: 'availability_search',
      observed_status: route.observedStatus,
      last_checked: route.lastChecked,
    };
  }
  const url = new URL(`https://www.amazon.com/dp/${asin}`);
  url.searchParams.set('tag', amazonTag);
  url.searchParams.set('ascsubtag', ascsubtag);
  return {
    url: url.toString(),
    classification: 'affiliate',
    partner: 'amazon',
    audit_status: route?.observedStatus === 'available' ? 'checked_available' : 'exact_product_unverified',
    observed_status: route?.observedStatus ?? '',
    last_checked: route?.lastChecked ?? '',
  };
}

const rows = [];
for (const file of await listFiles(sourceRoot)) {
  const source = await fs.readFile(file, 'utf8');
  const stringConstants = new Map(
    [...source.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*["'](https?:\/\/[^"']+)["']\s*;/g)]
      .map((match) => [match[1], match[2]]),
  );
  for (const match of source.matchAll(/\b(?:href|selectUrl|selectSaunasHref)\s*:\s*["'](https:\/\/selectsaunas\.com\/[^"']+)["']/g)) {
    const line = source.slice(0, match.index).split('\n').length;
    rows.push({
      source_file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      source_line: line,
      source_kind: 'select_saunas_data',
      product_id: new URL(match[1]).pathname.split('/').filter(Boolean).at(-1) ?? '',
      url: appendParameter(match[1], 'sca_ref', selectSaunasRef),
      classification: 'affiliate',
      partner: 'select_saunas',
      audit_status: 'verified_component',
      observed_status: '',
      last_checked: '',
    });
  }
  for (const match of source.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/g)) {
    const result = classify(match[1]);
    if (!result) continue;
    const line = source.slice(0, match.index).split('\n').length;
    rows.push({
      source_file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      source_line: line,
      source_kind: 'literal_url',
      product_id: '',
      url: match[1],
      classification: result[0],
      partner: result[1],
      audit_status: result[2],
      observed_status: '',
      last_checked: '',
    });
  }

  for (const match of source.matchAll(/<SelectSaunasButton\b[^>]*\bhref\s*=\s*(?:["']([^"']+)["']|\{([A-Za-z_$][\w$]*)\})[^>]*\/>/g)) {
    const baseUrl = match[1] || stringConstants.get(match[2]);
    if (!baseUrl) continue;
    const line = source.slice(0, match.index).split('\n').length;
    rows.push({
      source_file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      source_line: line,
      source_kind: 'select_saunas_component',
      product_id: new URL(baseUrl).pathname.split('/').filter(Boolean).at(-1) ?? '',
      url: appendParameter(baseUrl, 'sca_ref', selectSaunasRef),
      classification: 'affiliate',
      partner: 'select_saunas',
      audit_status: 'verified_component',
      observed_status: '',
      last_checked: '',
    });
  }

  for (const match of source.matchAll(/<SelectSaunasButton\b[^>]*\bcollection\s*=\s*["']([^"']+)["'][^>]*\/>/g)) {
    const line = source.slice(0, match.index).split('\n').length;
    rows.push({
      source_file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      source_line: line,
      source_kind: 'select_saunas_collection',
      product_id: match[1],
      url: appendParameter(`https://selectsaunas.com/collections/${match[1]}`, 'sca_ref', selectSaunasRef),
      classification: 'affiliate',
      partner: 'select_saunas',
      audit_status: 'verified_component',
      observed_status: '',
      last_checked: '',
    });
  }

  for (const match of source.matchAll(/\basin\s*(?:=|:)\s*["']([A-Z0-9]{10})["']/g)) {
    const line = source.slice(0, match.index).split('\n').length;
    const relativeFile = path.relative(process.cwd(), file).replaceAll('\\', '/');
    const slug = path.basename(file, path.extname(file)).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    rows.push({
      source_file: relativeFile,
      source_line: line,
      source_kind: 'amazon_asin',
      product_id: match[1],
      ...resolveAsin(match[1], slug),
    });
  }
}

rows.sort((a, b) => a.source_file.localeCompare(b.source_file) || a.source_line - b.source_line);
const header = ['source_file', 'source_line', 'source_kind', 'product_id', 'url', 'classification', 'partner', 'audit_status', 'observed_status', 'last_checked'];
const content = [header.join(','), ...rows.map((row) => header.map((key) => csv(row[key])).join(','))].join('\n') + '\n';
await fs.writeFile(outputPath, content, 'utf8');

const failures = rows.filter((row) =>
  row.audit_status === 'missing_tag'
  || row.audit_status === 'missing_referral'
  || ['unavailable', 'not_found', 'no_featured_offer'].includes(row.observed_status) && row.audit_status === 'checked_available'
);
const now = Date.now();
for (const [asin, route] of Object.entries(commerceRoutes)) {
  const checkedAt = Date.parse(`${route.lastChecked ?? ''}T00:00:00Z`);
  const ageDays = Number.isFinite(checkedAt) ? Math.floor((now - checkedAt) / 86_400_000) : Infinity;
  if (ageDays > maxRouteAgeDays) {
    failures.push({
      source_file: 'src/data/product-commerce-routes.json',
      source_line: '',
      product_id: asin,
      audit_status: 'stale_product_route',
    });
  }
}
const asinRows = rows.filter((row) => row.source_kind === 'amazon_asin');
const uniqueAsins = new Set(asinRows.map((row) => row.product_id));
console.log(`Audited ${rows.length} commerce references, including ${asinRows.length} ASIN placements across ${uniqueAsins.size} products; ${failures.length} routing or freshness failures.`);
if (failures.length) {
  for (const failure of failures) console.error(`${failure.source_file}:${failure.source_line} ${failure.product_id ?? ''} ${failure.audit_status}`.trim());
  process.exitCode = 1;
}
