# Security pass - 2026-10-30

Updated the lead API to stop reading bodies after 20 KB, reject null and
non-object JSON, and send nosniff/no-referrer headers. Existing consent,
honeypot, duplicate, ZIP and rate-limit behavior remains covered by tests.
Deployed API version: 98dd5108-5d7f-4712-9993-486e106b4f91.
Rollback version: a9c5953b-75c5-4746-bd65-c478c19809e0.
Live checks: health 200, malformed payload 400, oversized payload 413.
No real homeowner record or email was created by these checks.

Updated only undici and zod in the dependency lockfile within compatible ranges.
npm audit reports zero known vulnerabilities after updating. Twelve worker
tests and the full build/122-page checks passed. No Sun Home content changed.

Remaining: verify account MFA, rotate previously shared credentials, review
Cloudflare abuse controls and backup restoration. GitHub Pages does not apply
_headers; site-level response headers require a supported host/proxy change.
Do not treat this limited pass as a penetration test or security guarantee.

Sources: OWASP REST Security Cheat Sheet and Cloudflare Workers header docs.
