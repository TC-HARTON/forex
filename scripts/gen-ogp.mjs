#!/usr/bin/env node
/**
 * gen-ogp.mjs — OGP 画像 (1200×630 PNG) を SVG テンプレートから生成
 *
 * 仕組み: SVG を組み立て → Chrome ヘッドレスで screenshot → public/og/*.png
 * 依存: ローカルの Chrome/Edge のみ (npm 依存追加なし)
 *
 * デザイン: HARTON ブランド (teal-700 #1B4965 / 明背景 / Inter+Noto Sans JP)
 * 出力:
 *   public/og/default.png    — サイト全体デフォルト
 *   public/og/blog.png       — ブログ記事共通
 *   public/og/broker.png     — ブローカー
 *   public/og/dashboard.png  — ダッシュボード
 *
 * 実行: node scripts/gen-ogp.mjs
 */
'use strict';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'og');
const TMP_DIR = join(ROOT, '.ogp-tmp');

const TEAL = '#1B4965';
const TEAL_DK = '#143548';
const ACCENT = '#2c6e8c';
const INK = '#0f172a';
const SUB = '#475569';

// Chrome / Edge の実行パス候補
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
function findBrowser() {
  for (const b of BROWSERS) if (existsSync(b)) return b;
  throw new Error('Chrome/Edge が見つかりません');
}

/**
 * 1200×630 の OGP HTML を生成 (SVG ではなく HTML+CSS / フォント確実)
 */
function ogHtml({ kicker, title, sub, badge }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800&family=Noto+Sans+JP:wght@500;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    font-family:'Noto Sans JP','Inter',sans-serif;
    background:#ffffff;
    position:relative; overflow:hidden;
  }
  /* 左の teal アクセントバー */
  .bar { position:absolute; left:0; top:0; bottom:0; width:14px; background:${TEAL}; }
  /* 右下の装飾 (ゴールド系の円弧 = XAUUSD 連想 / 控えめ) */
  .glow { position:absolute; right:-160px; bottom:-160px; width:520px; height:520px;
          border-radius:50%; background:radial-gradient(circle,#f0f6f9 0%,#ffffff 70%); }
  .wrap { position:absolute; inset:0; padding:72px 80px; display:flex; flex-direction:column; }
  .top { display:flex; align-items:center; gap:16px; }
  .logo { width:56px; height:56px; border-radius:12px; background:${TEAL};
          display:flex; align-items:center; justify-content:center;
          font-family:'Inter',sans-serif; font-weight:800; font-size:28px; color:#fff; }
  .brand { font-family:'Inter',sans-serif; font-weight:800; font-size:30px; color:${INK}; letter-spacing:-.01em; }
  .brand .fx { color:${TEAL}; }
  .kicker { margin-top:auto; font-family:'Inter',sans-serif; font-weight:600;
            font-size:22px; letter-spacing:.18em; text-transform:uppercase; color:${ACCENT}; }
  .title { margin-top:18px; font-weight:900; font-size:64px; line-height:1.18; color:${INK};
           letter-spacing:-.01em; max-width:980px; }
  .sub { margin-top:24px; font-weight:500; font-size:27px; line-height:1.5; color:${SUB}; max-width:920px; }
  .foot { margin-top:auto; display:flex; align-items:center; gap:18px; padding-top:36px; }
  .badge { font-weight:700; font-size:20px; color:#fff; background:${TEAL};
           padding:8px 18px; border-radius:8px; }
  .url { font-family:'Inter',sans-serif; font-weight:600; font-size:22px; color:${SUB}; }
</style></head>
<body>
  <div class="bar"></div>
  <div class="glow"></div>
  <div class="wrap">
    <div class="top">
      <div class="logo">fx</div>
      <div class="brand"><span class="fx">fx</span>.tcharton.com</div>
    </div>
    <div class="kicker">${esc(kicker)}</div>
    <div class="title">${esc(title)}</div>
    ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
    <div class="foot">
      ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
      <span class="url">XAUUSD 裁量 × MT5-Python Trading Dashboard</span>
    </div>
  </div>
</body></html>`;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 生成する OGP 一覧
const TARGETS = [
  { name: 'default',   kicker: 'XAUUSD / GOLD 裁量トレード', title: 'ゴールドの相場を、構造で読む。', sub: 'マルチタイムフレーム分析と海外 FX ブローカー検証', badge: '' },
  { name: 'blog',      kicker: 'Education',                  title: '裁量 FX 教育コンテンツ',         sub: 'ダッシュボードのロジックを 1 ボックスずつ解説', badge: 'Blog' },
  { name: 'broker',    kicker: 'Broker Review',             title: 'MT5 対応 海外 FX ブローカー検証', sub: '海外 15 サイトの一次情報で約定・規制・流動性を比較', badge: 'Broker' },
  { name: 'dashboard', kicker: 'The Analysis Engine',       title: 'MT5-Python Trading Dashboard',    sub: '8 銘柄 × 4 時間足を 1 画面に統合する裁量の司令塔', badge: 'Tool' },
];

function main() {
  const browser = findBrowser();
  console.error(`[gen-ogp] browser: ${browser}`);
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  for (const t of TARGETS) {
    const htmlPath = join(TMP_DIR, `${t.name}.html`);
    const pngPath = join(OUT_DIR, `${t.name}.png`);
    writeFileSync(htmlPath, ogHtml(t), 'utf-8');

    const r = spawnSync(browser, [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--screenshot=${pngPath}`,
      `file://${htmlPath.replace(/\\/g, '/')}`,
    ], { encoding: 'utf-8', timeout: 60000 });

    if (r.status === 0 && existsSync(pngPath)) {
      console.error(`[gen-ogp] ✓ ${pngPath}`);
    } else {
      console.error(`[gen-ogp] ✗ ${t.name}: exit ${r.status} ${r.stderr || ''}`);
    }
  }

  rmSync(TMP_DIR, { recursive: true, force: true });
  console.error('[gen-ogp] done');
}

main();
