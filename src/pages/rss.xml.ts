/**
 * rss.xml.ts — /rss.xml を blog-posts.json から自動生成 (依存追加なし / 手書き RSS 2.0)
 * 記事を blog-posts.json に追加すれば自動反映。RSS リーダー・AI クローラの巡回に対応。
 */
import type { APIRoute } from 'astro';
import blogData from '../data/blog-posts.json';

const SITE = 'https://tcharton.com';
const TITLE = 'T.C.HARTON — XAUUSD 裁量トレード × MT5-Python Trading Dashboard';
const DESC =
  'ゴールド (XAUUSD) 中上級者向け裁量トレードの手法・タイミング発信、MT5-Python Trading Dashboard 解説、海外 FX ブローカー検証・入出金情報。';

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(date: string): string {
  const d = new Date(date + 'T00:00:00Z');
  return isNaN(d.getTime()) ? new Date(0).toUTCString() : d.toUTCString();
}

export const GET: APIRoute = () => {
  const cats = blogData._categories as Record<string, string>;
  const posts = blogData.posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const lastBuild = posts.length ? rfc822(posts[0].date) : new Date(0).toUTCString();

  const items = posts
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}/`;
      const category = cats[p.category] || p.category;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <category>${esc(category)}</category>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(DESC)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
