import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('dist/ is missing. Run npm run build first.');
  process.exit(1);
}

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const relativeFiles = new Set(files.map((file) => `/${path.relative(dist, file).replaceAll('\\', '/')}`));
const pages = new Set();

for (const file of htmlFiles) {
  const relative = `/${path.relative(dist, file).replaceAll('\\', '/')}`;
  pages.add(relative);
  if (relative.endsWith('/index.html')) pages.add(relative.slice(0, -10));
  if (relative === '/index.html') pages.add('/');
}

const findings = [];
const titles = new Map();

const resolveLocal = (value) => {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('mailto:') || clean.startsWith('tel:') || clean.startsWith('data:') || clean.startsWith('javascript:')) return null;
  if (/^https?:\/\//i.test(clean) || clean.startsWith('//')) return null;
  return clean.startsWith('/') ? clean : null;
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const route = `/${path.relative(dist, file).replaceAll('\\', '/')}`;
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1]?.trim();

  if (!title) findings.push({ type: 'missing_title', route });
  if (!description) findings.push({ type: 'missing_description', route });
  if (!canonical) findings.push({ type: 'missing_canonical', route });

  if (title) {
    const existing = titles.get(title);
    if (existing) findings.push({ type: 'duplicate_title', route, target: existing, value: title });
    else titles.set(title, route);
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const local = resolveLocal(match[1]);
    if (!local) continue;
    const candidates = [local, `${local.replace(/\/$/, '')}/index.html`, `${local}.html`];
    if (!candidates.some((candidate) => pages.has(candidate) || relativeFiles.has(candidate))) {
      findings.push({ type: 'broken_local_reference', route, target: local });
    }
  }
}

const counts = findings.reduce((summary, finding) => {
  summary[finding.type] = (summary[finding.type] || 0) + 1;
  return summary;
}, {});

console.log(JSON.stringify({ htmlPages: htmlFiles.length, counts, findings }, null, 2));
process.exitCode = findings.some((finding) => finding.type === 'broken_local_reference' || finding.type === 'duplicate_title') ? 1 : 0;

