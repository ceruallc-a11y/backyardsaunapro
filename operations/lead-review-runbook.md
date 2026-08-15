# Lead Review Runbook

The `backyard-sauna-leads` Worker stores planner review requests in the restricted `backyard-sauna-leads` D1 database. The public API supports writes only. It does not expose a lead-reading route and never sends a lead to a partner automatically.

## Daily review

1. Open Cloudflare D1 and select `backyard-sauna-leads`.
2. Run the queue query below.
3. Check consent, geography, heat type, budget, timeline, and completeness.
4. Update the status and review notes.
5. Contact the homeowner from `info@backyardsaunapro.com` when clarification is needed.
6. Share with a partner only when `partner_consent = 1` and the fit has been manually verified.

```sql
SELECT
  id,
  created_at,
  status,
  first_name,
  email,
  phone,
  zip_region,
  project_location,
  heat_type,
  budget,
  timeline,
  installation_help,
  lead_score,
  partner_consent
FROM leads
WHERE status IN ('new', 'needs_review', 'missing_information')
ORDER BY created_at ASC;
```

## Status update

Use the exact receipt ID and one allowed status:

```sql
UPDATE leads
SET status = 'qualified',
    review_notes = 'Fit confirmed; awaiting owner-approved introduction.',
    updated_at = datetime('now')
WHERE id = '<receipt-id>';
```

Allowed statuses are `new`, `needs_review`, `qualified`, `missing_information`, `sent_to_partner`, `accepted_by_partner`, `contacted`, `quoted`, `closed`, `rejected`, and `duplicate`.

## Finn Sauna pilot fit

- Full installation: prioritize New Hampshire, Vermont, Massachusetts, and individually confirmed areas of Maine, Connecticut, or Rhode Island.
- National path: kit purchase or consulting may fit outside the installation territory.
- Infrared: confirm fit with Bruce before referring.
- Never share when `partner_consent = 0`.
- Record the partner and timestamp only after the introduction is actually made.

```sql
UPDATE leads
SET status = 'sent_to_partner',
    assigned_partner = 'Finn Sauna',
    partner_sent_at = datetime('now'),
    updated_at = datetime('now')
WHERE id = '<receipt-id>'
  AND partner_consent = 1;
```

## Privacy and cleanup

Review retention manually at least monthly. Do not run bulk deletion without owner approval. Deletion requests should use the exact receipt ID or a verified email and remove only the confirmed matching submission. Do not export lead data into the public repository, analytics, or ordinary outreach trackers.
