# First 10 Sauna Project Briefs Pilot

## Goal

Acquire and manually review the first 10 complete homeowner sauna project briefs. Learn whether the brief is useful to buyers and potential dealer or installer partners before introducing paid lead routing.

The pilot does not promise 10 leads by a certain date. It creates the acquisition, review, consent, and measurement loop needed to earn them.

## Acquisition paths

The primary CTA appears on:

- `/guides/best-home-sauna/`
- `/guides/best-2-person-outdoor-sauna/`
- `/guides/best-portable-sauna/`

Each CTA links to `/sauna-planner/` with:

- `utm_source=buyer_guide`
- `utm_medium=site`
- `utm_campaign=planner_first_10`
- A page-specific `utm_content` value

Supporting traffic can come from the newsletter, internal links, direct sharing, and approved partner referrals. Do not buy traffic until the form completion rate and brief quality are known.

## Buyer promise

- The first 10 complete briefs receive a free manual next-step review.
- The brief remains in the visitor's browser until they choose to email it.
- Nothing is sent to a dealer or installer without separate, explicit consent.
- The review is planning guidance, not engineering, electrical, code, medical, or legal advice.

## Intake and logging

1. Monitor `info@backyardsaunapro.com` for subject lines beginning with `Sauna project brief`.
2. Add a row to `operations/lead-pilot.csv` only after a real brief arrives.
3. Use a non-identifying internal `lead_id`; do not place email, phone, ZIP, or free text in analytics.
4. Set status to `new`, then review for completeness and duplicate submissions.
5. Reply from `info@backyardsaunapro.com` within two business days.

## Manual quality gate

A brief is `qualified` only when it has enough information to recommend a next planning step:

- Region or ZIP is present.
- Indoor or outdoor placement is stated.
- Heat type is selected or marked undecided.
- Available dimensions are usable or explicitly unknown.
- Budget range and purchase timeline are present.
- Electrical readiness and installation needs are addressed.
- Contact information appears valid.

Incomplete briefs receive one concise request for the missing information. Do not route them to a partner.

## Consent and routing

The current form creates an email to Backyard Sauna Pro; it does not grant partner-sharing consent. Before any routing:

1. Identify a relevant partner with confirmed geography and project criteria.
2. Explain the partner's identity and what information would be shared.
3. Ask the homeowner for explicit written consent.
4. Record `consent_to_share=yes`, the partner, and the sent date.
5. Share only the information needed for that introduction.

No bulk lead sale, automatic distribution, or multi-partner broadcast is permitted during the pilot.

## Follow-up cadence

- Day 0: Acknowledge the brief and state the review window.
- By day 2: Send the manual next-step review or request missing details.
- Day 7 after an approved introduction: Ask whether the partner made contact.
- Day 21: Record quote status if the homeowner voluntarily provides it.
- Day 45: Close the pilot record as `closed`, `rejected`, or `no response`.

## Measurement

Track:

- `planner_cta_clicked`
- `sauna_planner_started`
- `sauna_planner_completed`
- `lead_form_submission_intent`
- Actual briefs received in `operations/lead-pilot.csv`
- Complete and qualified brief rates
- Consent-to-share rate
- Partner acceptance, contact, quote, and close rates

Analytics events are funnel signals, not proof of a received lead. The inbox and lead CSV are the source of truth.

## Pilot decision

After 10 real briefs, review:

- Which guide and traffic source generated them.
- Which fields buyers skipped or misunderstood.
- How many were complete, qualified, and consented to sharing.
- Whether partners found the briefs useful.
- Whether any introduction reached a quote or sale.

Only then decide whether to automate intake, add secure storage, charge per qualified lead, or pursue a recurring dealer arrangement.
