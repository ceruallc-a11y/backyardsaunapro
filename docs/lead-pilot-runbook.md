# Qualified Lead Pilot Runbook

## Current safe mode

The live planner keeps answers in the visitor's browser and generates a project brief. The visitor can voluntarily open an email to request a manual review. The site does not store, sell, or automatically route homeowner information.

The planner assigns a local readiness band:

- High: budget and timeline are actionable, with most site and utility details present.
- Medium: the project is plausible but important quote inputs remain.
- Early: the visitor should use the checklist and cost calculator before contacting sellers.

Only the coarse readiness band is sent to GA. Names, emails, phone numbers, ZIP codes, dimensions, and free text are never sent to analytics.

## Manual intake workflow

1. Receive the project brief at the publication inbox.
2. Create one row in `operations/lead-pilot.csv` without copying unnecessary free text.
3. Check contact validity, budget, timeline, geographic fit, dimensions, utilities, and installation need.
4. Mark missing information and ask the homeowner directly if clarification is required.
5. Do not share the lead until a partner agreement and buyer consent language are approved.
6. Record every status change and outcome so lead quality can be measured honestly.

## Pilot gates

Before any partner routing begins, require:

- A named partner and written geographic/project criteria.
- Approved privacy and consent language naming the sharing purpose.
- A secure storage system with access control and retention limits.
- A manual review checkpoint.
- A feedback loop for contacted, quoted, closed, rejected, and duplicate leads.

## Initial success criteria

- Ten genuine homeowner requests reviewed manually.
- At least 80% contain budget, timeline, location type, and contactable email.
- No lead is shared without documented consent.
- Partner acceptance, quote, and close outcomes can be reconciled before charging for leads.
