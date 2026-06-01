#!/usr/bin/env node
/**
 * fetch-economic-calendar.mjs
 *
 * Forex Factory 公開 XML から今週 + 来週の経済指標を取得し、
 * JST 変換 + JSON 整形して src/data/economic-calendar.json に上書きする。
 *
 * - thisweek + nextweek の 2 本を取得してマージ (未来まで見える)
 * - 各イベントに ISO 日時 (JST) を付与 → 表示側で「過去/未来」を判定可能
 * - 高インパクトのみ採用 / 主要通貨のみ
 *
 * 実行: node scripts/fetch-economic-calendar.mjs
 * 自動化: .github/workflows/daily-data-refresh.yml (毎日 fetch + 差分あれば commit)
 *
 * 出典: Forex Factory Calendar XML (https://nfs.faireconomy.media/)
 * 失敗時: exit 1 / 既存 JSON 維持 (stale を空にしない)。
 */
'use strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'economic-calendar.json');

// Forex Factory 公開 XML。現在 thisweek のみ提供 (nextweek/thismonth/nextmonth は 404)。
// thisweek でも週後半に取得すれば翌週月曜まで含むため「未来まで」見える。
// 配列にしてあるのは将来エンドポイントが復活した時に足すだけで対応するため。各 URL は個別 try。
const FF_URLS = [
  'https://nfs.faireconomy.media/ff_calendar_thisweek.xml',
];

const MAJOR_CCYS = new Set(['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY']);
const IMPACT_MAP = { High: 'high', Medium: 'medium', Low: 'low', Holiday: 'holiday' };

function parseXml(xml) {
  const events = [];
  const re = /<event>([\s\S]*?)<\/event>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`);
      const mm = body.match(r);
      return mm ? mm[1].trim() : '';
    };
    events.push({
      title: get('title'), country: get('country'),
      date: get('date'), time: get('time'), impact: get('impact'),
      forecast: get('forecast'), previous: get('previous'), url: get('url'),
    });
  }
  return events;
}

// Forex Factory の date/time (米国東部) を JST へ。epochMs も返す (過去判定用)。
function etToJst(dateStr, timeStr) {
  if (!dateStr) return null;
  const [mm, dd, yyyy] = dateStr.split('-').map(Number);
  const allDay = !timeStr || /All Day|Tentative|Day \d+/i.test(timeStr);

  // ET → UTC (3-11月=EDT/-4, それ以外=EST/-5)
  const etOffset = (mm >= 3 && mm <= 11) ? 4 : 5;
  let h = 0, min = 0;
  if (!allDay) {
    const t = timeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (t) {
      h = parseInt(t[1], 10); min = parseInt(t[2], 10);
      const ap = t[3].toLowerCase();
      if (ap === 'pm' && h !== 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
    }
  }
  const utc = new Date(Date.UTC(yyyy, mm - 1, dd, h + etOffset, min));
  const jstMs = utc.getTime() + 9 * 3600 * 1000;
  const j = new Date(jstMs);
  const p = (n) => String(n).padStart(2, '0');
  const date = `${j.getUTCFullYear()}-${p(j.getUTCMonth() + 1)}-${p(j.getUTCDate())}`;
  const time = allDay ? (timeStr || 'All Day') : `${p(j.getUTCHours())}:${p(j.getUTCMinutes())}`;
  return { date, time, epochMs: jstMs, allDay };
}

async function fetchOne(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'tcharton.com daily fetch / info@tcharton.com' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

async function main() {
  // 各 URL を個別に try。1 本でも取れれば成立 (nextweek が 404 でも thisweek で動く)。
  let rawAll = [];
  let okCount = 0;
  for (const url of FF_URLS) {
    try {
      console.error(`[fetch-economic-calendar] fetching ${url}`);
      const xml = await fetchOne(url);
      rawAll = rawAll.concat(parseXml(xml));
      okCount++;
    } catch (e) {
      console.error(`[fetch-economic-calendar] skip ${url}: ${e.message}`);
    }
  }
  // 全 URL 失敗 = ネットワーク断等 → 既存 JSON を維持して exit 1 (空にしない)
  if (okCount === 0) {
    console.error('[fetch-economic-calendar] ERROR: 全ソース取得失敗 — 既存 JSON を維持');
    process.exit(1);
  }

  // ビルド時刻 (= データ鮮度の基準)。過去イベントを除外するための now。
  const nowMs = Date.now();
  // 当日 0:00 JST 以降を「これから/当日」として残す (発表直後も当日中は見せる)
  const todayStartMs = new Date(new Date(nowMs + 9 * 3600 * 1000).toISOString().slice(0, 10) + 'T00:00:00Z').getTime() - 9 * 3600 * 1000;

  const seen = new Set();
  const events = rawAll
    .filter((e) => MAJOR_CCYS.has(e.country))
    .map((e) => {
      const dt = etToJst(e.date, e.time);
      if (!dt) return null;
      return {
        date: dt.date, time: dt.time, epochMs: dt.epochMs,
        currency: e.country, impact: IMPACT_MAP[e.impact] || 'low',
        title: e.title, previous: e.previous || '—', forecast: e.forecast || '—',
        source_url: e.url || '',
      };
    })
    .filter(Boolean)
    .filter((e) => e.impact === 'high')              // 高インパクトのみ
    .filter((e) => e.epochMs >= todayStartMs)        // 当日 0:00 以降 (過去除外)
    .filter((e) => {                                  // 重複除去 (thisweek/nextweek の境界重複)
      const k = `${e.date}|${e.time}|${e.currency}|${e.title}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    })
    .sort((a, b) => a.epochMs - b.epochMs);          // 時系列昇順 (近い未来が上)

  const display = events.slice(0, 20);
  const dates = display.map((e) => e.date);
  const range = dates.length ? `${dates[0]} 〜 ${dates[dates.length - 1]}` : '(該当なし)';

  const out = {
    _note: 'Forex Factory 公開 XML (今週+来週) を毎日 fetch (scripts/fetch-economic-calendar.mjs) / 高インパクト・当日以降のみ',
    _source: FF_URLS,
    _attribution: 'Calendar data courtesy of Forex Factory® (https://www.forexfactory.com)',
    _disclaimer: '本データは参考情報であり、投資判断の助言ではありません',
    _fetched_at: new Date().toISOString(),
    _timezone: 'JST (UTC+9)',
    _window: range,
    _total_parsed: rawAll.length,
    _display_count: display.length,
    // epochMs は表示側の鮮度判定に使うので残す
    events: display,
  };

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.error(`[fetch-economic-calendar] wrote ${OUT_PATH} — ${display.length} upcoming high-impact events / window ${range} / ${rawAll.length} parsed`);
}

main();
