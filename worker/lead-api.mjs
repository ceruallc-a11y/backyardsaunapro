const ALLOWED_ORIGINS = new Set([
  'https://backyardsaunapro.com',
  'https://www.backyardsaunapro.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

const MAX_BODY_BYTES = 20_000;
const PRIVACY_VERSION = '2026-08-15';

const choices = {
  location: ['Outdoor', 'Indoor', 'Unsure'],
  heatType: ['Traditional electric', 'Wood-fired', 'Infrared', 'Steam', 'Undecided'],
  users: ['1-2 people', '3-4 people', '5-6 people', '7+ people'],
  budget: ['Under $5,000 installed', '$5,000-$10,000 installed', '$10,000-$20,000 installed', '$20,000+ installed', 'Not set'],
  timeline: ['Within 30 days', '1-3 months', '3-6 months', '6-12 months', 'Researching only'],
  projectType: ['Existing space', 'New detached structure', 'New construction or remodel', 'Portable or plug-in unit', 'Undecided'],
  electrical: ['Unknown', 'Electrician has reviewed the site', 'Panel capacity is known', 'Planning wood-fired, not electric'],
  installation: ['Need full installation help', 'Need electrical or chimney work only', 'Planning DIY kit assembly', 'Have a contractor', 'Undecided'],
};

const clean = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export function validateLead(input) {
  const lead = {
    firstName: clean(input.firstName, 60),
    email: clean(input.email, 160).toLowerCase(),
    phone: clean(input.phone, 40),
    location: clean(input.location, 40),
    heatType: clean(input.heatType, 50),
    users: clean(input.users, 30),
    budget: clean(input.budget, 50),
    timeline: clean(input.timeline, 40),
    projectType: clean(input.projectType, 60),
    dimensions: clean(input.dimensions, 80),
    region: clean(input.region, 20),
    electrical: clean(input.electrical, 60),
    installation: clean(input.installation, 60),
    notes: clean(input.notes, 500),
    sourcePath: clean(input.sourcePath, 200) || '/sauna-planner/',
    acquisitionSource: clean(input.acquisitionSource, 100) || 'direct',
    contactConsent: input.contactConsent === true,
    partnerConsent: input.partnerConsent === true,
    website: clean(input.website, 120),
  };

  const errors = {};
  if (lead.firstName.length < 2) errors.firstName = 'Enter your first name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.email = 'Enter a valid email address.';
  for (const [field, allowed] of Object.entries(choices)) {
    if (!allowed.includes(lead[field])) errors[field] = `Choose a valid ${field}.`;
  }
  if (!/^\d{5}(?:-\d{4})?$/.test(lead.region)) {
    errors.region = 'Enter a five-digit U.S. ZIP code or ZIP+4.';
  }
  if (!lead.contactConsent) errors.contactConsent = 'Consent is required so we can respond to your request.';

  return { lead, errors, valid: Object.keys(errors).length === 0 };
}

export function scoreLead(lead) {
  let score = 0;
  if (/^\d{5}/.test(lead.region)) score += 15;
  if (lead.budget === '$20,000+ installed') score += 20;
  else if (lead.budget === '$10,000-$20,000 installed') score += 16;
  else if (lead.budget === '$5,000-$10,000 installed') score += 10;
  else if (lead.budget === 'Under $5,000 installed') score += 5;

  if (lead.timeline === 'Within 30 days') score += 15;
  else if (lead.timeline === '1-3 months') score += 12;
  else if (lead.timeline === '3-6 months') score += 7;
  else if (lead.timeline === '6-12 months') score += 3;

  score += lead.dimensions ? 10 : 0;
  score += lead.phone ? 5 : 0;
  score += lead.electrical !== 'Unknown' ? 10 : 0;
  score += lead.installation !== 'Undecided' ? 10 : 0;
  score += lead.heatType !== 'Undecided' ? 5 : 0;
  score += lead.projectType !== 'Undecided' ? 5 : 0;
  score += lead.partnerConsent ? 5 : 0;
  return Math.min(score, 100);
}

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://backyardsaunapro.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin',
});

const json = (body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: corsHeaders(origin),
});

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'backyard-sauna-leads' }, 200, origin);
    }

    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: 'Origin not allowed.' }, 403, origin);
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/leads') {
      return json({ ok: false, error: 'Not found.' }, 404, origin);
    }
    if (!ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: 'Origin not allowed.' }, 403, origin);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return json({ ok: false, error: 'Use JSON.' }, 415, origin);
    }

    const bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'Submission is too large.' }, 413, origin);
    }

    let input;
    try {
      input = JSON.parse(bodyText);
    } catch {
      return json({ ok: false, error: 'Invalid submission.' }, 400, origin);
    }

    const { lead, errors, valid } = validateLead(input || {});
    if (lead.website) return json({ ok: true, receiptId: crypto.randomUUID() }, 202, origin);
    if (!valid) return json({ ok: false, error: 'Please review the highlighted fields.', fields: errors }, 422, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hash(`${env.RATE_LIMIT_SALT}:${ip}`);
    const emailHash = await hash(`${env.RATE_LIMIT_SALT}:${lead.email}`);
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM leads WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')"
    ).bind(ipHash).first();
    if (Number(recent?.total || 0) >= 5) {
      return json({ ok: false, error: 'Too many submissions. Please try again later.' }, 429, origin);
    }

    const duplicate = await env.DB.prepare(
      "SELECT id FROM leads WHERE email_hash = ? AND zip_region = ? AND created_at >= datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 1"
    ).bind(emailHash, lead.region).first();
    if (duplicate?.id) {
      console.log(JSON.stringify({ event: 'lead_duplicate', receiptId: duplicate.id }));
      return json({ ok: true, receiptId: duplicate.id, duplicate: true }, 200, origin);
    }

    const id = crypto.randomUUID();
    const score = scoreLead(lead);
    await env.DB.prepare(`
      INSERT INTO leads (
        id, status, first_name, email, email_hash, phone, zip_region,
        project_location, heat_type, expected_users, budget, timeline,
        project_type, dimensions, electrical_status, installation_help,
        notes, contact_consent, contact_consent_at, partner_consent,
        partner_consent_at, privacy_version, source_path, acquisition_source,
        ip_hash, lead_score
      ) VALUES (?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1,
        datetime('now'), ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
        ?, ?, ?, ?, ?)
    `).bind(
      id, lead.firstName, lead.email, emailHash, lead.phone || null, lead.region,
      lead.location, lead.heatType, lead.users, lead.budget, lead.timeline,
      lead.projectType, lead.dimensions || null, lead.electrical, lead.installation,
      lead.notes || null, lead.partnerConsent ? 1 : 0, lead.partnerConsent ? 1 : 0,
      PRIVACY_VERSION, lead.sourcePath, lead.acquisitionSource, ipHash, score
    ).run();

    console.log(JSON.stringify({ event: 'lead_received', receiptId: id, score, partnerConsent: lead.partnerConsent }));
    return json({ ok: true, receiptId: id }, 201, origin);
  },
};
