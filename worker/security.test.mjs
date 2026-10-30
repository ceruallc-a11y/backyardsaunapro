import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './lead-api.mjs';
const request = (body, headers = {}) => new Request('https://example.com/v1/leads', {
  method: 'POST', headers: { origin: 'https://backyardsaunapro.com', 'content-type': 'application/json', ...headers }, body
});
test('oversized bodies are rejected without touching D1 or email', async () => {
  assert.equal((await worker.fetch(request('x'.repeat(21000)), {})).status, 413);
  assert.equal((await worker.fetch(request('{}', { 'content-length': '21000' }), {})).status, 413);
});
test('invalid JSON objects and foreign origins cannot reach D1', async () => {
  for (const body of ['null', '[]', '"text"', '{']) {
    assert.equal((await worker.fetch(request(body), {})).status, 400);
  }
  assert.equal((await worker.fetch(request('{}', { origin: 'https://attacker.example' }), {})).status, 403);
});
test('health responses carry no-store and nosniff headers', async () => {
  const response = await worker.fetch(new Request('https://example.com/health'), {});
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});
