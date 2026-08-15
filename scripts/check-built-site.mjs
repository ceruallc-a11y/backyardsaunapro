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
const findings = [];

for (const file of htmlFiles) {
  const relative = `/${path.relative(dist, file).replaceAll('\\', '/')}`;
  pages.add(relative);
  if (relative.endsWith('/index.html')) pages.add(relative.slice(0, -10));
  if (relative === '/index.html') pages.add('/');
}

const requiredMarkers = [
  {
    file: 'index.html',
    pattern: /window\.gtag\s*=/,
    label: 'globally available GA event function',
  },
  {
    file: 'guides/best-home-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-home-sauna planner campaign',
  },
  {
    file: 'guides/best-2-person-outdoor-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-2-person planner campaign',
  },
  {
    file: 'guides/best-portable-sauna/index.html',
    pattern: /planner_first_10/,
    label: 'best-portable planner campaign',
  },
  {
    file: null,
    pattern: /backyard-sauna-leads\.adunyadeth\.workers\.dev\/v1\/leads/,
    label: 'server-backed planner endpoint',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="location"[^>]*required[^>]*>[\s\S]*?<option>Unsure<\/option>/,
    label: 'planner unsure location option',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="region"[^>]*required/,
    label: 'required planner ZIP or region field',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="contactConsent"[^>]*required/,
    label: 'required review contact consent',
  },
  {
    file: 'sauna-planner/index.html',
    pattern: /name="partnerConsent"/,
    label: 'separate optional partner-sharing consent',
  },
  {
    file: null,
    pattern: /window\.gtag\(["']event["'],["']lead_submitted["']/,
    label: 'server-confirmed lead analytics event',
  },
  {
    file: 'index.html',
    pattern: /localStorage\.setItem\(["']bsp_newsletter_signup_pending["']/,
    label: 'pending newsletter signup state',
  },
  {
    file: 'newsletter/confirmed/index.html',
    pattern: /localStorage\.getItem\([^)]*\)[\s\S]*confirmation_method:["']pending_browser_signup["']/,
    label: 'pending-state newsletter confirmation guard',
  },
  {
    file: 'guides/best-home-sauna/index.html',
    pattern: /sun-home-equinox-2-person-full-spectrum-infrared-sauna/,
    label: 'protected Sun Home Equinox destination',
  },
  {
    file: 'guides/best-2-person-outdoor-sauna/index.html',
    pattern: /2-person-outdoor-infrared-sauna/,
    label: 'protected Sun Home Luminar destination',
  },
];

for (const marker of requiredMarkers) {
  const content = marker.file
    ? (fs.existsSync(path.join(dist, marker.file)) ? fs.readFileSync(path.join(dist, marker.file), 'utf8') : '')
    : files.filter((file) => file.endsWith('.js')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  if (!marker.pattern.test(content)) {
    findings.push({ type: 'missing_required_marker', route: marker.file ? `/${marker.file}` : '/assets/*.js', value: marker.label });
  }
}

const staleClaims = [
  ['guides/best-2-person-outdoor-sauna/index.html', 'best 2-person sauna under $1,000 full stop'],
  ['guides/best-2-person-outdoor-sauna/index.html', "Most experienced sauna users wish they'd sized up"],
  ['guides/best-home-sauna/index.html', '$700-$1,500 for a plug-in infrared unit'],
];

for (const [relative, claim] of staleClaims) {
  const file = path.join(dist, relative);
  const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (html.toLowerCase().includes(claim.toLowerCase())) {
    findings.push({ type: 'stale_claim', route: `/${relative}`, value: claim });
  }
}

const titles = new Map();
const commerceRoutes = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/product-commerce-routes.json'), 'utf8'),
);
const retiredDirectAmazonAsins = Object.entries(commerceRoutes)
  .filter(([, route]) => route.mode !== 'amazon_exact')
  .map(([asin]) => asin);

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

  for (const asin of retiredDirectAmazonAsins) {
    if (html.includes(`amazon.com/dp/${asin}`)) {
      findings.push({ type: 'retired_direct_amazon_link', route, value: asin });
    }
  }

  if (html.includes('data-link-mode="availability_search"') && !html.includes('Compare Current Amazon Listings')) {
    findings.push({ type: 'misleading_availability_cta', route });
  }

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
process.exitCode = findings.some((finding) => [
  'broken_local_reference',
  'duplicate_title',
  'missing_required_marker',
  'stale_claim',
  'retired_direct_amazon_link',
  'misleading_availability_cta',
].includes(finding.type)) ? 1 : 0;
