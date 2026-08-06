import { promises as fs } from 'node:fs';
import path from 'node:path';

const sourceRoot = path.resolve('src');
const outputPath = path.resolve('data/affiliate-link-inventory.csv');

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
  if (host === 'amazon.com') return url.includes('tag=backyardsauna-20') ? ['affiliate', 'amazon', 'verified_parameter'] : ['affiliate', 'amazon', 'missing_tag'];
  if (host === 'selectsaunas.com') return url.includes('sca_ref=') ? ['affiliate', 'select_saunas', 'verified_parameter'] : ['affiliate', 'select_saunas', 'missing_referral'];
  if (host === 'sunhomesaunas.com') return ['affiliate_protected', 'sun_home', 'do_not_change'];
  if (host === 'redwoodoutdoors.com') return ['commerce_outbound', 'redwood_outdoors', 'relationship_unverified'];
  if (host === 'finnishsaunabuilders.com') return ['dealer_outbound', 'finnish_sauna_builders', 'relationship_unverified'];
  return null;
}

const rows = [];
for (const file of await listFiles(sourceRoot)) {
  const source = await fs.readFile(file, 'utf8');
  for (const match of source.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/g)) {
    const result = classify(match[1]);
    if (!result) continue;
    const line = source.slice(0, match.index).split('\n').length;
    rows.push({
      source_file: path.relative(process.cwd(), file).replaceAll('\\', '/'),
      source_line: line,
      url: match[1],
      classification: result[0],
      partner: result[1],
      audit_status: result[2],
    });
  }
}

rows.sort((a, b) => a.source_file.localeCompare(b.source_file) || a.source_line - b.source_line);
const header = ['source_file', 'source_line', 'url', 'classification', 'partner', 'audit_status'];
const content = [header.join(','), ...rows.map((row) => header.map((key) => csv(row[key])).join(','))].join('\n') + '\n';
await fs.writeFile(outputPath, content, 'utf8');

const failures = rows.filter((row) => row.audit_status === 'missing_tag' || row.audit_status === 'missing_referral');
console.log(`Audited ${rows.length} commerce links; ${failures.length} verified-parameter failures.`);
if (failures.length) {
  for (const failure of failures) console.error(`${failure.source_file}:${failure.source_line} ${failure.audit_status}`);
  process.exitCode = 1;
}
