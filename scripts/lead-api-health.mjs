const siteOrigin = 'https://backyardsaunapro.com';
const apiOrigin = (process.env.LEAD_API_BASE_URL || 'https://backyard-sauna-leads.adunyadeth.workers.dev').replace(/\/$/, '');

let response;
try {
  response = await fetch(`${apiOrigin}/health`, {
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'application/json',
      Origin: siteOrigin,
      'User-Agent': 'BackyardSaunaPro-Monitor/1.0',
    },
  });
} catch (error) {
  console.error(`Lead API health check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const payload = await response.json().catch(() => null);
const allowOrigin = response.headers.get('access-control-allow-origin');
const cacheControl = response.headers.get('cache-control') || '';
const failures = [];

if (response.status !== 200) failures.push(`HTTP ${response.status}`);
if (payload?.ok !== true || payload?.service !== 'backyard-sauna-leads') failures.push('unexpected response body');
if (allowOrigin !== siteOrigin) failures.push(`CORS origin ${allowOrigin || 'missing'}`);
if (!cacheControl.toLowerCase().includes('no-store')) failures.push(`cache-control ${cacheControl || 'missing'}`);

if (failures.length > 0) {
  console.error(`Lead API health check failed: ${failures.join('; ')}`);
  process.exit(1);
}

console.log(`Lead API health check passed for ${apiOrigin}.`);
