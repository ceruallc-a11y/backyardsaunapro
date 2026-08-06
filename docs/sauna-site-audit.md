# Backyard Sauna Pro: Repository and Business Audit

Audit date: 2026-08-05

Scope: local `master` checkout, production homepage, current public partner links, and the Google session available in the requested Chrome profile. No production changes were made. Sun Home pages, links, assets, tracking, and commercial terms are protected by owner instruction and were inspected read-only.

## Executive summary

Backyard Sauna Pro is a functioning static Astro publication with 112 generated routes, a working Vercel-oriented build, valid local links, Amazon/Impact/Select Saunas monetization, and Kit email capture. The immediate constraint is not lack of content. It is weak evidence and trust infrastructure around a large, rapidly created content library, incomplete conversion paths, and unavailable traffic/conversion data in the currently signed-in Google account.

The site should not receive another broad content expansion until Search Console and Analytics data identify which pages and queries have actually lost traffic. The safest near-term work is to correct unsupported firsthand/testing claims, repair privacy and disclosure language, add a documented editorial methodology, establish reliable conversion tracking, and build sponsor and buyer-lead pathways with manual review.

## 1. Current architecture

- Framework: Astro 5.17 with Tailwind CSS 4 through Vite.
- Rendering: static site generation.
- Hosting configuration: Vercel (`vercel.json`) with `dist` as the output directory. The exact production-project linkage was not verified in this audit.
- Repository: GitHub remote `ceruallc-a11y/backyardsaunapro`, branch `master`.
- Deployment assumption: Git-based Vercel deployment is strongly indicated by the repository and Vercel configuration, but should be confirmed before publishing.
- Content storage: 112 hand-authored `.astro` page files under `src/pages`; there is no CMS or content collection.
- Page mix: 92 guide routes, 10 brand routes, 4 review routes, and 6 top-level routes.
- Shared components: affiliate buttons, product cards, advertiser disclosure, Kit newsletter form, and lead-magnet form.
- SEO infrastructure: `@astrojs/sitemap`, `robots.txt`, canonical tags through the base layout, Open Graph tags, Twitter cards, and FAQ/article structured data on many pages.
- Build verification: `npm run build` completed successfully and generated 112 routes.
- Link verification: no broken local links or missing local image references were found in the generated site.

## 2. Current monetization methods

### Affiliate revenue

- Amazon Associates tag: `backyardsauna-20`, with page-specific `ascsubtag` values.
- Impact.com STAT tag is installed globally and names Redwood Outdoors in the implementation comment.
- Select Saunas links include referral ID `10752576.S2huPg7gFg`.
- Sun Home placements use the existing product URLs and code `BSP`. These are protected and must not be changed without explicit owner approval.
- Finnish Sauna Builders is linked, but the repository does not show an affiliate parameter for that destination.
- `affiliate_click` is sent to GA4 for recognized partner domains.

### Email capture

- Kit form ID `9452008` is used in the footer and lead-magnet components.
- The offer is an outdoor-sauna buying checklist.
- A direct ungated HTML version is publicly available, so the email offer currently has limited exclusivity.
- No welcome-sequence source, newsletter landing page, segmentation question, or documented send process exists in this repository.

### Sponsorships and leads

- A standalone `public/media-kit.html` exists but is not a normal site route and appears orphaned from navigation.
- There is no `/advertise`, `/partners`, `/sauna-planner`, `/get-matched`, or installer/dealer intake flow.
- Contact is email-only through `support@backyardsaunapro.com`.
- There is no CRM, lead store, consent record, routing workflow, or lead-outcome tracking.

## 3. Technical risks

1. The Google session available in the requested Chrome profile has no Google Analytics property access. The production tag is `G-0F814NTT5J`, but traffic and conversion data could not be validated.
2. The privacy policy says the site does not collect personal information unless provided through a contact form, but the site actively collects email addresses through Kit forms. It also predates the stated March 2026 launch.
3. The advertiser disclosure is intentionally rendered at 10px in very low-contrast text. This is difficult to notice on mobile and undermines the purpose of a clear disclosure.
4. The base layout loads third-party Impact and Google scripts on every page without an explicit consent approach or an up-to-date privacy explanation.
5. Standalone `media-kit.html` and the lead-magnet HTML have no canonical tags or shared navigation and are not part of the Astro route model.
6. The site has no automated external affiliate-link monitor. Public checks found the non-Amazon partner destination paths still live, but Amazon product availability was not exhaustively verified.
7. The README is still the default Astro starter document and does not describe deployment, integrations, environment ownership, or protected commercial relationships.
8. There is no automated test suite for metadata, analytics events, forms, affiliate parameters, or protected Sun Home behavior.

## 4. Content risks

1. Unsupported firsthand claims appear on production pages, including “written by people who've actually built one,” “the best-value infrared sauna we've tested,” and a Harvia review title claiming the heater was tested. No evidence file documents those experiences.
2. The lead magnet says it was “written by sauna owners, not salespeople.” Ownership evidence is not present in the repository.
3. The media kit says the site launched in early 2025, includes a “5K+ monthly visitors” target inside the stats grid, and asserts audience demographics, geography, device mix, purchase timing, and traffic source without source data. The owner states the site began around March 2026.
4. Ninety-eight source pages contain 2024 or 2025 dates despite the stated 2026 launch. Some may be legitimate source-publication dates, but many appear to be stale or backdated page labels.
5. Twelve health or medical-adjacent pages make strong claims. Several provide source names as plain text rather than direct citations, and some wording overstates evidence or gives prescriptive guidance. These pages require expert-source review before commercial promotion.
6. The pregnancy page attributes guidance to ACOG without a linked primary source and makes specific fetal-risk claims. This is a high-priority medical accuracy review.
7. Many “best” pages present numeric ratings and rankings without a site-wide, reproducible scoring methodology.
8. The 92-guide library includes probable intent overlap across person-count, budget, indoor/outdoor, and heater pages. Consolidation decisions require Search Console query/page data.
9. Only three high-value pages have explicit `datePublished` and `dateModified` article metadata. Most pages lack a visible review cadence.
10. The site has no dedicated correction policy, evidence policy, or transparent distinction among manufacturer claims, owner-review synthesis, and firsthand observations.

## 5. Conversion problems

1. The homepage promise centers on generic guides rather than the specific job: helping homeowners compare, plan, budget, and install a sauna.
2. The homepage presents multiple competing paths but no planner or dealer-help action for visitors closer to purchase.
3. Commercial pages do not consistently provide the same decision framework: best for, avoid if, verified specs, limitations, installation requirements, and last-reviewed date.
4. The current CTA framework records partner clicks but does not capture click value, page type, brand consistently, or lead-stage transitions.
5. Newsletter forms do not ask buyer stage or sauna type, so the list cannot yet support useful segmentation.
6. The direct checklist bypass weakens the conversion value of the email form while the copy still presents the asset as a download incentive.
7. The media kit is not discoverable through normal navigation and contains claims that should not be sent to partners.
8. There is no sponsor inquiry form, qualified buyer intake, dealer routing, or post-lead outcome loop.
9. Contact, newsletter, and commercial CTAs do not consistently expose a trustworthy editorial identity or methodology.
10. Mobile layout does not overflow, but the disclosure is barely visible and the homepage hero consumes substantial first-screen height before the buyer tool or qualification path appears.

## 6. Tracking gaps

Currently implemented:

- GA4 page views through `G-0F814NTT5J`.
- `affiliate_click` for recognized commerce domains.
- `newsletter_signup` and GA4 `generate_lead` on Kit form submission attempts.

Missing or unreliable:

- Confirmation that the production GA4 property is receiving data.
- Form-success tracking; current newsletter tracking fires on submit, not confirmed subscription success.
- `product_table_click` or equivalent comparison-table detail.
- Lead-form start/completion and qualification status.
- Partner inquiry tracking.
- Advertise-page visits.
- Calculator completion.
- Dealer and installer outbound clicks.
- Email campaign attribution and downstream revenue.
- Affiliate network revenue joined to landing page and click identifiers.
- A documented KPI owner, reporting cadence, and source-of-truth dashboard.

## 7. Ten highest-priority improvements

1. Obtain correct GA4 and Search Console access or exports, then diagnose the decline before consolidating or rewriting pages.
2. Remove or qualify every unsupported testing, ownership, firsthand-use, and “we built one” claim outside the protected Sun Home agreement.
3. Correct the privacy policy and make affiliate/advertiser disclosures clear and conspicuous.
4. Publish a transparent `/how-we-review` methodology with evidence levels and update rules.
5. Build a source-backed content inventory and use traffic data to choose keep/update/consolidate/redirect actions.
6. Standardize buyer-guide components and conversion tracking without changing protected Sun Home terms or placements.
7. Replace the inaccurate media kit with a verified `/partners` page and partner-offer document.
8. Add a manually reviewed sauna-planning lead form with explicit contact and partner-sharing consent.
9. Improve Kit capture with buyer-stage segmentation, confirmed-success tracking, and an owner-approved welcome sequence.
10. Build one low-risk utility first: an electricity-cost estimator, followed by a carefully disclaimed project-budget planner.

## 8. Changes safe to implement immediately

- Documentation, inventory generation, and tracking specifications.
- Removal of unsupported firsthand/testing language on non-Sun Home pages.
- Privacy-policy correction for Kit, GA4, and affiliate tracking.
- A more visible general affiliate disclosure.
- Editorial methodology and correction-reporting pages.
- Non-published partner offer, lead-program design, newsletter strategy, tool roadmap, and automation plan.
- Tests for internal links, metadata, analytics event names, form destinations, and protected Sun Home files.

## 9. Changes requiring owner approval or additional access

- Any change to Sun Home content, URLs, discount code, placement, tracking, or agreement language.
- Publishing or deploying any repository changes.
- Search Console and GA4 diagnosis, because the requested Chrome profile currently exposes no GA property.
- Sending newsletters, outreach, partner proposals, or sponsor reports.
- Collecting phone numbers, photos, or buyer project details before final privacy and consent language is approved.
- Sharing a homeowner lead with any dealer or installer.
- Redirecting, deleting, or noindexing existing pages before query-level evidence is available.
- Changing affiliate relationships or retailer priorities.
- Publishing traffic, audience, conversion, or revenue claims in a media kit.

## Verification record

- `npm run build`: passed; 112 Astro routes generated.
- Generated HTML audited: 114 files including two standalone public HTML assets.
- Broken local references: 0.
- Duplicate generated titles: 0 detected.
- Missing canonical/meta description: the two standalone public HTML assets only.
- Mobile homepage: no horizontal overflow observed at a narrow viewport; disclosure visibility is poor.
- Non-Amazon partner destinations: Finnish Sauna Builders, Select Saunas collections, Sun Home product pages, and Redwood Outdoors collections resolved during the audit. Sun Home was inspected read-only.
- Analytics diagnosis: blocked by account access, not inferred.

## Implementation checkpoint: August 5, 2026

Completed locally, not yet published:

- Rewrote the eight canonical crawled-but-not-indexed pages identified in Search Console. The four medical-adjacent pages now distinguish associations from causal evidence, link primary research, remove unsupported treatment and calorie claims, and include appropriate safety escalation.
- Rebuilt the four planning and buyer pages around product-specific verification, local code, manufacturer instructions, documented quotes, and qualified trades. Removed invented ratings, blanket heater upsizing, universal setback claims, and generic wiring specifications.
- Added `/newsletter`, `/sauna-planner`, and `/tools/sauna-cost-calculator` routes. The planner stores nothing and only creates a local brief; the user must explicitly choose to copy or email it.
- Added site-owned analytics parameters (`site_name` and `site_hostname`) plus honest intent events for planner, partner, contact, newsletter, affiliate, and calculator interactions. No event is labeled as a submitted lead unless a server confirms it.
- Repaired the content-inventory generator so it merges the available 28-day Search Console comparison instead of clearing analysis outputs.
- Kept all protected Sun Home files and named placement pages unchanged.

Current verification:

- `npm run build`: passed; 118 Astro routes generated.
- Generated HTML audit: 120 files, zero broken local references, zero duplicate titles, and no reported metadata findings.
- Planner and project-cost calculator: completed successfully in browser interaction tests with no console warnings or errors.
- Responsive checks: planner and cost calculator rendered without overlap or horizontal overflow at 390 by 844; revised health guide rendered correctly at 1440 by 900.
- Publication, outreach, newsletter sending, partner lead sharing, and production analytics changes remain approval-gated.
