#!/usr/bin/env node
// PHASE-0-CONCEPT.md §4-2 / tcharton-fx/CLAUDE.md §4 準拠
// dist/**/*.html を走査し、景表法・金商法リスク用語を検出。ヒット 1 件以上で exit 1。

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// 景表法リスク (誇大表現)
const KEIHYO_PATTERNS = [
  /必勝/g, /絶対/g, /確実/g, /保証/g, /稼げる/g,
  /誰でも/g, /簡単に/g, /楽に/g, /不労所得/g,
  /未来予測/g, /的中率\s*100/g, /勝率\s*100/g,
];

// 金商法リスク (投資助言業 無登録)
const KINSHO_PATTERNS = [
  /買いシグナル/g, /売りシグナル/g,
  /今買え/g, /今売れ/g,
  /推奨銘柄/g, /おすすめ通貨ペア/g,
];

const ALL_PATTERNS = [
  ...KEIHYO_PATTERNS.map(p => ({ pattern: p, category: '景表法' })),
  ...KINSHO_PATTERNS.map(p => ({ pattern: p, category: '金商法' })),
];

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
    const matches = content.match(pattern);
    if (matches) {
      hits.push({ category, term: pattern.source, count: matches.length });
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

  let totalHits = 0;
  for (const file of files) {
    const hits = checkFile(file);
    if (hits.length > 0) {
      console.error(`\nNG ${file}:`);
      for (const { category, term, count } of hits) {
        console.error(`   [${category}] /${term}/ x ${count}`);
        totalHits += count;
      }
    }
  }

  if (totalHits === 0) {
    console.log('\nPASS: 法的禁止用語ヒット 0 件');
    process.exit(0);
  } else {
    console.error(`\nFAIL: 法的禁止用語ヒット ${totalHits} 件 (β 公開ブロック)`);
    process.exit(1);
  }
}

main();
