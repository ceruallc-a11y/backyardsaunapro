# Buyer-Intent Revenue Sprint

Start date: October 6, 2026  
First comparison date: October 20, 2026

## Goal

Increase useful buyer actions from the three commercial pages already earning the most relevant search visibility. The sprint does not add bulk content, change protected Sun Home material, or rank products by commission.

## Pages

| Page | Current 28-day impressions | Change | Current clicks | Starting action |
| --- | ---: | ---: | ---: | --- |
| `/guides/best-2-person-outdoor-sauna/` | 508 | +171 | 0 | Improve snippet clarity, recheck direct listings, and add a second planner path |
| `/guides/best-home-sauna/` | 329 | +112 | 0 | Remove the duplicate generic Pinnacle route, use exact retailer destinations, and add a second planner path |
| `/guides/best-portable-sauna/` | 231 | +31 | 0 | Keep the exact Amazon product, remove unproven generic Amazon searches, and route comparison intent to focused guides |

Search Console did not include reliable average-position or page-query joins in the available comparison export. Do not treat zero clicks as a snippet-only problem.

## Revenue baseline

Amazon Associates, September 6 through October 5:

- 35 clicks
- 2 ordered and shipped items
- 5.71% conversion
- $189.94 shipped revenue
- $5.70 earnings

GA4, September 8 through October 5:

- 8 `affiliate_click` events from 6 users
- 7 Select Saunas events
- 1 Amazon event

Amazon remains the revenue source of truth. GA4 is the page, product, partner, and CTA diagnostic. The windows differ, and client-side analytics can be blocked.

## Changes in this sprint

- Preserve the Amazon store tag `backyardsauna-20` and exact product links with recent order evidence.
- Add beacon transport plus link-domain context to commerce events.
- Add explicit partner, route type, product, and CTA-position metadata to Select Saunas buttons.
- Use exact current retailer product pages instead of a duplicate generic collection route.
- Replace unsupported portable-infrared Amazon search fallbacks with focused internal comparison paths.
- Add a second sauna-planner invitation near the end of each target page.
- Leave Sun Home copy, destinations, and placement unchanged.

## October 20 review

Compare the following against the baseline above:

1. Search Console impressions and clicks for each target page.
2. GA4 `affiliate_click` by `page_path`, `partner`, `product_id`, and `cta_position`.
3. `planner_cta_clicked`, `lead_form_started`, and server-confirmed `lead_submitted` by acquisition source.
4. Amazon clicks, ordered items, shipped revenue, and earnings for a matching 14-day window.
5. Select Saunas clicks and orders if dashboard access is available.

Keep a change only when it improves a meaningful buyer action or preserves a clearer decision path. Do not infer a winner from a handful of impressions or one click.
