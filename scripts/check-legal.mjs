#!/usr/bin/env node
// SPEC §0.3 / tcharton-fx/CLAUDE.md §3 準拠
// dist/**/*.html を走査し、景表法・金商法リスク用語を検出。
// 否定文脈 (「〜しません」「〜ません」「〜ない」「禁止」「非該当」等) で使われる場合は許容。
// 真のリスク用語 (推奨断定・必勝謳い等) のみ検出。

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// 景表法リスク (誇大表現) — 否定文脈なら許容
const KEIHYO_PATTERNS = [
  /必勝/g, /絶対/g, /確実/g, /保証/g, /稼げる/g,
  /誰でも/g, /簡単に/g, /楽に/g, /不労所得/g,
  /未来予測/g, /的中率\s*100/g, /勝率\s*100/g,
];

// 金商法リスク (投資助言業 無登録) — 否定文脈なら許容
const KINSHO_PATTERNS = [
  /買いシグナル/g, /売りシグナル/g,
  /今買え/g, /今売れ/g,
  /推奨銘柄/g, /おすすめ通貨ペア/g,
];

const ALL_PATTERNS = [
  ...KEIHYO_PATTERNS.map(p => ({ pattern: p, category: '景表法' })),
  ...KINSHO_PATTERNS.map(p => ({ pattern: p, category: '金商法' })),
];

// 否定文脈マーカー (前後 200 文字以内にあれば「否定」と判定 = リスクなし)
const NEGATION_MARKERS = [
  'しません', 'ません', 'ない', 'なし', '禁止',
  '非該当', '行わない', '行いません', '配信しません',
  '提供しません', '受けておりません', '保証するものではありません',
  '保証され', '保証のない', '保証はあり', '将来非保証',
  '限りません', '一切提供しません', '将来を保証',
  '・推奨銘柄', '・推奨通貨', // リスト構造内の「項目自体が禁止対象の説明」
];

function isInNegativeContext(content, matchIndex, matchLength) {
  const start = Math.max(0, matchIndex - 200);
  const end = Math.min(content.length, matchIndex + matchLength + 200);
  const context = content.slice(start, end);
  return NEGATION_MARKERS.some(m => context.includes(m));
}

const DIST_DIR = 'dist';

function findHtmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);
    if (statSync(fullPath).isDirectory()) {
      findHtmlFiles(fullPath, out);
    } else if (name.endsWith('.html')) {
      out.push(fullPath);
    }
  }
  return out;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const hits = [];
  for (const { pattern, category } of ALL_PATTERNS) {
    // 各 match の位置を取得 (g フラグなので matchAll が使える)
    const matches = [...content.matchAll(pattern)];
    if (matches.length === 0) continue;
    // 否定文脈で使われていない match のみ NG
    const riskMatches = matches.filter(m => !isInNegativeContext(content, m.index, m[0].length));
    if (riskMatches.length > 0) {
      hits.push({ category, term: pattern.source, count: riskMatches.length });
    }
  }
  return hits;
}

function main() {
  try {
    statSync(DIST_DIR);
  } catch {
    console.error(`ERROR: ${DIST_DIR}/ が存在しません。先に npm run build を実行してください。`);
    process.exit(2);
  }

  const files = findHtmlFiles(DIST_DIR);
  console.log(`Scanning ${files.length} HTML files in ${DIST_DIR}/...`);
  console.log(`(否定文脈 = 「〜しません」「〜ない」「禁止」等で囲まれた用語は許容)`);

  let totalHits = 0;
  for (const file of files) {
    const hits = checkFile(file);
    if (hits.length > 0) {
      console.error(`\nNG ${file}:`);
      for (const { category, term, count } of hits) {
        console.error(`   [${category}] /${term}/ x ${count} (否定文脈外)`);
        totalHits += count;
      }
    }
  }

  if (totalHits === 0) {
    console.log('\nPASS: 法的禁止用語 リスクヒット 0 件 (否定文脈での使用は許容)');
    process.exit(0);
  } else {
    console.error(`\nFAIL: 法的禁止用語 リスクヒット ${totalHits} 件 (β 公開ブロック)`);
    process.exit(1);
  }
}

main();
