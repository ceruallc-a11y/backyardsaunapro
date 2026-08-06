# Backyard Sauna Pro: Traffic-Decline Analysis

Status: measured from live Google Search Console and GA4

Audit date: 2026-08-05

## Executive conclusion

The decline is real and is primarily a ranking/visibility problem, not just a drop in search demand. In Search Console, the latest three months produced 6,576 impressions and 2 clicks versus 8,579 impressions and 4 clicks in the previous three months. Impressions fell 23.3%, while average position worsened from 51.9 to 64.6.

The latest 28 days are more stable: 1,661 impressions versus 1,778 in the previous 28 days, a 6.6% decline, while average position improved slightly from 67.3 to 66.5. This suggests the sharpest loss happened earlier in the 90-day window, but recovery has not yet produced clicks.

Confidence: high for the Search Console trend; medium for GA4 behavior because the property contains cross-site data.

## Search Console scorecard

| Period | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Latest 28 days | 0 | 1,661 | 0% | 66.5 |
| Previous 28 days | 0 | 1,778 | 0% | 67.3 |
| Latest 3 months | 2 | 6,576 | displayed as 0% | 64.6 |
| Previous 3 months | 4 | 8,579 | displayed as 0% | 51.9 |

## Pages driving the 90-day change

Largest losses:

| Page | Impression change | Interpretation |
| --- | ---: | --- |
| `/guides/best-indoor-sauna-kits` | -1,916 | Slashless URL lost visibility; must be evaluated with its slash variant. |
| `/guides/best-home-sauna/` | -1,286 | High-value commercial page and the clearest standalone loss. |
| `/brands/redwood-outdoors-sauna-review/` | -484 | Commercial brand-review loss; preserve all Sun Home obligations while reviewing this unrelated page. |
| `/guides/how-to-build-a-sauna/` | -243 | Informational page disappeared from current-period impressions. |
| `/guides/best-portable-sauna/` | -112 | Commercial page remains visible but declined. |

Largest gains:

| Page | Impression change | Interpretation |
| --- | ---: | --- |
| `/guides/best-indoor-sauna-kits/` | +1,299 | Slash variant gained while slashless variant lost; combined net change is -617. |
| `/guides/best-2-person-outdoor-sauna/` | +872 | Strongest clean commercial growth opportunity. |
| Homepage | +174 | More visibility, but no current-period click. |
| `/guides/best-sauna-backrest/` | +168 | Slash variant gained while slashless variant lost 200 impressions. |
| `/guides/outdoor-vs-indoor-sauna/` | +69 | Emerging comparison topic. |

## Query diagnosis

The latest 28-day losses are concentrated around indoor-sauna intent: `indoor sauna kits` (-98 impressions), `indoor sauna` (-88), `portable saunas` (-58), and `home sauna indoor` (-47). Gains are concentrated around `outdoor vs indoor sauna` (+43), `best portable infrared sauna` (+40), and two-person outdoor sauna variants.

This supports two immediate content priorities:

1. Repair and improve the indoor-sauna cluster without creating additional overlapping pages.
2. Protect and monetize the growing two-person outdoor, portable, and indoor-versus-outdoor clusters.

## Canonical and redirect verification

Search Console reports both slash and slashless versions for at least:

- `best-indoor-sauna-kits`
- `best-sauna-backrest`
- `sauna-during-pregnancy`

Live browser verification on August 5 confirmed that all three tested slashless URLs redirect to their trailing-slash versions and that each destination declares the matching trailing-slash canonical. The HTTP homepage also redirects to HTTPS with the correct canonical. The Search Console split is therefore historical residue, not evidence of a currently broken redirect.

The visibility movement between variants still exaggerates individual page gains and losses. Combine variants when diagnosing historical performance, and do not create additional redirect changes from the Search Console table alone.

## Indexing and sitemap status

Search Console's page-indexing report was last updated July 23 and reports:

- 21 indexed pages
- 20 not-indexed pages
- 13 `Crawled - currently not indexed`
- 7 `Page with redirect`

The submitted sitemap index is healthy: `https://backyardsaunapro.com/sitemap-index.xml` was last read July 28 with status `Success` and 112 discovered pages.

This mismatch is now the highest-priority SEO bottleneck. Google has discovered the site's broad inventory through the sitemap but currently reports a much smaller indexed set.

The 13 crawled-but-not-indexed examples contain two distinct groups:

- Eight canonical content URLs: sauna health benefits, pregnancy, barrel saunas for cold climates, outdoor buying checklist, weight loss, backyard location, how to build a sauna, and sauna for back pain.
- Five historical slashless URLs that now redirect correctly: assemble-barrel-sauna, the guides hub, sauna privacy screen, the outdoor checklist, and the reviews hub.

The five redirecting examples are stale report residue. The eight canonical pages need quality, safety, overlap, and internal-link review before requesting reindexing. Several are health/YMYL topics, so stronger evidence and conservative claims matter more than word count.

## GA4 behavior and measurement quality

For July 8 through August 4, GA4 reports:

- 399 views
- 301 active users
- 1.33 views per active user
- 31 seconds average engagement per active user
- 1,383 events
- 0 key events
- $0 tracked revenue

Top visible session sources were direct (202 sessions), Bing organic (42), DuckDuckGo organic (30), ChatGPT (29), Yahoo organic (13), Ecosia organic (5), and Gmail referral (4). Google organic was not present in the visible leading sources, which is consistent with Search Console's near-zero clicks.

The most-viewed pages included the homepage (47 views), sauna foundation guide (28), best portable sauna (13), best-saunas hub (10), and Finnleo review (10).

GA4 is not currently clean enough for site-level attribution. The report contains `/screen-free-starter-bundle`, a Sproutful Minds route, proving that another site is sending data into this property or stream. Until hostname separation is repaired, GA4 totals must be treated as contaminated. This is a measurement defect, not a traffic conclusion.

## Monetization diagnosis

The site has measurable readership but no tracked key events or revenue. Affiliate clicks may exist as ordinary outbound events, but they are not visible as a reliable conversion KPI in the current report. The immediate revenue bottleneck is therefore twofold:

1. Buyer-intent pages are receiving impressions but almost no Google clicks.
2. GA4 cannot currently prove affiliate, newsletter, or lead conversion.

## Highest-priority recovery actions

1. Inspect the 13 crawled-but-not-indexed URLs and classify quality, overlap, canonical, and internal-link causes.
2. Separate Backyard Sauna Pro and Sproutful Minds Analytics collection by measurement ID or enforce a clean hostname boundary.
3. Update `best-home-sauna` first: it lost 1,286 impressions and is commercially important.
4. Audit the combined indoor-sauna cluster and consolidate intent without adding new overlapping pages.
5. Improve `best-2-person-outdoor-sauna` conversion and snippet quality while its impressions are growing.
6. Refresh `best-portable-sauna` and preserve the emerging portable-infrared query gains.
7. Add verified `affiliate_click`, `newsletter_signup`, and `lead_form_submitted` key events.
8. Investigate why `how-to-build-a-sauna` has zero current-period impressions.
9. Review mobile versus desktop before any broad content pruning.
10. Reconcile GA outbound events with Amazon, Impact, Select Saunas, and other partner reports.

## Data files

- `data/search-console-page-analysis.csv`: 24 page rows regenerated from the available latest-versus-previous 28-day comparison.
- `data/search-console-query-analysis.csv`: 390 query rows regenerated from the available latest-versus-previous 28-day comparison.
- `data/search-console-page-28d-comparison.csv`: 24 page rows for latest versus previous 28 days.
- `data/search-console-query-28d-comparison.csv`: 390 query rows for latest versus previous 28 days.
- `data/analytics-pages-28d.csv`: 104 GA4 page rows for July 8 through August 4.
- `data/search-console-crawled-not-indexed.csv`: the 13 example URLs and last crawl dates.

## Remaining evidence gaps

- Search Console device, country, search-appearance, indexing, sitemap, and link exports.
- Clean GA4 hostname-specific landing-page and acquisition reports.
- Affiliate-platform clicks, orders, commissions, and sub-ID data.
- Kit subscriber and form performance.

Do not redirect, delete, noindex, publish, send outreach, or change Sun Home surfaces without owner approval.

## Export retention note

The aggregate three-month diagnosis above is retained from the verified Search Console review. Its earlier row-level derived CSV was overwritten by the first version of the inventory generator and no local duplicate was found. The generator has been corrected and the 28-day source exports remain intact. Refresh the three-month page and query exports from the authorized Cerua Search Console profile before making consolidation, redirect, deletion, or noindex decisions.
