#!/usr/bin/env node
/**
 * fetch-github-repo.mjs
 *
 * GitHub REST API から TC-HARTON/forex の Stars / Forks / Issues を取得し、
 * src/data/github-repo.json を更新する。
 *
 * 実行: node scripts/fetch-github-repo.mjs
 * 自動化: .github/workflows/weekly-data-refresh.yml で実行
 *
 * 認証: 公開リポジトリのため未認証 OK (60 req/h 制限) / CI では GITHUB_TOKEN を使用
 *
 * 失敗時: exit 1。既存 JSON は維持。
 */
'use strict';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'github-repo.json');

const REPO = process.env.GITHUB_REPO_FX || 'TC-HARTON/forex';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

async function fetchRepo(repo) {
  const url = `https://api.github.com/repos/${repo}`;
  const headers = {
    'User-Agent': 'tcharton.com weekly fetch / info@tcharton.com',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const res = await fetch(url, { headers });
  if (res.status === 404) {
    console.error(`[fetch-github-repo] WARN: ${repo} not found (404). Placeholder データを維持`);
    return null;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function main() {
  console.error(`[fetch-github-repo] fetching ${REPO} ...`);
  let repoData = null;
  try {
    repoData = await fetchRepo(REPO);
  } catch (e) {
    console.error(`[fetch-github-repo] ERROR: ${e.message}`);
    console.error(`[fetch-github-repo] 既存 JSON を維持`);
    process.exit(1);
  }

  // 既存 JSON を読んで mt5_python_repo (private) のメタは維持
  let existing = { mt5_python_repo: {} };
  if (existsSync(OUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
    } catch (e) {
      console.error(`[fetch-github-repo] WARN: 既存 JSON parse 失敗 — 上書き作成`);
    }
  }

  const out = {
    _note: 'GitHub API から週次 fetch (scripts/fetch-github-repo.mjs) / public repo のみ',
    _source: `https://api.github.com/repos/${REPO}`,
    _fetched_at: new Date().toISOString(),
    repo: repoData
      ? {
          name: repoData.full_name,
          url: repoData.html_url,
          description: repoData.description || '',
          stars: repoData.stargazers_count ?? 0,
          forks: repoData.forks_count ?? 0,
          issues_open: repoData.open_issues_count ?? 0,
          language_primary: repoData.language || 'Astro',
          license: repoData.license?.spdx_id || 'NOASSERTION',
          default_branch: repoData.default_branch || 'main',
          homepage: repoData.homepage || 'https://tcharton.com',
          pushed_at: repoData.pushed_at,
        }
      : (existing.repo || {
          name: REPO,
          url: `https://github.com/${REPO}`,
          description: '(リポジトリ未公開 / Phase 2 で公開検討)',
          stars: 0,
          forks: 0,
          issues_open: 0,
          language_primary: 'Astro',
          license: 'TBD',
          default_branch: 'main',
          homepage: 'https://tcharton.com',
        }),
    mt5_python_repo: existing.mt5_python_repo || {
      _status: 'Phase 1 ではプライベートリポジトリ。Phase 2 で公開検討。',
      name: 'TC-HARTON/MT5_Python',
      description: 'MT5 + Python + MQL5 EA 完全裁量ダッシュボード (本体)',
      tests: 134,
      phase: 'Phase 5 最適化完了',
    },
  };

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  console.error(`[fetch-github-repo] wrote ${OUT_PATH} (stars=${out.repo.stars} forks=${out.repo.forks} issues=${out.repo.issues_open})`);
}

main();
