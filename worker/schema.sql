CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'needs_review', 'qualified', 'missing_information',
    'sent_to_partner', 'accepted_by_partner', 'contacted', 'quoted',
    'closed', 'rejected', 'duplicate'
  )),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  phone TEXT,
  zip_region TEXT NOT NULL,
  project_location TEXT NOT NULL,
  heat_type TEXT NOT NULL,
  expected_users TEXT NOT NULL,
  budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  project_type TEXT NOT NULL,
  dimensions TEXT,
  electrical_status TEXT NOT NULL,
  installation_help TEXT NOT NULL,
  notes TEXT,
  contact_consent INTEGER NOT NULL CHECK (contact_consent = 1),
  contact_consent_at TEXT NOT NULL,
  partner_consent INTEGER NOT NULL DEFAULT 0 CHECK (partner_consent IN (0, 1)),
  partner_consent_at TEXT,
  privacy_version TEXT NOT NULL,
  source_path TEXT NOT NULL,
  acquisition_source TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  lead_score INTEGER NOT NULL DEFAULT 0,
  assigned_partner TEXT,
  partner_sent_at TEXT,
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_region ON leads(email_hash, zip_region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ip_recent ON leads(ip_hash, created_at DESC);
