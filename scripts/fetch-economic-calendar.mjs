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

// Forex Factory の date/time (UTC / GMT) を JST へ。epochMs も返す (過去判定用)。
// ※ FF 公開 XML (nfs.faireconomy.media/ff_calendar_*.xml) は UTC で配信される (DST 切替なし)。
//    Forex Factory サイト UI の表示 (EST/EDT) とは異なる仕様。
//    旧実装は ET と誤認して +4/+5h 余計に加算し 3-5 時間後ろにズレていた (2026-06-02 修正)。
function xmlTimeToJst(dateStr, timeStr) {
  if (!dateStr) return null;
  const [mm, dd, yyyy] = dateStr.split('-').map(Number);
  const allDay = !timeStr || /All Day|Tentative|Day \d+/i.test(timeStr);

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
  // XML 時刻 = UTC として解釈 (etOffset は不要)
  // epochMs は真の UTC ms (Date.now() と直接比較可能)。
  // date/time は JST 文字列 (UTC+9h シフトして UTC のように formatting する内部技法)。
  const utcMs = Date.UTC(yyyy, mm - 1, dd, h, min);
  const jstView = new Date(utcMs + 9 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  const date = `${jstView.getUTCFullYear()}-${p(jstView.getUTCMonth() + 1)}-${p(jstView.getUTCDate())}`;
  const time = allDay ? (timeStr || 'All Day') : `${p(jstView.getUTCHours())}:${p(jstView.getUTCMinutes())}`;
  return { date, time, epochMs: utcMs, allDay };
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

  // ビルド時刻 = 過去/未来判定の基準。
  // 過去 (発表済み) は完全除外する (actual 結果値の取得手段がないため = 代表選択 1 / 2026-06-02)。
  // = 「Date.now() より後」のイベントのみ残す。
  const nowMs = Date.now();
  // 上限: 1 週間先まで (XML thisweek が天然上限になることが多いが、念のため明示)
  const upperBoundMs = nowMs + 7 * 24 * 3600 * 1000;

  const seen = new Set();
  const events = rawAll
    .filter((e) => MAJOR_CCYS.has(e.country))
    .map((e) => {
      const dt = xmlTimeToJst(e.date, e.time);
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
    .filter((e) => e.epochMs > nowMs)                // 現在より未来のみ (過去発表済みは除外)
    .filter((e) => e.epochMs <= upperBoundMs)        // 1 週間先まで
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
    _note: 'Forex Factory 公開 XML (今週分) を毎日 fetch (scripts/fetch-economic-calendar.mjs) / 高インパクト・現在より未来のみ・1 週間先まで',
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
