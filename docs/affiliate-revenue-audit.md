# Affiliate Revenue Audit

Verified October 6, 2026. Dashboard figures are point-in-time snapshots, not forecasts. GA4 and Amazon use different reporting windows, so their click totals are not directly interchangeable.

## Confirmed performance

### Amazon Associates

- Store ID: `backyardsauna-20`.
- September 6 through October 5: 35 clicks, 2 ordered and shipped items, 5.71% conversion, $189.94 shipped revenue, and $5.70 earnings.
- No returns appeared in that period.
- Low-volume privacy controls hid the linked-product and top-seller rows, so the report did not identify which links or products produced the two orders.
- Site links still include the store tag and a page-level `ascsubtag`. Amazon is producing revenue, so generic Amazon routes should not be removed in bulk without product-level evidence.

### GA4 affiliate events

- September 8 through October 5: 8 `affiliate_click` events from 6 users.
- Partner split: Select Saunas 7 events from 5 users; Amazon 1 event from 1 user.
- The Amazon event was for `barrel sauna cover outdoor waterproof`. Select Saunas clicks were concentrated on current sauna product listings.
- GA4 is useful for page, CTA, partner, and product context, but it undercounted Amazon relative to the Associates report. Browser privacy controls, tag blocking, and the two-day reporting-window difference can all contribute. Amazon remains the revenue source of truth.

### Select Saunas

- The public program currently states a 5% commission.
- Site links include the existing `sca_ref=10752576.S2huPg7gFg` referral value.
- The affiliate dashboard was not authenticated during this audit, so clicks, orders, attribution window, and payout status remain unverified.

### Impact.com

- The authenticated account showed only the protected Sun Home relationship, with 5% online-sale terms and a 30-day referral period.
- The latest two-week overview contained no reportable metrics, pending earnings, or balance.
- No Redwood Outdoors relationship was visible. The global Impact tag may still have historical or protected use, so it was not removed or changed.

## Corrections made

- Amazon, Select Saunas, and protected Sun Home links continue to emit `affiliate_click`.
- The generic Amazon search route for the 15-minute wooden sauna sand timer was replaced with a verified direct Select Saunas product page. The site had no recorded GA4 click for that route in the reviewed period, while Select Saunas direct product links received 7 of 8 recorded affiliate clicks.
- Redwood Outdoors links now emit `commerce_outbound_click` until a commission-bearing relationship is verified.
- Finnish Sauna Builders links now emit `dealer_outbound_click`; the source contains no referral parameter.
- Unverified Redwood Outdoors $250-off claims were removed from buyer-facing pages.
- Every commerce event now includes a stable `page_type` in addition to partner, URL, CTA position, and product ID.
- Commerce events now request beacon transport and include `link_domain`, reducing avoidable loss during outbound navigation while preserving Amazon and retailer reports as the revenue source of truth.
- The best-home-sauna guide now sends Pinnacle buyers to one exact current product page instead of offering both an exact route and a generic barrel-sauna collection.
- Generic portable-infrared Amazon searches were replaced with focused on-site comparisons. The exact SereneLife Amazon listing remains because Amazon produced confirmed orders and the product route was recently verified.

## Revenue priorities

1. Keep Amazon routes that have exact listings or no proven better retailer match; Amazon generated two orders in the latest 30-day period.
2. Replace a generic Amazon search only when an exact, current direct-retailer product page is verified and the route has weak or no GA4 engagement.
3. Obtain Select Saunas dashboard access and reconcile its referral code against clicks and sales.
4. Reapply to or confirm Redwood Outdoors before restoring affiliate or coupon language.
5. Treat Finnish Sauna Builders as a partnership or dealer-lead prospect until written terms exist.
6. Review earnings by page and subtag monthly; do not rank products by commission alone.

The first post-change comparison is scheduled for October 20, 2026. See `operations/revenue-sprint-2026-10-06.md` for the baseline and decision rules.

## Owner-review checkpoints

- Do not change, contact, or renegotiate Sun Home without specific owner approval.
- Do not restore promotion language from memory. Require written current terms.
- Do not call a retailer click affiliate revenue unless a dashboard or contract confirms attribution.
