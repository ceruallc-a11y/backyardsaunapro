# Automation Plan

All automation creates drafts, alerts, or internal records. Publishing, sending, lead sharing, recommendations, sponsorship acceptance, redirects, deletion, and legal changes require human approval.

| Automation | Trigger | Inputs | Process | Output | Approval | Failure handling / security |
| --- | --- | --- | --- | --- | --- | --- |
| Broken affiliate-link monitor | Weekly | Published outbound URLs | Check status, redirect destination, and domain | Review queue | Human before replacement | Rate limit; log errors; never follow authenticated links |
| Product-change alert | Weekly | Maintained product source list | Compare title, availability, specs, and visible price language | Diff report | Human verifies source | Store only public data; mark blocked pages unknown |
| Content staleness report | Weekly | Inventory, review dates, traffic | Rank high-intent stale pages | Priority list | Human selects work | Preserve protected-placement flags |
| Search anomaly report | Weekly | GSC export/API | Compare 7/28/90-day clicks, impressions, CTR, position | Alert with affected URLs/queries | Human diagnoses | Stop when data incomplete; never invent cause |
| KPI report | Weekly | GA, GSC, affiliate, Kit, lead CRM | Reconcile and summarize | Draft report | Owner reviews | Mark missing sources and freshness |
| Lead dedupe/score | New submission | Restricted lead store | Normalize and calculate review score | Review queue | Human before sharing/rejecting | Encrypt, restrict access, log consent and access |
| Partner research draft | Prospect added | Public company data | Gather fit and contact evidence | Prospect record | Human approves accuracy | Cite source URL and date; no scraping behind login |
| Outreach draft | Prospect approved | Prospect record, site metrics | Draft personalized note | Unsent draft | Owner sends | No automated sending; no unverified metrics |
| Newsletter draft | Scheduled editorial review | Approved sources/content | Assemble draft and disclosures | Unsent draft | Owner approves platform and send | Link check, claims review, unsubscribe/footer check |
| Internal-link suggestions | Content change | Site graph and intent map | Rank relevant contextual links | Suggestions | Editor approves | Exclude protected copy and prevent circular spam |

## Logging

Each run records timestamp, version, input freshness, items scanned, items changed, exceptions, approval state, and operator. Secrets belong in provider secret storage, never the repository or logs.

