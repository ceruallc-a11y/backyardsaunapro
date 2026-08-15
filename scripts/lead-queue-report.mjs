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
    zip_region,
    project_location,
    heat_type,
    budget,
    timeline,
    installation_help,
    lead_score,
    partner_consent
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

const report = rows.map((row) => ({
  receipt_id: row.receipt_id,
  created_at: row.created_at,
  status: row.status,
  region: row.zip_region,
  location: row.project_location,
  heat: row.heat_type,
  budget: row.budget,
  timeline: row.timeline,
  installation_help: row.installation_help,
  score: row.lead_score,
  partner_consent: row.partner_consent === 1 ? 'yes' : 'no',
}));

console.log(`Lead review queue: ${report.length} item${report.length === 1 ? '' : 's'}`);
console.table(report);
console.log('Contact details remain excluded. Open the exact receipt in D1 only when manual review is required.');
