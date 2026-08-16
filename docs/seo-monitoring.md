# SEO Monitoring

Eight revised URLs were submitted manually to Google Search Console on August 5, 2026. Each submission confirmed that the URL was added to a priority crawl queue. That is a crawl request, not proof of indexation.

Authenticated inspection on August 15, 2026 still reported `Crawled - currently not indexed` for these four buyer-intent pages:

- `/guides/outdoor-sauna-buying-checklist/`
- `/guides/best-location-backyard-sauna/`
- `/guides/best-barrel-saunas-cold-climates/`
- `/guides/how-to-build-a-sauna/`

## Automated weekly checks

The `Weekly revenue and SEO monitor` GitHub Actions workflow runs every Monday and can also be started manually. It:

1. Checks HTTP status, final URL, canonical, index directives, and sitemap inclusion for the eight priority pages.
2. Verifies the intended sauna-planner path on the four buyer-intent pages.
3. Regenerates the commerce-link classification inventory.
4. Uploads both reports as a workflow artifact.

It does not publish, send email, change affiliate links, or request indexing.

## Authenticated follow-up

Review Search Console after a material page update is live for:

- Index status and selected canonical.
- Impressions, clicks, CTR, and average position.
- Whether the eight revised URLs move from discovered or crawled-not-indexed into indexed coverage.
- Query movement for pages ranking positions 4 through 20.

Do not repeatedly submit the same URL when no material page change has occurred. Indexing requests do not guarantee inclusion.
