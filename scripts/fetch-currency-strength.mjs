#!/usr/bin/env node
/**
 * fetch-currency-strength.mjs
 *
 * ECB 公式データ (Frankfurter API / 無認証・無制限) から G8 法定通貨の
 * 通貨強弱インデックスを日次自動計算し、src/data/currency-strength.json に出力する。
 *
 * これにより MT5 (代表 PC) 不要で GitHub Actions 完全自動化が可能。
 *
 * 実行: node scripts/fetch-currency-strength.mjs
 * 自動化: .github/workflows/daily-data-refresh.yml (毎日 fetch + 差分あれば commit)
 *
 * アルゴリズム (MT5_Python SPEC §12.3 を ECB 日次データで再現):
 *   1. 直近 N 営業日の各通貨 (対 USD) クロスレートを取得
 *   2. 全通貨ペアの累積変化率を算出 (base なら +、quote なら -)
 *   3. 各通貨について、その通貨を含む全ペアの平均変化率を計算
 *   4. Z-score 正規化で 0-100 スケール (平均 50 / ±2σ を 0,100 端に)
 *
 * 注: XAU (ゴールド) は ECB データに含まれず、かつ MT5_Python SPEC でも
 *     「XAU は通貨強弱メトリクスに含めない (参照のみ)」と明記。本スクリプトも
 *     G8 法定通貨のみを対象とする (XAUUSD 単体は別途 /dashboard で扱う)。
 *
 * 出典: European Central Bank (ECB) via Frankfurter API (https://frankfurter.dev)
 * ライセンス: ECB データは公開 / Frankfurter は無料 API
 *
 * 失敗時: exit 1 / 既存 JSON 維持 (stale を空にしない)。
 */
'use strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'currency-strength.json');

const API = 'https://api.frankfurter.dev/v1';
const CCYS = ['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'];
const QUOTE = CCYS.filter((c) => c !== 'USD'); // USD 基準で取得する相手通貨
const LOOKBACK_DAYS = 7; // 直近 7 暦日 (週末除く ECB 営業日が 4-5 日含まれる)
const Z_SCALE = 25.0;    // ±2σ → 0/100 端 (MT5_Python SPEC §12.3 と同係数)

const NAMES_JA = {
  USD: '米ドル', EUR: 'ユーロ', JPY: '日本円', GBP: '英ポンド',
  CHF: 'スイスフラン', AUD: '豪ドル', CAD: '加ドル', NZD: 'NZドル',
};

function ymd(d) { return d.toISOString().slice(0, 10); }

async function fetchSeries() {
  // 期間指定で USD 基準の各通貨レート時系列を取得
  const end = new Date();
  const start = new Date(end.getTime() - LOOKBACK_DAYS * 86400 * 1000);
  const url = `${API}/${ymd(start)}..${ymd(end)}?base=USD&symbols=${QUOTE.join(',')}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'tcharton.com daily fetch / info@tcharton.com' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const json = await res.json();
  const dates = Object.keys(json.rates).sort();
  if (dates.length < 2) throw new Error(`データ点不足 (${dates.length} 日分)`);
  return { dates, rates: json.rates };
}

/**
 * USD 建てレート時系列 → 各通貨の強弱スコア (0-100)
 *
 * 各通貨 c の "対 USD 価値" を時系列で持ち、最初と最後の変化率を計算。
 * USD は他通貨の逆数平均から相対変化を導出。
 */
function computeStrength({ dates, rates }) {
  const first = dates[0];
  const last = dates[dates.length - 1];

  // 各通貨の「1 USD = X 通貨」→ 通貨価値は 1/X。変化率 = (last/first - 1) の通貨価値ベース。
  // USD 自身は基準なので、他通貨の平均逆変化で算出。
  const pctChange = {}; // 通貨 → 対 USD 価値変化率 (%)
  for (const c of QUOTE) {
    const r0 = rates[first][c];
    const r1 = rates[last][c];
    if (!r0 || !r1) continue;
    // 1USD=r 通貨 のとき、その通貨の対 USD 価値 = 1/r。価値変化率:
    const valueChange = ((1 / r1) / (1 / r0) - 1) * 100;
    pctChange[c] = valueChange;
  }
  // USD の変化率 = 他通貨価値変化の符号反転平均 (相対)
  const others = Object.values(pctChange);
  pctChange['USD'] = others.length ? -(others.reduce((a, b) => a + b, 0) / others.length) : 0;

  // Z-score 正規化
  const vals = CCYS.map((c) => pctChange[c] ?? 0);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const sd = Math.sqrt(variance) || 1;

  const scored = CCYS.map((c) => {
    const z = ((pctChange[c] ?? 0) - mean) / sd;
    // bias: 中央 0 基準の符号付き強弱 (正 = 強い/買い傾向, 負 = 弱い/売り傾向)。
    //   z * Z_SCALE で概ね -50..+50。±50 でクランプ (full half-bar)。
    const bias = Math.max(-50, Math.min(50, Math.round(z * Z_SCALE)));
    // score: 後方互換のため 0..100 も保持 (= bias + 50)
    const score = Math.max(0, Math.min(100, bias + 50));
    return { code: c, name: NAMES_JA[c], bias, score };
  });
  // 強い順 (bias 降順) にソート
  scored.sort((a, b) => b.bias - a.bias);
  scored.forEach((s, i) => { s.rank = i + 1; });
  return { scored, first, last };
}

async function main() {
  console.error('[fetch-currency-strength] fetching ECB rates via Frankfurter...');
  let series;
  try {
    series = await fetchSeries();
  } catch (e) {
    console.error(`[fetch-currency-strength] ERROR: ${e.message}`);
    console.error('[fetch-currency-strength] 既存 JSON を維持 (stale だが空にしない)');
    process.exit(1);
  }

  const { scored, first, last } = computeStrength(series);

  const out = {
    _note: 'ECB 公式データ (Frankfurter API) から日次自動計算 (scripts/fetch-currency-strength.mjs) / MT5 不要・完全自動',
    _source: 'European Central Bank (ECB) via Frankfurter API (https://frankfurter.dev)',
    _disclaimer: '本データは参考情報であり、投資判断の助言ではありません',
    _method: 'G8 法定通貨の対 USD 価値変化率を Z-score 正規化 (0-100 / 平均 50)',
    _fetched_at: new Date().toISOString(),
    _period: `${first} 〜 ${last} (ECB 営業日終値)`,
    _note_xau: 'XAU (ゴールド) は ECB データ非対象のため通貨強弱バーには含めません (XAUUSD は /dashboard で別途)',
    currencies: scored,
  };

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.error(`[fetch-currency-strength] wrote ${OUT_PATH} (${scored.length} ccys / period ${first}..${last})`);
  console.error('  ' + scored.map((s) => `${s.code}:${s.score}`).join(' '));
}

main();
