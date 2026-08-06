# Affiliate Revenue Audit

Verified August 5, 2026. Dashboard figures are a point-in-time snapshot, not a forecast.

## Confirmed performance

### Amazon Associates

- Store ID: `backyardsauna-20`.
- July 6 through August 4: 64 clicks, 4 ordered and shipped items, 6.25% conversion, $61.83 shipped revenue, and $1.82 earnings.
- No returns appeared in that period.
- The current-month view separately showed 27 clicks and no ordered items or earnings.
- Site links include the store tag and a page-level `ascsubtag`, so the next bottleneck is qualified click volume and product mix rather than a broken account connection.

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
- Redwood Outdoors links now emit `commerce_outbound_click` until a commission-bearing relationship is verified.
- Finnish Sauna Builders links now emit `dealer_outbound_click`; the source contains no referral parameter.
- Unverified Redwood Outdoors $250-off claims were removed from buyer-facing pages.
- Every commerce event now includes a stable `page_type` in addition to partner, URL, CTA position, and product ID.

## Revenue priorities

1. Increase qualified Amazon clicks from commercial pages already receiving impressions.
2. Obtain Select Saunas dashboard access and reconcile its referral code against clicks and sales.
3. Reapply to or confirm Redwood Outdoors before restoring affiliate or coupon language.
4. Treat Finnish Sauna Builders as a partnership or dealer-lead prospect until written terms exist.
5. Review earnings by page and subtag weekly; do not rank products by commission alone.

## Owner-review checkpoints

- Do not change, contact, or renegotiate Sun Home without specific owner approval.
- Do not restore promotion language from memory. Require written current terms.
- Do not call a retailer click affiliate revenue unless a dashboard or contract confirms attribution.
