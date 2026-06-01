#!/usr/bin/env node
/**
 * gen-sitemap.mjs — dist/ を走査して sitemap.xml を生成 (依存パッケージ無し)
 * build 後に実行。public/ ではなく dist/ に直接書く (Cloudflare Pages が配信)。
 *
 * 実行: npm run build && node scripts/gen-sitemap.mjs
 */
'use strict';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const SITE = 'https://tcharton.com';

// 優先度ルール (パス → priority / changefreq)
function meta(urlPath) {
  if (urlPath === '/') return ['1.0', 'daily'];          // トップ (毎日データ更新)
  if (urlPath === '/blog/' || urlPath === '/method/' || urlPath === '/broker/') return ['0.9', 'weekly'];
  if (urlPath.startsWith('/blog/') || urlPath.startsWith('/method/')) return ['0.8', 'monthly']; // 記事
  if (urlPath.startsWith('/broker/')) return ['0.8', 'monthly'];
  if (urlPath === '/dashboard/' || urlPath === '/about/') return ['0.7', 'monthly'];
  if (urlPath.startsWith('/legal/')) return ['0.3', 'yearly'];
  if (urlPath === '/live/') return ['0.5', 'weekly'];
  return ['0.6', 'monthly'];
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

const files = walk(DIST);
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

const urls = files.map((f) => {
  let rel = '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '');
  if (rel !== '/' && !rel.endsWith('/')) rel += '/';
  return rel;
}).filter((u) => !u.startsWith('/404') && !u.startsWith('/contact/thanks')).sort();

const body = urls.map((u) => {
  const [pr, cf] = meta(u);
  return `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf-8');
console.error(`[gen-sitemap] wrote dist/sitemap.xml (${urls.length} URLs)`);
