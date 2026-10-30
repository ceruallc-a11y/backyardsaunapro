import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const layout = fs.readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
const source = layout.match(/<!-- Google Analytics -->\s*<script>([\s\S]*?)<\/script>/)[1];
function initialize(url) {
  const scripts = [];
  const window = { location: new URL(url) };
  const document = {
    createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) },
    documentElement: { dataset: {} },
  };
  vm.runInNewContext(source, { window, document });
  return { window, document, scripts };
}

test('only live sauna hosts initialize the sauna GA destination', () => {
  for (const host of ['backyardsaunapro.com', 'www.backyardsaunapro.com']) {
    const result = initialize(`https://${host}/guides/`);
    assert.equal(result.scripts.length, 1);
    assert.ok(result.scripts[0].src.endsWith('id=G-0F814NTT5J'));
    const config = result.window.dataLayer.find(args => args[0] === 'config');
    assert.equal(config[1], 'G-0F814NTT5J');
    assert.equal(result.document.documentElement.dataset.analyticsReady, 'true');
  }
});

test('local QA and copied pages cannot pollute production analytics', () => {
  for (const url of ['http://localhost:4321/', 'http://127.0.0.1:4321/', 'https://preview.pages.dev/', 'https://sproutfulminds.com/', 'http://backyardsaunapro.com/', 'https://backyardsaunapro.com.example/']) {
    const result = initialize(url);
    assert.equal(result.scripts.length, 0, url);
    assert.equal(result.window.gtag, undefined, url);
    assert.equal(result.document.documentElement.dataset.analyticsReady, undefined, url);
  }
  assert.doesNotMatch(layout, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
});
