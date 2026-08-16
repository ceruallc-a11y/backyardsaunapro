const productionOrigin = 'https://backyardsaunapro.com';
const indexNowKey = 'd7bb5a63-4dfa-41df-b13a-c8cc2f33e2a2';
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const dryRun = process.env.INDEXNOW_DRY_RUN === '1';

async function fetchText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'BackyardSaunaPro-IndexNow/1.0' },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

const sitemapIndex = await fetchText(`${productionOrigin}/sitemap-index.xml`);
const sitemapUrls = sitemapLocations(sitemapIndex);
if (!sitemapUrls.length) throw new Error('No sitemap files were found in the sitemap index.');

const urls = new Set();
for (const sitemapUrl of sitemapUrls) {
  const parsedSitemapUrl = new URL(sitemapUrl, productionOrigin);
  if (parsedSitemapUrl.origin !== productionOrigin) {
    throw new Error(`Refusing sitemap from another origin: ${parsedSitemapUrl.href}`);
  }

  const sitemap = await fetchText(parsedSitemapUrl.href);
  for (const location of sitemapLocations(sitemap)) {
    const url = new URL(location, productionOrigin);
    if (url.origin !== productionOrigin) {
      throw new Error(`Refusing URL from another origin: ${url.href}`);
    }
    urls.add(url.href);
  }
}

if (!urls.size) throw new Error('No URLs were found in the published sitemaps.');
if (urls.size > 10000) throw new Error(`IndexNow accepts at most 10,000 URLs; found ${urls.size}.`);

const payload = {
  host: new URL(productionOrigin).hostname,
  key: indexNowKey,
  keyLocation: `${productionOrigin}/${indexNowKey}.txt`,
  urlList: [...urls],
};

if (dryRun) {
  console.log(`IndexNow dry run passed for ${payload.urlList.length} published URLs.`);
} else {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'user-agent': 'BackyardSaunaPro-IndexNow/1.0',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  if (![200, 202].includes(response.status)) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`IndexNow returned ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  console.log(`IndexNow accepted ${payload.urlList.length} published URLs with HTTP ${response.status}.`);
}
