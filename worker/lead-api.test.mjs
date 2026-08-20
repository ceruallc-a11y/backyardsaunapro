import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker, { scoreLead, sendLeadAlert, validateLead } from './lead-api.mjs';

const validInput = {
  firstName: 'Sam',
  email: 'sam@example.com',
  phone: '',
  location: 'Outdoor',
  heatType: 'Traditional electric',
  users: '3-4 people',
  budget: '$10,000-$20,000 installed',
  timeline: '1-3 months',
  projectType: 'New detached structure',
  dimensions: '8 ft x 10 ft',
  region: '02139',
  electrical: 'Panel capacity is known',
  installation: 'Need full installation help',
  notes: 'Gate is 42 inches wide.',
  contactConsent: true,
  partnerConsent: false,
};

const createLeadRequest = (input = validInput) => new Request('https://backyard-sauna-leads.example/v1/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://backyardsaunapro.com',
    'CF-Connecting-IP': '203.0.113.8',
  },
  body: JSON.stringify(input),
});

test('validates a complete consented lead', () => {
  const result = validateLead(validInput);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.lead.email, 'sam@example.com');
});

test('requires response consent and a valid ZIP code', () => {
  const result = validateLead({ ...validInput, contactConsent: false, region: 'x' });
  assert.equal(result.valid, false);
  assert.equal(Boolean(result.errors.contactConsent), true);
  assert.equal(Boolean(result.errors.region), true);
});

test('accepts ZIP+4 and rejects a city name', () => {
  assert.equal(validateLead({ ...validInput, region: '02139-1234' }).valid, true);
  assert.equal(validateLead({ ...validInput, region: 'Boston, MA' }).valid, false);
});

test('rejects values outside the published planner choices', () => {
  const result = validateLead({ ...validInput, heatType: 'Magic heat' });
  assert.equal(result.valid, false);
  assert.equal(Boolean(result.errors.heatType), true);
});

test('scores ready projects above early research projects', () => {
  const ready = scoreLead(validateLead({ ...validInput, partnerConsent: true }).lead);
  const early = scoreLead(validateLead({
    ...validInput,
    budget: 'Not set',
    timeline: 'Researching only',
    dimensions: '',
    electrical: 'Unknown',
    installation: 'Undecided',
    heatType: 'Undecided',
    projectType: 'Undecided',
  }).lead);
  assert.ok(ready > early);
  assert.ok(ready <= 100);
});

test('sends a privacy-safe operational alert', async () => {
  const sent = [];
  await sendLeadAlert({
    LEAD_ALERTS: {
      async send(message) {
        sent.push(message);
      },
    },
  }, {
    receiptId: 'receipt-123',
    score: 65,
    partnerConsent: false,
  });

  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'ceruallc@gmail.com');
  assert.match(sent[0].text, /receipt-123/);
  assert.match(sent[0].text, /Partner-sharing consent: no/);
  assert.doesNotMatch(JSON.stringify(sent[0]), /sam@example\.com|02139|Gate is 42 inches wide|Sam/);
});

test('stores a consented lead before returning a receipt', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            first: async () => sqlite.prepare(sql).get(...params),
            run: async () => sqlite.prepare(sql).run(...params),
          };
        },
      };
    },
  };
  const response = await worker.fetch(createLeadRequest(), { DB, RATE_LIMIT_SALT: 'test-only' });
  const result = await response.json();
  const stored = sqlite.prepare('SELECT id, contact_consent, partner_consent, status FROM leads').get();

  assert.equal(response.status, 201);
  assert.equal(result.ok, true);
  assert.equal(stored.id, result.receiptId);
  assert.equal(stored.contact_consent, 1);
  assert.equal(stored.partner_consent, 0);
  assert.equal(stored.status, 'new');
});

test('returns the existing receipt without storing another lead', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            first: async () => sqlite.prepare(sql).get(...params),
            run: async () => sqlite.prepare(sql).run(...params),
          };
        },
      };
    },
  };
  const env = { DB, RATE_LIMIT_SALT: 'test-only' };

  const firstResponse = await worker.fetch(createLeadRequest(), env);
  const first = await firstResponse.json();
  const duplicateResponse = await worker.fetch(createLeadRequest(), env);
  const duplicate = await duplicateResponse.json();
  const storedCount = sqlite.prepare('SELECT COUNT(*) AS total FROM leads').get().total;

  assert.equal(firstResponse.status, 201);
  assert.equal(duplicateResponse.status, 200);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.receiptId, first.receiptId);
  assert.equal(storedCount, 1);
});
