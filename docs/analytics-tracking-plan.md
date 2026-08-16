# Analytics Tracking Plan

## Event contract

| Event | Trigger | Required parameters |
| --- | --- | --- |
| `affiliate_click` | Click to an affiliate retailer | `page_path`, `page_type`, `partner`, `product_id`, `brand`, `link_url`, `cta_position` |
| `commerce_outbound_click` | Click to a retailer without a verified commission relationship | `page_path`, `page_type`, `partner`, `link_url`, `cta_position` |
| `product_table_click` | Click in a comparison table | Above plus `table_name`, `row_position` |
| `newsletter_signup` | Kit form submission attempt | `page_path`, `form_location`, `form_id`, `signup_status` |
| `newsletter_signup_confirmed` | A browser with a recent pending Kit submission reaches the site-owned confirmation page | `page_path`, `form_id`, `signup_status`, `confirmation_method` |
| `planner_cta_clicked` | Click from a buyer guide into the first-10 planning pilot | `page_path`, `cta_position`, `campaign`, `link_url` |
| `sauna_planner_started` | First project-planner interaction | `page_path` |
| `sauna_planner_completed` | Local project brief generated | `page_path`, `project_location`, `heat_type`, `budget_range`, `timeline`, `acquisition_source` |
| `lead_form_started` | First interaction with the optional manual-review contact step | `page_path`, `acquisition_source` |
| `lead_form_submission_intent` | Visitor explicitly opens a prefilled email; does not prove it was sent | `page_path`, `cta_position` |
| `lead_submitted` | Lead API confirms a successful D1 receipt | `page_path`, `partner_sharing_consent`, `acquisition_source` |
| `partner_inquiry_started` | Visitor opens the partnership email action; does not prove it was sent | `page_path`, `cta_position` |
| `advertise_page_view` | View of partner page | `page_path`, `traffic_source` |
| `calculator_completed` | Valid result generated | `page_path`, `calculator`, `result_band` |
| `comparison_tool_used` | Valid comparison rendered | `page_path`, `product_count`, `category` |
| `email_click` | Tagged newsletter click | `campaign`, `link_type`, `destination_path` |
| `dealer_outbound_click` | Click to dealer | `page_path`, `partner`, `dealer`, `cta_position`, `cta_location`, `link_url` |
| `installer_outbound_click` | Click to installer | `page_path`, `installer`, `cta_location` |

Use snake_case. Every site-owned event also receives `site_name=backyard_sauna_pro` and `site_hostname`. Never place email, phone, name, ZIP, free text, or full lead details in GA.

## Current-state corrections

- `affiliate_click` exists globally and is useful as a funnel diagnostic. It does not prove a sale, a lead, or attributable revenue and should remain an ordinary event rather than a GA4 key event.
- The global `window.gtag` function is initialized before site-owned listeners. A prior module-scoped helper allowed pageviews but caused every listener guarded by `window.gtag` to exit without recording its event.
- `newsletter_signup` fires on form submit with `signup_status=attempted` and stores a non-identifying pending marker in that browser for up to 30 days. The Kit double-opt-in confirmation redirects to `/newsletter/confirmed/`, which emits `newsletter_signup_confirmed` only when it can consume that marker. Refreshes and direct visits no longer inflate the key event. Cross-device confirmations can be missed, so Kit remains the source of truth for subscriber totals.
- Creating a sauna brief remains browser-local. The separate review form sends a minimal consented project request to Cloudflare D1. `lead_submitted` fires only after the API confirms receipt. `acquisition_source` carries the guide CTA's `utm_content`, never a homeowner identifier.
- The partnership CTA similarly records `partner_inquiry_started`, not a submitted inquiry.
- Cross-check retailer and affiliate dashboards because browser events do not prove attributed sales.

## Property isolation

The Backyard Sauna Pro source uses measurement ID `G-0F814NTT5J`. GA data previously showed a Sproutful Minds path in this property, but no Sproutful route exists in this repository. The most likely cause is that another site deployed the same measurement ID. This code now adds `site_name` and `site_hostname` to site-owned events, while standard GA page views already include hostname. The actual cross-site contamination must be fixed in the other site's deployed tag or by separating data streams; changing Backyard Sauna Pro's correct ID would not remove the source of the contamination.

## KPI dashboard specification

Weekly views should cover traffic, audience, affiliate, lead, and sponsorship KPIs defined in the project brief. Every card must show source, period, comparison period, and data freshness. Revenue and conversions should reconcile to the affiliate or partner system rather than GA alone.

## QA

Use GA DebugView and browser network inspection on staging or local preview. Test one event per CTA type, confirm parameter names, ensure no PII, verify mobile behavior, then compare daily event counts with outbound click logs and affiliate dashboards. The build regression check must also confirm that `window.gtag` is present in generated HTML and that all three pilot guides contain the `planner_first_10` campaign marker.

## GA4 key-event configuration

Live property review on August 15, 2026 showed these recent events marked as key events:

- `affiliate_click`
- `newsletter_signup_confirmed`

`affiliate_click` should be unmarked after owner approval because an outbound retailer click is not a completed business outcome. Keep recording it as an ordinary event and reconcile it with retailer and affiliate dashboards.

Keep `newsletter_signup_confirmed` as a key event. Mark `lead_submitted` as a key event only after the live lead API produces the first successful D1 receipt and the event appears in GA4. A database receipt, not a local planner completion or form-submit signal, is the lead source of truth. Mark `purchase` only if a controlled checkout integration sends a documented purchase event. Do not mark calculator completions, attempted newsletter submits, planner completions, or email-link opens as completed business outcomes.
