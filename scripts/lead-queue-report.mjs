const ACCOUNT_ID = '5d58b26991d451f0b107b110e2ffab64';
const DATABASE_ID = '8e4c18e0-dc05-48fb-8aaf-0dd30aa11d9c';
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();

if (!token) {
  console.error('CLOUDFLARE_API_TOKEN is required. Set it only in your current shell, then rerun npm run leads:queue.');
  process.exit(1);
}

const sql = `
  SELECT
    id AS receipt_id,
    created_at,
    status,
    project_location,
    heat_type,
    expected_users,
    budget,
    timeline,
    project_type,
    electrical_status,
    installation_help,
    lead_score,
    partner_consent,
    acquisition_source
  FROM leads
  WHERE status IN ('new', 'needs_review', 'missing_information', 'qualified')
  ORDER BY
    CASE status
      WHEN 'new' THEN 0
      WHEN 'needs_review' THEN 1
      WHEN 'missing_information' THEN 2
      ELSE 3
    END,
    created_at ASC
  LIMIT 50;
`;

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sql }),
});

const payload = await response.json().catch(() => null);

if (!response.ok || !payload?.success) {
  const details = payload?.errors?.map((error) => error.message).filter(Boolean).join('; ');
  console.error(`Cloudflare D1 query failed (${response.status})${details ? `: ${details}` : '.'}`);
  process.exit(1);
}

const rows = payload.result?.[0]?.results ?? [];

if (rows.length === 0) {
  console.log('Lead review queue is empty.');
  process.exit(0);
}

const now = Date.now();
const report = rows.map((row) => ({
  receipt_id: row.receipt_id,
  created_at: row.created_at,
  age_hours: Math.max(0, Math.floor((now - Date.parse(`${row.created_at}Z`)) / 3_600_000)),
  status: row.status,
  priority: row.lead_score >= 60 || row.timeline === 'Within 30 days'
    ? 'urgent'
    : row.lead_score >= 45 || row.timeline === '1-3 months'
      ? 'high'
      : 'normal',
  location: row.project_location,
  heat: row.heat_type,
  users: row.expected_users,
  budget: row.budget,
  timeline: row.timeline,
  project_type: row.project_type,
  electrical: row.electrical_status,
  installation_help: row.installation_help,
  score: row.lead_score,
  partner_consent: row.partner_consent === 1 ? 'yes' : 'no',
  source: row.acquisition_source,
}));

for (const row of report) {
  row.review_window = row.age_hours >= 72
    ? 'stale_72h'
    : row.age_hours >= 24
      ? 'overdue_24h'
      : 'due_today';
}

console.log(`Lead review queue: ${report.length} item${report.length === 1 ? '' : 's'}`);
const countBy = (items, keyFor) => items.reduce((counts, item) => {
  const key = keyFor(item);
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});
const priorityCounts = countBy(report, (row) => row.priority);
const sourceCounts = countBy(report, (row) => row.source || 'direct');
const reviewWindowCounts = countBy(report, (row) => row.review_window);
console.log(`Review priority: ${Object.entries(priorityCounts).map(([key, count]) => `${key}=${count}`).join(', ')}`);
console.log(`Review timing: ${Object.entries(reviewWindowCounts).map(([key, count]) => `${key}=${count}`).join(', ')}`);
console.log(`Acquisition sources: ${Object.entries(sourceCounts).map(([key, count]) => `${key}=${count}`).join(', ')}`);
console.table(report);
if (reviewWindowCounts.stale_72h || reviewWindowCounts.overdue_24h) {
  console.warn('Review warning: at least one lead has waited more than 24 hours. Open only the listed receipts needed for manual review.');
}
console.log('Names, contact details, ZIP or region, and project notes remain excluded. Open the exact receipt in D1 only when manual review is required.');
