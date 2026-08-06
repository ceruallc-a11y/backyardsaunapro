# SEO Monitoring

Eight revised URLs were submitted manually to Google Search Console on August 5, 2026. Each submission confirmed that the URL was added to a priority crawl queue.

## Automated weekly checks

The `Weekly revenue and SEO monitor` GitHub Actions workflow runs every Monday and can also be started manually. It:

1. Checks HTTP status, final URL, canonical, and title for the eight priority pages.
2. Regenerates the commerce-link classification inventory.
3. Uploads both reports as a workflow artifact.

It does not publish, send email, change affiliate links, or request indexing.

## Authenticated follow-up

Review Search Console around August 12 and August 19 for:

- Index status and selected canonical.
- Impressions, clicks, CTR, and average position.
- Whether the eight revised URLs move from discovered or crawled-not-indexed into indexed coverage.
- Query movement for pages ranking positions 4 through 20.

Do not repeatedly submit the same URL when no material page change has occurred. Indexing requests do not guarantee inclusion.
