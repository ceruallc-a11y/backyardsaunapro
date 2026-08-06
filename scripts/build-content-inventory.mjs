import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pagesRoot = path.join(root, 'src', 'pages');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

function csv(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value !== '')) records.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    records.push(row);
  }
  if (records.length < 2) return [];

  const [headers, ...values] = records;
  return values.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])));
}

async function readCsv(relativePath) {
  try {
    return parseCsv(await readFile(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

function match(source, pattern) {
  return source.match(pattern)?.[1]?.trim() ?? '';
}

function routeFor(file) {
  const relative = path.relative(pagesRoot, file).replaceAll('\\', '/').replace(/\.astro$/, '');
  const route = relative.endsWith('/index') ? relative.slice(0, -6) : relative === 'index' ? '' : relative;
  return `https://backyardsaunapro.com/${route}`.replace(/\/$/, '') + '/';
}

function classify(file, source) {
  const normalized = file.replaceAll('\\', '/');
  if (normalized.endsWith('/best-saunas.astro')) return 'buying guide';
  if (normalized.includes('/reviews/')) return 'product review';
  if (normalized.includes('/brands/')) return normalized.endsWith('/index.astro') ? 'brand hub' : 'brand review';
  if (normalized.includes('/guides/')) {
    if (/best-|for-sale|under-|sauna-kits/.test(normalized)) return 'buying guide';
    if (/-vs-|comparison/.test(normalized)) return 'comparison';
    if (/cost|electrical|foundation|installation|assemble|build|heater-sizing/.test(normalized)) return 'planning guide';
    if (/health|pregnancy|pain|hangover|weight-loss|workout|skin|calories/.test(normalized)) return 'health information';
    return 'informational guide';
  }
  if (normalized.endsWith('/index.astro')) return 'homepage';
  return 'trust or utility page';
}

function topicFor(file) {
  const name = path.basename(file, '.astro');
  if (/heater/.test(name)) return 'heaters';
  if (/infrared/.test(name)) return 'infrared saunas';
  if (/barrel/.test(name)) return 'barrel saunas';
  if (/outdoor|backyard/.test(name)) return 'outdoor saunas';
  if (/health|pregnancy|pain|hangover|weight|workout|skin|calories/.test(name)) return 'health and use';
  if (/cost|electrical|foundation|build|assemble|insulation|ventilation|permit/.test(name)) return 'planning and installation';
  if (/accessor|stone|bucket|towel|lighting|thermometer|oil|backrest/.test(name)) return 'accessories';
  return 'general sauna';
}

function lastCommitDate(file) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

const files = (await walk(pagesRoot)).filter((file) => file.endsWith('.astro')).sort();
const sources = new Map();
for (const file of files) sources.set(file, await readFile(file, 'utf8'));
const pageComparison = await readCsv(path.join('data', 'search-console-page-28d-comparison.csv'));
const queryComparison = await readCsv(path.join('data', 'search-console-query-28d-comparison.csv'));
const pageComparisonByUrl = new Map(pageComparison.map((row) => [row.url, row]));

const incoming = new Map(files.map((file) => [routeFor(file), 0]));
for (const source of sources.values()) {
  for (const result of source.matchAll(/href=["'](\/[A-Za-z0-9_./-]+)["']/g)) {
    const normalized = `https://backyardsaunapro.com${result[1]}`.replace(/\/$/, '') + '/';
    if (incoming.has(normalized)) incoming.set(normalized, incoming.get(normalized) + 1);
  }
}

const rows = files.map((file) => {
  const source = sources.get(file);
  const url = routeFor(file);
  const title = match(source, /<Base[\s\S]*?title=["']([^"']+)["']/);
  const pageType = classify(file, source);
  const health = pageType === 'health information';
  const reviewed = source.includes('Reviewed August 2026');
  const unsupportedClaim = /actually built one|we(?:'ve| have)? tested|personally tested|written by sauna owners/i.test(source);
  const monetization = [
    source.includes('AmazonButton') && 'Amazon',
    source.includes('SunHomeButton') && 'Sun Home',
    source.includes('SelectSaunasButton') && 'Select Saunas',
    source.includes('LeadMagnetSignup') && 'Kit capture',
  ].filter(Boolean).join('; ');
  const internalOut = [...source.matchAll(/href=["']\/[A-Za-z0-9_./-]+["']/g)].length;
  const wordCount = source
    .replace(/^---[\s\S]*?---/, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[\s\S]*?\}/g, ' ')
    .match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)?.length ?? 0;

  let action = 'Await analytics data';
  let priority = 'Medium';
  let approval = 'No';
  if (file.includes(`${path.sep}sun-home-saunas-review.astro`)) {
    action = 'Protected: inspect only';
    priority = 'Protected';
    approval = 'Yes - Sun Home agreement';
  } else if (unsupportedClaim) {
    action = 'Correct unsupported firsthand/testing claim';
    priority = 'Critical';
  } else if (health && !reviewed) {
    action = 'Primary-source medical review';
    priority = 'High';
    approval = 'Yes before major medical rewrite';
  } else if (reviewed) {
    action = 'Monitor revised page indexing and engagement';
    priority = 'High';
  } else if (/buying guide|product review|brand review|comparison/.test(pageType)) {
    action = 'Validate products, methodology, CTA, and traffic';
    priority = 'High';
  }

  return {
    URL: url,
    Title: title,
    'Content type': pageType,
    'Topic cluster': topicFor(file),
    'Search intent': /buying guide|product review|brand review|comparison/.test(pageType) ? 'commercial investigation' : 'informational',
    'Buyer intent': /buying guide|product review|brand review/.test(pageType) ? 'High' : /planning guide|comparison/.test(pageType) ? 'Medium-high' : 'Low-medium',
    'Word count': wordCount,
    'Last updated': lastCommitDate(file),
    'Organic clicks': pageComparisonByUrl.get(url)?.current_clicks ?? '',
    'Organic impressions': pageComparisonByUrl.get(url)?.current_impressions ?? '',
    Backlinks: '',
    'Affiliate clicks': '',
    Revenue: '',
    'Internal links in': incoming.get(url) ?? 0,
    'Internal links out': internalOut,
    'Content-quality notes': [
      health && 'Medical-adjacent content requires primary-source review',
      unsupportedClaim && 'Contains unsupported firsthand/testing language',
      !monetization && 'No direct monetization component',
    ].filter(Boolean).join('; '),
    'Existing monetization': monetization,
    'Recommended action': action,
    Priority: priority,
    'Owner approval required': approval,
  };
});

const headers = Object.keys(rows[0]);
const output = [headers.map(csv).join(','), ...rows.map((row) => headers.map((header) => csv(row[header])).join(','))].join('\n');
await mkdir(path.join(root, 'data'), { recursive: true });
await writeFile(path.join(root, 'data', 'content-inventory.csv'), `${output}\n`, 'utf8');

const priorityHeaders = [
  'URL',
  'Page title',
  'Page type',
  'Current clicks',
  'Previous clicks',
  'Current impressions',
  'Previous impressions',
  'Average position',
  'CTR',
  'Estimated buyer intent',
  'Existing monetization',
  'Recommended action',
  'Priority',
  'Confidence level',
];
const priorityRows = rows.map((row) => {
  const comparison = pageComparisonByUrl.get(row.URL);
  const currentImpressions = Number(comparison?.current_impressions || 0);
  const previousImpressions = Number(comparison?.previous_impressions || 0);
  const lostImpressions = previousImpressions - currentImpressions;
  const dataPriority = lostImpressions >= 100 ? 'Critical' : currentImpressions >= 100 || lostImpressions >= 25 ? 'High' : row.Priority;
  return {
  URL: row.URL,
  'Page title': row.Title,
  'Page type': row['Content type'],
  'Current clicks': comparison?.current_clicks ?? '',
  'Previous clicks': comparison?.previous_clicks ?? '',
  'Current impressions': comparison?.current_impressions ?? '',
  'Previous impressions': comparison?.previous_impressions ?? '',
  'Average position': '',
  CTR: '',
  'Estimated buyer intent': row['Buyer intent'],
  'Existing monetization': row['Existing monetization'],
  'Recommended action': row['Recommended action'],
  Priority: dataPriority,
  'Confidence level': comparison ? 'Medium - Search Console 28-day comparison available; position unavailable' : 'Low - no matching Search Console row',
  };
});
const priorityOutput = [
  priorityHeaders.map(csv).join(','),
  ...priorityRows.map((row) => priorityHeaders.map((header) => csv(row[header])).join(',')),
].join('\n');
await writeFile(path.join(root, 'data', 'content-priority-score.csv'), `${priorityOutput}\n`, 'utf8');

const pageAnalysisHeaders = [
  'URL', 'Current clicks', 'Previous clicks', 'Click change', 'Current impressions',
  'Previous impressions', 'Impression change', 'Current CTR', 'Previous CTR',
  'Current position', 'Previous position', 'Recommended action', 'Notes',
];
const queryAnalysisHeaders = [
  'Query', 'Current clicks', 'Previous clicks', 'Click change', 'Current impressions',
  'Previous impressions', 'Impression change', 'Current CTR', 'Previous CTR',
  'Current position', 'Previous position', 'Landing page', 'Intent', 'Notes',
];
const pageInventoryByUrl = new Map(rows.map((row) => [row.URL, row]));
const pageAnalysisRows = pageComparison.map((comparison) => {
  const currentClicks = Number(comparison.current_clicks || 0);
  const previousClicks = Number(comparison.previous_clicks || 0);
  const currentImpressions = Number(comparison.current_impressions || 0);
  const previousImpressions = Number(comparison.previous_impressions || 0);
  const inventory = pageInventoryByUrl.get(comparison.url);
  return {
    URL: comparison.url,
    'Current clicks': currentClicks,
    'Previous clicks': previousClicks,
    'Click change': currentClicks - previousClicks,
    'Current impressions': currentImpressions,
    'Previous impressions': previousImpressions,
    'Impression change': currentImpressions - previousImpressions,
    'Current CTR': currentImpressions ? (currentClicks / currentImpressions).toFixed(4) : '',
    'Previous CTR': previousImpressions ? (previousClicks / previousImpressions).toFixed(4) : '',
    'Current position': '',
    'Previous position': '',
    'Recommended action': inventory?.['Recommended action'] ?? 'Inspect unmatched Search Console URL',
    Notes: inventory ? '' : 'URL did not match the current content inventory',
  };
});
const pageAnalysisOutput = [
  pageAnalysisHeaders.map(csv).join(','),
  ...pageAnalysisRows.map((row) => pageAnalysisHeaders.map((header) => csv(row[header])).join(',')),
].join('\n');

const queryAnalysisRows = queryComparison.map((comparison) => {
  const currentClicks = Number(comparison.current_clicks || 0);
  const previousClicks = Number(comparison.previous_clicks || 0);
  const currentImpressions = Number(comparison.current_impressions || 0);
  const previousImpressions = Number(comparison.previous_impressions || 0);
  const query = comparison.query;
  const intent = /best|buy|price|cost|review|vs|for sale|recommend/i.test(query) ? 'Commercial investigation' : 'Informational';
  return {
    Query: query,
    'Current clicks': currentClicks,
    'Previous clicks': previousClicks,
    'Click change': currentClicks - previousClicks,
    'Current impressions': currentImpressions,
    'Previous impressions': previousImpressions,
    'Impression change': currentImpressions - previousImpressions,
    'Current CTR': currentImpressions ? (currentClicks / currentImpressions).toFixed(4) : '',
    'Previous CTR': previousImpressions ? (previousClicks / previousImpressions).toFixed(4) : '',
    'Current position': '',
    'Previous position': '',
    'Landing page': '',
    Intent: intent,
    Notes: 'Position and landing-page dimensions were not included in the available comparison export',
  };
});
const queryAnalysisOutput = [
  queryAnalysisHeaders.map(csv).join(','),
  ...queryAnalysisRows.map((row) => queryAnalysisHeaders.map((header) => csv(row[header])).join(',')),
].join('\n');

await writeFile(path.join(root, 'data', 'search-console-page-analysis.csv'), `${pageAnalysisOutput}\n`, 'utf8');
await writeFile(path.join(root, 'data', 'search-console-query-analysis.csv'), `${queryAnalysisOutput}\n`, 'utf8');

console.log(`Wrote ${rows.length} inventory and priority rows, ${pageAnalysisRows.length} page analysis rows, and ${queryAnalysisRows.length} query analysis rows.`);
