import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('build: dist/index.html exists', () => {
  assert.ok(existsSync('dist/index.html'), 'dist/index.html must exist after build');
});

test('SEO: index.html has title tag', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/, 'title tag with content required');
});

test('SEO: index.html has meta description', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/, 'meta description required');
});

test('SEO: index.html has og:title', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+"/, 'og:title required');
});

test('SEO: index.html has canonical link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<link\s+rel="canonical"\s+href="[^"]+"/, 'canonical link required');
});

test('Header: nav contains all 7 site links (active or disabled)', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const labels = ['Home', 'Dashboard', 'Docs', 'Blog', 'Services', 'About', 'Contact'];
  for (const label of labels) {
    assert.match(html, new RegExp(`>${label}<`), `nav must contain "${label}"`);
  }
});

test('Footer: contains copyright and Legal link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /T\.C\.HARTON/, 'footer must contain T.C.HARTON');
  assert.match(html, />Legal</, 'footer must contain Legal link');
});

test('Footer: contains risk disclaimer one-liner', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /投資判断.*自己責任/, 'footer must contain risk disclaimer');
});
