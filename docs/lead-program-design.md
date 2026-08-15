# Sauna Planning Lead Program

## Goal

Help a homeowner organize a sauna project and, after explicit consent and manual review, introduce qualified buyers to relevant dealers or installers. The planner is not engineering, permit, electrical, medical, or safety approval.

## Intake fields

- First name and email
- Phone, optional during the pilot
- ZIP code
- Indoor, outdoor, or undecided
- Traditional, infrared, steam, or undecided
- Available dimensions and number of users
- Budget range
- Purchase timeline
- New construction or existing space
- Electrical panel information, if known
- Installation help needed
- Delivery restrictions
- Product preferences
- Optional project photo
- Consent to be contacted by Backyard Sauna Pro
- Separate consent to share the submission with relevant partners

Do not request payment data, government identifiers, health information, precise income, or unnecessary household details.

## Status model

`new`, `needs_review`, `qualified`, `missing_information`, `sent_to_partner`, `accepted_by_partner`, `contacted`, `quoted`, `closed`, `rejected`, `duplicate`

## Quality score

Score 0-100 for triage, not for automated rejection:

| Dimension | Points | Rule |
| --- | ---: | --- |
| Geography | 20 | Partner serves the ZIP or a viable national-shipping path exists |
| Budget | 20 | Budget matches the requested project class |
| Timeline | 15 | Within 90 days earns full points; exploratory earns fewer |
| Completeness | 15 | Core fields and dimensions are usable |
| Installation readiness | 10 | Site, power, access, or contractor needs are understood |
| Product intent | 10 | Buyer has a clear category or comparison need |
| Contact validity | 10 | Email is valid; phone adds confidence when supplied |

Suggested review bands: `75-100` high priority, `50-74` nurture or request details, `<50` manual review. Never share solely because a score threshold was met.

## Routing

1. Save the submission securely.
2. Deduplicate by normalized email, phone, ZIP, and recent project details.
3. Confirm contact consent and partner-sharing consent separately.
4. Manually review fit, completeness, and conflicts.
5. Select at most a small number of relevant partners based on geography and project type.
6. Record exactly what was shared, with whom, when, and why.
7. Ask the partner to update acceptance, contact, quote, and close outcomes.
8. Stop sharing when consent is withdrawn.

## Pilot workflow and CRM

Use a restricted spreadsheet or lightweight CRM with one row per lead, immutable source/timestamp fields, consent timestamps, assigned reviewer, partner history, and outcome. Limit access to the owner and specifically approved operators. Do not expose lead data in the static site repository or analytics.

## Commercial models to validate later

- Flat fee for an accepted qualified lead
- Fee for a completed appointment or quote
- Affiliate or revenue share on a completed sale
- Geographic or category sponsorship with a quality floor

Do not set pricing until the pilot measures acceptance rate, quote rate, close rate, and partner economics.

## Launch gates

- Owner-approved privacy and consent language
- Secure form processor and restricted storage
- Spam protection, rate limiting, validation, and retention policy
- At least one approved partner with documented coverage and follow-up expectations
- Test submissions verified end to end
- Manual review remains mandatory until quality is proven

## Current implementation boundary

The `/sauna-planner` route creates its initial brief entirely in the browser. A separate review form can submit the contact and project fields to the `backyard-sauna-leads` Cloudflare Worker, which validates the request and stores it in a restricted D1 database. A successful database write returns a receipt ID and triggers the non-PII `lead_submitted` analytics event.

The API records contact consent and optional partner-sharing consent separately. It does not automatically send or sell a lead, and it exposes no public lead-reading endpoint. Manual review remains mandatory. Photo upload, automated CRM routing, automated partner distribution, and customer-facing accounts remain unimplemented.
