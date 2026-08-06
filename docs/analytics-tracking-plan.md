# Analytics Tracking Plan

## Event contract

| Event | Trigger | Required parameters |
| --- | --- | --- |
| `affiliate_click` | Click to an affiliate retailer | `page_path`, `page_type`, `partner`, `product`, `brand`, `link_url`, `cta_position` |
| `commerce_outbound_click` | Click to a retailer without a verified commission relationship | `page_path`, `page_type`, `partner`, `link_url`, `cta_position` |
| `product_table_click` | Click in a comparison table | Above plus `table_name`, `row_position` |
| `newsletter_signup` | Kit form submission attempt | `page_path`, `form_location`, `form_id`, `signup_status` |
| `newsletter_signup_confirmed` | Kit double-opt-in confirmation redirects to the site-owned confirmation page | `page_path`, `form_id`, `signup_status` |
| `sauna_planner_started` | First project-planner interaction | `page_path` |
| `sauna_planner_completed` | Local project brief generated | `page_path`, `project_location`, `heat_type`, `budget_range`, `timeline` |
| `lead_form_submission_intent` | Visitor explicitly opens a prefilled email; does not prove it was sent | `page_path`, `cta_position` |
| `partner_inquiry_started` | Visitor opens the partnership email action; does not prove it was sent | `page_path`, `cta_position` |
| `advertise_page_view` | View of partner page | `page_path`, `traffic_source` |
| `calculator_completed` | Valid result generated | `page_path`, `calculator`, `result_band` |
| `comparison_tool_used` | Valid comparison rendered | `page_path`, `product_count`, `category` |
| `email_click` | Tagged newsletter click | `campaign`, `link_type`, `destination_path` |
| `dealer_outbound_click` | Click to dealer | `page_path`, `dealer`, `cta_location` |
| `installer_outbound_click` | Click to installer | `page_path`, `installer`, `cta_location` |

Use snake_case. Every site-owned event also receives `site_name=backyard_sauna_pro` and `site_hostname`. Never place email, phone, name, ZIP, free text, or full lead details in GA.

## Current-state corrections

- `affiliate_click` exists globally but needs validated conversion reporting and a stable `page_type` value.
- `newsletter_signup` fires on form submit with `signup_status=attempted`. The Kit double-opt-in confirmation redirects to `/newsletter/confirmed/`, which emits `newsletter_signup_confirmed`; only the latter is a GA4 key event.
- The sauna planner stores nothing and only generates a browser-local brief. `lead_form_submission_intent` means the email action was opened; it is not a server-confirmed lead.
- The partnership CTA similarly records `partner_inquiry_started`, not a submitted inquiry.
- Cross-check retailer and affiliate dashboards because browser events do not prove attributed sales.

## Property isolation

The Backyard Sauna Pro source uses measurement ID `G-0F814NTT5J`. GA data previously showed a Sproutful Minds path in this property, but no Sproutful route exists in this repository. The most likely cause is that another site deployed the same measurement ID. This code now adds `site_name` and `site_hostname` to site-owned events, while standard GA page views already include hostname. The actual cross-site contamination must be fixed in the other site's deployed tag or by separating data streams; changing Backyard Sauna Pro's correct ID would not remove the source of the contamination.

## KPI dashboard specification

Weekly views should cover traffic, audience, affiliate, lead, and sponsorship KPIs defined in the project brief. Every card must show source, period, comparison period, and data freshness. Revenue and conversions should reconcile to the affiliate or partner system rather than GA alone.

## QA

Use GA DebugView and browser network inspection on staging or local preview. Test one event per CTA type, confirm parameter names, ensure no PII, verify mobile behavior, then compare daily event counts with outbound click logs and affiliate dashboards.

## GA4 key-event configuration

Verified August 5, 2026 in property `backyardsaunapro.com`:

- `affiliate_click`
- `newsletter_signup_confirmed`
- `sauna_planner_completed`
- `calculator_completed`

Do not mark attempted newsletter submits or email-link opens as completed leads.
