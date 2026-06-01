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

test('SEO: index.html has meta robots', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="[^"]*index[^"]*follow[^"]*"/, 'meta robots required (SPEC §2.1)');
});

test('SEO: index.html has og:title', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+"/, 'og:title required');
});

test('SEO: index.html has og:locale ja_JP', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+property="og:locale"\s+content="ja_JP"/, 'og:locale ja_JP required (SPEC §2.1)');
});

test('SEO: index.html has og:image:alt', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+property="og:image:alt"\s+content="[^"]+"/, 'og:image:alt required (SPEC §2.1)');
});

test('SEO: index.html has canonical link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<link\s+rel="canonical"\s+href="[^"]+"/, 'canonical link required');
});

test('Security: index.html has Content-Security-Policy meta', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+http-equiv="Content-Security-Policy"/, 'CSP meta required (SPEC §2.2)');
});

test('JSON-LD: index.html has Organization schema', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /"@type"\s*:\s*"Organization"/, 'Organization JSON-LD required (SPEC §3.1)');
});

test('JSON-LD: index.html has WebPage schema with SpeakableSpecification', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /"SpeakableSpecification"/, 'SpeakableSpecification required (SPEC §3.1)');
});

test('Header: nav contains primary site links (FX)', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const labels = ['Home', 'Method', 'Dashboard', 'Broker', 'Blog', 'About'];
  for (const label of labels) {
    assert.match(html, new RegExp(`>${label}<`), `nav must contain "${label}"`);
  }
});

test('Footer: contains copyright and Legal link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /T\.C\.HARTON/, 'footer must contain T.C.HARTON');
  assert.match(html, /href="\/legal\/"/, 'footer must contain Legal hub link');
});

test('Footer: contains risk disclaimer one-liner', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /投資判断.*自己責任|自己責任.*投資判断|閲覧者.*自己責任/, 'footer must contain risk disclaimer');
});

test('DisclaimerBanner: sticky disclaimer present on every page', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /投資助言業.*ではありません/, 'DisclaimerBanner with 投資助言業 非該当 宣言 required (SPEC §0.2)');
});

test('Home: h1 contains brand concept (not just site name)', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  // h1 にはコンセプト (ゴールド / 構造 / XAUUSD) を含む (サイト名はヘッダーで明示済み)
  assert.match(html, /<h1[^>]*>[\s\S]*?(ゴールド|構造|XAUUSD)[\s\S]*?<\/h1>/, 'h1 with brand concept required');
});

test('Home: launch status indicator present', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /Coming Soon|準備中|β 公開準備|Phase\s*1/, 'launch status indicator required');
});

test('Home: mentions the dashboard product', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  // 正式名称「MT5-Python Trading Dashboard」を含むこと (旧表記 MT5_Python / MT5+Python も許容)
  assert.match(html, /MT5-Python Trading Dashboard|MT5_Python|MT5\s*\+\s*Python/, 'dashboard product mention required');
});

test('All pages: dist/legal/disclaimer/index.html exists', () => {
  assert.ok(existsSync('dist/legal/disclaimer/index.html'), 'disclaimer page must exist (SPEC §6.1)');
});

test('All pages: dist/about/index.html exists with E-E-A-T org info', () => {
  assert.ok(existsSync('dist/about/index.html'), 'about page must exist (SPEC §5)');
  const html = readFileSync('dist/about/index.html', 'utf8');
  // 氏名は非公開 (代表指示 2026-05-25) / 屋号 + 専門領域で E-E-A-T を担保
  assert.match(html, /T\.C\.HARTON/, 'about page must mention org T.C.HARTON');
  assert.match(html, /MetaTrader\s*5|MT5/, 'about page must declare expertise (MT5)');
});

test('Privacy: 氏名・詳細住所が漏洩していない (代表 2026-05-25 指示)', () => {
  const pages = [
    'dist/index.html',
    'dist/about/index.html',
    'dist/legal/disclaimer/index.html',
    'dist/legal/terms/index.html',
    'dist/legal/privacy/index.html',
    'dist/legal/tokushoho/index.html',
    'dist/broker/index.html',
  ];
  for (const p of pages) {
    if (!existsSync(p)) continue;
    const html = readFileSync(p, 'utf8');
    assert.doesNotMatch(html, /大内\s*達也|大内達也/, `${p}: 氏名 (大内達也) は非公開`);
    assert.doesNotMatch(html, /沼津市大岡/, `${p}: 詳細住所 (沼津市大岡) は非公開`);
    assert.doesNotMatch(html, /410-?0022/, `${p}: 郵便番号は非公開`);
    assert.doesNotMatch(html, /T\.C\.HARTON\s*\(\s*個人事業主\s*\)/, `${p}: 屋号末尾 (個人事業主) は削除`);
  }
});
