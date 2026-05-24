# fx.tcharton.com Phase 1 — Week 1-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `fx.tcharton.com` を Cloudflare Pages 上にデプロイし、Astro 5 + Tailwind 4 で作った placeholder ページを `https://fx.tcharton.com` で公開する基盤を作る。

**Architecture:** Astro 5 (SSG, TypeScript strict) + Tailwind 4 (via `@tailwindcss/vite`) + Cloudflare Pages (GitHub 連携自動デプロイ) + Cloudflare DNS (`fx` サブドメイン)。BaseLayout / Header / Footer / DisclaimerBanner を部品化、ホームは placeholder のみ (本実装は Week 3-4)。

**Tech Stack:** Astro 5.x / Tailwind 4.x / TypeScript strict / Node 22 LTS / npm / Node 組込み test runner (`node --test`) / Cloudflare Pages + DNS

**Scope guard (本プランの範囲外):** `/dashboard/`、`/docs/` の本コンテンツ、`/blog/` の本コンテンツ、`/services/`、`/about/`、`/legal/` 各ページ本実装、Cloudflare Tunnel + Dash 統合 — すべて後続プラン (Week 3-8) で実装。

**HSCEL 適用:** §3.1 4 Skill (feature-dev / requesting-code-review / receiving-code-review / gstack) は Task 13 (完了報告) 前に実施。

---

## ファイル構成 (Week 1-2 完了時)

```
HARTON/tcharton-fx/
├── CLAUDE.md                       (既存)
├── README.md                       (Task 10 で追記)
├── REPORT-TO-ROOT-FROM-TCHARTON-FX.md (Task 13 で追記)
├── .gitignore                      (Task 2 で生成、Task 1 では暫定)
├── .git/                           (Task 1 で作成)
├── docs/
│   ├── PHASE-0-CONCEPT.md          (既存)
│   └── PHASE-1-PLAN-WEEK-1-2.md    (本書)
├── drafts/                         (既存、空)
├── package.json                    (Task 2 / 3 / 9 で生成・追記)
├── package-lock.json               (Task 2 で生成)
├── astro.config.mjs                (Task 2 / 3 で生成・更新)
├── tsconfig.json                   (Task 2 で生成)
├── public/
│   └── favicon.svg                 (Task 2 で生成、暫定)
├── src/
│   ├── env.d.ts                    (Task 2 で生成)
│   ├── styles/
│   │   └── global.css              (Task 4 で作成)
│   ├── layouts/
│   │   └── BaseLayout.astro        (Task 5 で作成)
│   ├── components/
│   │   ├── SEO.astro               (Task 5 で作成)
│   │   ├── Header.astro            (Task 6 で作成)
│   │   ├── Footer.astro            (Task 6 で作成)
│   │   └── DisclaimerBanner.astro  (Task 7 で作成)
│   └── pages/
│       └── index.astro             (Task 2 で生成、Task 8 で全面書換)
├── scripts/
│   └── check-legal.mjs             (Task 9 で作成)
└── tests/
    └── build.test.mjs              (Task 5 / 8 で作成・追記)
```

**設計判断:**
- Astro プロジェクトは `tcharton-fx/` 直下に展開 (`site/` 下層を作らない、シンプル優先)
- 単一責務原則: コンポーネント 1 つ = 1 ファイル。ファイルが大きくならない設計
- テストは Node 組込みランナー (依存 0、Vitest 不要)

---

## Task 1: GitHub リポジトリ作成 + ローカル git init

**Files:**
- Create: `.git/` (`git init` で生成)
- Create: `.gitignore` (暫定、Task 2 で Astro が上書き)

**前提:** GitHub リポジトリ作成は代表 (大内) の手動操作 (PHASE-0-CONCEPT.md §5 越境チェックリスト、代表承認後の項)。

- [ ] **Step 1: 代表が GitHub で空リポジトリ作成**

代表操作:
1. https://github.com/new にアクセス
2. Repository name: `tcharton-fx`
3. Description: `fx.tcharton.com — MT5_Python 紹介 + 裁量 FX 教育コンテンツ`
4. **Public** (Cloudflare Pages 連携で Private も可だが Phase 1 は Public)
5. README / .gitignore / license は **追加しない** (ローカルから push するため)
6. Create repository

完了後、URL を取得 (例: `https://github.com/<USERNAME>/tcharton-fx.git`)

- [ ] **Step 2: ローカル `.gitignore` (暫定) 作成**

`C:\Users\ohuch\Desktop\HARTON\tcharton-fx\.gitignore` を作成:

```gitignore
# 暫定 (Task 2 で Astro が上書き)
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 3: git init + 初回 commit**

Working directory: `C:\Users\ohuch\Desktop\HARTON\tcharton-fx\`

```bash
git init -b main
git add CLAUDE.md README.md REPORT-TO-ROOT-FROM-TCHARTON-FX.md docs/ drafts/ .gitignore
git commit -m "chore: initial Phase 0 docs + skeleton"
```

期待出力: `[main (root-commit) <hash>] chore: initial Phase 0 docs + skeleton` + 5 files changed

- [ ] **Step 4: GitHub にリモート紐付け + push**

```bash
git remote add origin https://github.com/<USERNAME>/tcharton-fx.git
git push -u origin main
```

期待出力: `Branch 'main' set up to track 'origin/main'.`

- [ ] **Step 5: 動作確認**

GitHub 上で `https://github.com/<USERNAME>/tcharton-fx` を開き、5 ファイル / 2 ディレクトリが表示されていることを確認。

---

## Task 2: Astro 5.x プロジェクト初期化

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore` (Astro が生成、暫定 .gitignore は上書きされる)
- Create: `public/favicon.svg` (Astro 既定)
- Create: `src/env.d.ts`, `src/pages/index.astro` (Astro 既定)

**前提:** Node.js 22 LTS が PATH 通っていること。確認: `node --version` で `v22.x.x` 表示。

- [ ] **Step 1: Astro 初期化**

Working directory: `C:\Users\ohuch\Desktop\HARTON\tcharton-fx\`

```bash
npm create astro@latest . -- --template minimal --typescript strict --install --no-git --skip-houston
```

期待: `package.json` `astro.config.mjs` `tsconfig.json` `src/` `public/` が生成、`node_modules/` 自動インストール。

- [ ] **Step 2: 既存ファイルとの共存確認**

`ls` で `CLAUDE.md README.md docs/ drafts/ REPORT-TO-ROOT-FROM-TCHARTON-FX.md package.json astro.config.mjs tsconfig.json src/ public/ node_modules/` の存在確認。Astro の `.gitignore` が暫定 .gitignore を上書きしていることも確認 (中身に `node_modules` `dist` `.astro` 等が含まれる)。

- [ ] **Step 3: dev サーバ起動確認**

```bash
npm run dev
```

期待出力:
```
astro  v5.x.x ready in xxx ms
┃ Local    http://localhost:4321/
```

ブラウザで `http://localhost:4321/` を開き、Astro 既定の welcome ページが表示されることを確認。`Ctrl+C` で dev サーバ停止。

- [ ] **Step 4: build 確認**

```bash
npm run build
```

期待出力: `[build] X page(s) built in Xms` + `dist/` ディレクトリ生成。`dist/index.html` が存在することを確認。

- [ ] **Step 5: package.json に Node engines 追記**

`package.json` の `"scripts"` の隣に追記:

```json
"engines": {
  "node": ">=22.0.0"
}
```

(Cloudflare Pages のビルド環境で Node 22 を使うため)

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: bootstrap Astro 5 with TypeScript strict"
```

---

## Task 3: Tailwind CSS 4.x 統合

**Files:**
- Modify: `astro.config.mjs` (`@tailwindcss/vite` plugin 追加)
- Modify: `package.json` (依存追加)

- [ ] **Step 1: `astro add tailwind` 実行**

```bash
npx astro add tailwind
```

プロンプト: 全て `y` (yes) で進める。

期待: `@tailwindcss/vite` `tailwindcss` が `package.json` に追加、`astro.config.mjs` に `import tailwindcss from '@tailwindcss/vite'` と `vite: { plugins: [tailwindcss()] }` が追加。

- [ ] **Step 2: 動作確認用に index.astro へ Tailwind クラス挿入**

`src/pages/index.astro` を一時的に編集 (本実装は Task 8 で行うため、これは検証のみ):

```astro
---
---
<html>
  <head><title>Tailwind 動作確認</title></head>
  <body>
    <h1 class="text-3xl font-bold underline text-blue-600">
      Tailwind works
    </h1>
  </body>
</html>
```

- [ ] **Step 3: dev で確認**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/` を開く。`Tailwind works` が **大きな青字 + 下線 + 太字** で表示されることを確認。

dev サーバ停止 (`Ctrl+C`)。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/pages/index.astro
git commit -m "feat: add Tailwind CSS 4 via @tailwindcss/vite"
```

---

## Task 4: デザイントークン CSS 変数 (`src/styles/global.css`)

**Files:**
- Create: `src/styles/global.css`

**設計判断:** Phase 1 暫定値。色は dark / neutral 系 (FX チャート文化との整合、白背景は目に厳しい)。Phase 1 設計時に調整可。

- [ ] **Step 1: `src/styles/global.css` 作成**

```css
@import "tailwindcss";

/* === Design tokens (Phase 1 暫定) === */
@theme {
  /* Color (dark/neutral, FX chart culture) */
  --color-bg: #0b0d10;
  --color-surface: #14171c;
  --color-surface-2: #1c2128;
  --color-border: #2a3037;
  --color-text: #e6e8ea;
  --color-text-muted: #9aa0a6;
  --color-accent: #4cc4d9;      /* T.C.HARTON cyan */
  --color-warning: #f5c542;
  --color-danger: #e0556a;

  /* Typography */
  --font-sans: "Inter", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Source Code Pro", ui-monospace, monospace;

  /* Spacing scale extension (Tailwind default + 1 tighter) */
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;
}

/* === Base === */
html {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-size-adjust: 100%;
}

body {
  min-height: 100dvh;
  margin: 0;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add design tokens (dark/neutral, FX chart culture)"
```

---

## Task 5: BaseLayout + SEO コンポーネント (TDD)

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SEO.astro`
- Create: `tests/build.test.mjs`
- Modify: `package.json` (test script 追加)

**設計判断:** BaseLayout は HTML skeleton のみ。Header / Footer は Task 6 で別コンポーネント化、ここでは未統合。SEO は title / description / OGP / canonical の 4 種。

- [ ] **Step 1: 失敗テスト書く**

`tests/build.test.mjs`:

```javascript
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

test('SEO: index.html has og:title', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<meta\s+property="og:title"\s+content="[^"]+"/, 'og:title required');
});

test('SEO: index.html has canonical link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<link\s+rel="canonical"\s+href="[^"]+"/, 'canonical link required');
});
```

- [ ] **Step 2: package.json に test script 追加**

```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "node --test tests/"
}
```

- [ ] **Step 3: テストが失敗することを確認**

```bash
npm run build && npm test
```

期待: 5 テスト中 `title tag` 以外が FAIL (Astro default index.astro には title はあるが description/og:title/canonical なし)。

- [ ] **Step 4: `src/components/SEO.astro` 作成**

```astro
---
interface Props {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
}

const { title, description, canonicalUrl, ogImage = '/og-default.png' } = Astro.props;
const siteName = 'fx.tcharton.com';
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />

<meta property="og:type" content="website" />
<meta property="og:site_name" content={siteName} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={ogImage} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
```

- [ ] **Step 5: `src/layouts/BaseLayout.astro` 作成**

```astro
---
import '../styles/global.css';
import SEO from '../components/SEO.astro';

interface Props {
  title: string;
  description: string;
  canonicalPath: string; // 例: "/" or "/about/"
}

const { title, description, canonicalPath } = Astro.props;
const SITE_URL = 'https://fx.tcharton.com';
const canonicalUrl = `${SITE_URL}${canonicalPath}`;
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <SEO title={title} description={description} canonicalUrl={canonicalUrl} />
  </head>
  <body>
    <main>
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 6: `src/pages/index.astro` を BaseLayout 経由に書き換え (暫定)**

Task 8 で本実装するが、テストを通すために暫定的に:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="fx.tcharton.com | 裁量 FX × MT5_Python"
  description="MT5_Python ダッシュボードと裁量 FX 教育コンテンツ (海外 FX 利用者向け)"
  canonicalPath="/"
>
  <h1>fx.tcharton.com</h1>
  <p>Coming soon.</p>
</BaseLayout>
```

- [ ] **Step 7: build + test 全 PASS 確認**

```bash
npm run build && npm test
```

期待: `# tests 5  # pass 5  # fail 0`

- [ ] **Step 8: Commit**

```bash
git add src/components/SEO.astro src/layouts/BaseLayout.astro src/pages/index.astro tests/build.test.mjs package.json
git commit -m "feat: BaseLayout + SEO component with build assertions"
```

---

## Task 6: Header / Footer コンポーネント (TDD)

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro` (Header / Footer 統合)
- Modify: `tests/build.test.mjs` (ナビ / フッタの assertion 追加)

**設計判断:** ナビは PHASE-0-CONCEPT.md §5 サイトマップの 7 リンク (Home / Dashboard / Docs / Blog / Services / About / Contact)。Phase 1 で未実装ページは `href="#"` (Cloudflare で 404 を返す) ではなく **disabled (=`<span>`)** として描画し、リンク切れを防ぐ。

- [ ] **Step 1: 失敗テスト追加**

`tests/build.test.mjs` 末尾に追記:

```javascript
test('Header: nav contains all 7 site links (active or disabled)', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const labels = ['Home', 'Dashboard', 'Docs', 'Blog', 'Services', 'About', 'Contact'];
  for (const label of labels) {
    assert.match(html, new RegExp(`>${label}<`), `nav must contain "${label}"`);
  }
});

test('Footer: contains copyright and Legal link', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /T\.C\.HARTON/, 'footer must contain T.C.HARTON');
  assert.match(html, />Legal</, 'footer must contain Legal link');
});

test('Footer: contains risk disclaimer one-liner', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /投資判断.*自己責任/, 'footer must contain risk disclaimer');
});
```

- [ ] **Step 2: テスト失敗確認**

```bash
npm run build && npm test
```

期待: 3 件 FAIL。

- [ ] **Step 3: `src/components/Header.astro` 作成**

```astro
---
const NAV_LINKS = [
  { label: 'Home',      href: '/',            active: true  },
  { label: 'Dashboard', href: '/dashboard/',  active: false }, // Week 5-6
  { label: 'Docs',      href: '/docs/',       active: false }, // Week 3-4
  { label: 'Blog',      href: '/blog/',       active: false }, // Week 5-6
  { label: 'Services',  href: '/services/',   active: false }, // Week 3-4
  { label: 'About',     href: '/about/',      active: false }, // Week 3-4
  { label: 'Contact',   href: '/contact/',    active: false }, // Week 3-4
];
---

<header class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
  <div class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
    <a href="/" class="text-lg font-bold tracking-tight text-[var(--color-text)]">
      fx.tcharton.com
    </a>
    <nav>
      <ul class="flex gap-6 text-sm">
        {NAV_LINKS.map((link) => (
          <li>
            {link.active ? (
              <a href={link.href} class="hover:text-[var(--color-accent)]">{link.label}</a>
            ) : (
              <span class="text-[var(--color-text-muted)] cursor-not-allowed" title="Phase 1 後半で公開">
                {link.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>
```

- [ ] **Step 4: `src/components/Footer.astro` 作成**

```astro
---
const year = new Date().getFullYear();
---

<footer class="border-t border-[var(--color-border)] bg-[var(--color-surface)] mt-22">
  <div class="mx-auto max-w-6xl px-4 py-8 text-sm text-[var(--color-text-muted)] space-y-3">
    <p class="text-xs leading-relaxed">
      ⚠ 本サイトの情報は参考情報であり、投資判断の助言ではありません。
      FX 取引は元本を超える損失が生じる可能性があります。取引の最終判断と結果は閲覧者ご自身の自己責任となります。
    </p>
    <div class="flex flex-wrap gap-x-6 gap-y-2">
      <span>© {year} T.C.HARTON</span>
      <a href="/legal/disclaimer/">Disclaimer</a>
      <a href="/legal/terms/">Terms</a>
      <a href="/legal/tokushoho/">特商法</a>
      <a href="/legal/privacy/">Privacy</a>
      <a href="/legal/">Legal</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 5: BaseLayout に Header / Footer 統合**

`src/layouts/BaseLayout.astro` を更新:

```astro
---
import '../styles/global.css';
import SEO from '../components/SEO.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
}

const { title, description, canonicalPath } = Astro.props;
const SITE_URL = 'https://fx.tcharton.com';
const canonicalUrl = `${SITE_URL}${canonicalPath}`;
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <SEO title={title} description={description} canonicalUrl={canonicalUrl} />
  </head>
  <body class="flex flex-col min-h-dvh">
    <Header />
    <main class="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: build + test 全 PASS 確認**

```bash
npm run build && npm test
```

期待: `# tests 8  # pass 8  # fail 0`

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro tests/build.test.mjs
git commit -m "feat: Header (7 nav links) + Footer (risk disclaimer + legal)"
```

---

## Task 7: DisclaimerBanner.astro (Dashboard ページ用、本タスクは作成のみ)

**Files:**
- Create: `src/components/DisclaimerBanner.astro`

**設計判断:** PHASE-0-CONCEPT.md §4-3 verbatim 文言。`/dashboard/` ページで最上部固定表示する想定 (本ページは Week 5-6)。本タスクではコンポーネント単体を作るのみ、統合は後続プラン。

- [ ] **Step 1: `src/components/DisclaimerBanner.astro` 作成**

```astro
---
// PHASE-0-CONCEPT.md §4-3 (verbatim、書換禁止)
const DISCLAIMER_TEXT = '⚠ 本ダッシュボードは客観データの可視化であり、投資判断の助言・推奨ではありません。表示されるすべての情報は参考に過ぎず、取引による損益は閲覧者ご自身に帰属します。';
---

<div role="alert" class="sticky top-0 z-50 bg-[var(--color-warning)] text-black text-sm font-medium">
  <div class="mx-auto max-w-6xl px-4 py-2 text-center">
    {DISCLAIMER_TEXT}
  </div>
</div>
```

- [ ] **Step 2: 構文チェック (build 成功確認)**

```bash
npm run build
```

エラー出ないこと確認。本コンポーネントは未使用なので dist にバンドルされないが、Astro が AST 解析する。

- [ ] **Step 3: Commit**

```bash
git add src/components/DisclaimerBanner.astro
git commit -m "feat: DisclaimerBanner component (verbatim from PHASE-0 §4-3)"
```

---

## Task 8: ホームページ placeholder 本実装

**Files:**
- Modify: `src/pages/index.astro` (Task 5 暫定版を本実装に置換)
- Modify: `tests/build.test.mjs` (Hero / Coming Soon の assertion 追加)

**設計判断:** Hero (大見出し + サブテキスト + 簡素な CTA) + 「Coming Soon」セクション。Phase 1 後半で全面リニューアル予定だが、現時点で代表が `https://fx.tcharton.com` を共有しても恥ずかしくない最低限の体裁。

- [ ] **Step 1: 失敗テスト追加**

`tests/build.test.mjs` 末尾に追記:

```javascript
test('Home: contains hero with site name in h1', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /<h1[^>]*>[\s\S]*fx\.tcharton\.com[\s\S]*<\/h1>/, 'h1 with site name required');
});

test('Home: contains "Coming Soon" or status indicator', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /Coming Soon|準備中|β 公開準備/, 'launch status indicator required');
});

test('Home: mentions MT5_Python', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.match(html, /MT5_Python|MT5\s*\+\s*Python/, 'MT5_Python mention required');
});
```

- [ ] **Step 2: テスト失敗確認**

```bash
npm run build && npm test
```

期待: 3 件 FAIL (Task 5 暫定実装には Hero 構造なし)。

- [ ] **Step 3: `src/pages/index.astro` 本実装**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="fx.tcharton.com | 裁量 FX × MT5_Python"
  description="MT5_Python ダッシュボードと裁量 FX 教育コンテンツ。海外 FX 利用者向け、構造ベース・マルチタイムフレーム手法を中心に発信します。"
  canonicalPath="/"
>
  <section class="py-18 text-center">
    <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
      <span class="text-[var(--color-accent)]">fx</span>.tcharton.com
    </h1>
    <p class="mt-6 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
      MT5_Python ダッシュボードと裁量 FX 教育コンテンツ。<br />
      海外 FX 利用者向けに、構造ベース × マルチタイムフレームの分析手法を発信予定。
    </p>
    <p class="mt-10 inline-block px-4 py-2 border border-[var(--color-border)] rounded text-sm text-[var(--color-text-muted)]">
      Coming Soon — β 公開準備中 (2026 年内)
    </p>
  </section>

  <section class="mt-22 grid gap-6 md:grid-cols-3 text-sm">
    <article class="p-6 border border-[var(--color-border)] rounded bg-[var(--color-surface)]">
      <h2 class="font-semibold text-[var(--color-text)]">MT5_Python とは</h2>
      <p class="mt-3 text-[var(--color-text-muted)]">
        完全裁量・マルチタイムフレーム前提のローカル統合ダッシュボード (Python + Dash + MQL5 EA)。
      </p>
    </article>
    <article class="p-6 border border-[var(--color-border)] rounded bg-[var(--color-surface)]">
      <h2 class="font-semibold text-[var(--color-text)]">構造ベース裁量</h2>
      <p class="mt-3 text-[var(--color-text-muted)]">
        TL/SR、PDH/PDL、フラクタル、通貨強弱、経済指標を統合した分析手法を解説予定。
      </p>
    </article>
    <article class="p-6 border border-[var(--color-border)] rounded bg-[var(--color-surface)]">
      <h2 class="font-semibold text-[var(--color-text)]">公開ライブ表示</h2>
      <p class="mt-3 text-[var(--color-text-muted)]">
        デモ口座の客観データ (EMA/ADX/RSI/通貨強弱) をライブ可視化する Dashboard を準備中。
      </p>
    </article>
  </section>
</BaseLayout>
```

- [ ] **Step 4: build + test 全 PASS 確認**

```bash
npm run build && npm test
```

期待: `# tests 11  # pass 11  # fail 0`

- [ ] **Step 5: dev で見た目確認**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/` を開き:
- Header に 7 つのナビ (Home がリンク、他はグレー)
- Hero の `fx.tcharton.com` 大見出し
- 3 つのカードセクション
- Footer にリスク注意書きと Legal リンク

すべて表示されることを確認。`Ctrl+C` で停止。

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro tests/build.test.mjs
git commit -m "feat: home placeholder with hero + 3-card section"
```

---

## Task 9: 法的禁止用語 grep スクリプト

**Files:**
- Create: `scripts/check-legal.mjs`
- Modify: `package.json` (`check:legal` / `verify` script 追加)

**設計判断:** PHASE-0-CONCEPT.md §4-2 と `tcharton-fx/CLAUDE.md` §4 の grep 仕様を Node script 化。`dist/**/*.html` を対象、ヒット 0 件で exit 0、1 件以上で exit 1 (CI ゲート)。

- [ ] **Step 1: `scripts/check-legal.mjs` 作成**

```javascript
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
      console.error(`\n❌ ${file}:`);
      for (const { category, term, count } of hits) {
        console.error(`   [${category}] /${term}/ × ${count}`);
        totalHits += count;
      }
    }
  }

  if (totalHits === 0) {
    console.log('\n✅ PASS: 法的禁止用語ヒット 0 件');
    process.exit(0);
  } else {
    console.error(`\n❌ FAIL: 法的禁止用語ヒット ${totalHits} 件 (β 公開ブロック)`);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: package.json に script 追加**

`scripts` セクションを以下に置換:

```json
"scripts": {
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "node --test tests/",
  "check:legal": "node scripts/check-legal.mjs",
  "verify": "npm run build && npm run check:legal && npm test"
}
```

- [ ] **Step 3: PASS ケースを確認**

```bash
npm run verify
```

期待: build → `✅ PASS: 法的禁止用語ヒット 0 件` → `# tests 11  # pass 11`、最終 exit 0。

- [ ] **Step 4: FAIL ケース (試験用フィクスチャ) で検証**

`src/pages/index.astro` の hero `<p>` 内に一時的に「絶対」を入れる:

```astro
<p class="mt-6 text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
  絶対 MT5_Python ダッシュボードと裁量 FX 教育コンテンツ。
```

```bash
npm run verify
```

期待: `❌ FAIL: 法的禁止用語ヒット 1 件`、exit 1 で test まで到達しない。

「絶対」を削除して元に戻し、再度 PASS 確認:

```bash
npm run verify
```

期待: PASS。

- [ ] **Step 5: Commit**

```bash
git add scripts/check-legal.mjs package.json
git commit -m "feat: legal term grep script + verify npm script (build+legal+test)"
```

---

## Task 10: README.md 追記 (起動方法 + 実装ステータス)

**Files:**
- Modify: `README.md` (末尾に追記)

- [ ] **Step 1: 既存 README.md を Read**

`C:\Users\ohuch\Desktop\HARTON\tcharton-fx\README.md` を確認。既存内容を保ったまま末尾に「## 実装ステータス (Phase 1 Week 1-2 完了)」セクションを追記。

- [ ] **Step 2: 末尾に追記**

```markdown

---

## 実装ステータス (Phase 1 Week 1-2 完了)

### 技術スタック (Phase 1)

- Astro 5.x (SSG, TypeScript strict)
- Tailwind CSS 4.x (via @tailwindcss/vite)
- Node 22 LTS
- デプロイ: Cloudflare Pages + GitHub 連携

### 起動方法

```bash
# 依存インストール
npm install

# dev サーバ起動 (http://localhost:4321)
npm run dev

# 本番ビルド
npm run build

# 全検証 (build + 法的 grep + テスト)
npm run verify

# 個別
npm run check:legal   # dist/ を法的禁止用語 grep
npm test              # build assertion テスト
```

### 完了タスク

- [x] Astro 5 + Tailwind 4 セットアップ
- [x] BaseLayout / Header / Footer / SEO / DisclaimerBanner コンポーネント
- [x] ホーム placeholder ページ
- [x] 法的禁止用語 grep スクリプト (景表法 + 金商法)
- [x] Cloudflare Pages 連携 + fx.tcharton.com 公開

### 次工程 (Phase 1 Week 3-4)

- `/docs/` 配下 5 ページ (install / quickstart / dashboard-guide / architecture / spec)
- `/about/` `/services/` `/legal/*` `/contact/` ページ本実装
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README に Phase 1 Week 1-2 起動方法 + ステータス追記"
```

---

## Task 11: Cloudflare Pages 連携設定 (代表手動操作)

**Files:** なし (Cloudflare dashboard 操作)

**前提:** ルートドメイン `tcharton.com` が Cloudflare で管理されていること (② tcharton セッションで設定済の想定)。

- [ ] **Step 1: GitHub にプッシュ**

すべての Task 1-10 が commit 済みであることを確認:

```bash
git status
git log --oneline -20
```

push:

```bash
git push origin main
```

- [ ] **Step 2: Cloudflare Pages プロジェクト作成 (代表手動)**

代表操作:
1. https://dash.cloudflare.com → Workers & Pages → Create application → Pages → Connect to Git
2. GitHub 連携 (未連携なら認可)
3. リポジトリ `tcharton-fx` を選択 → Begin setup
4. 設定:
   - Project name: `tcharton-fx` (Cloudflare 内部識別、URL には影響しない)
   - Production branch: `main`
   - Framework preset: `Astro`
   - Build command: `npm run verify`
   - Build output directory: `dist`
   - Root directory: (空、リポジトリ root)
   - Environment variables (Production):
     - `NODE_VERSION` = `22`
5. Save and Deploy

- [ ] **Step 3: 初回ビルドログ確認**

Cloudflare Pages ダッシュボードで初回 deployment を開き、ログを確認:
- `npm install` 成功
- `npm run verify` 内訳: `npm run build` → `npm run check:legal` (PASS) → `npm test` (11 pass) すべて緑
- Deployment 成功

完了後、Cloudflare が一時 URL (例: `https://tcharton-fx-abc.pages.dev`) を払い出す。

- [ ] **Step 4: 一時 URL で動作確認**

`https://tcharton-fx-abc.pages.dev` をブラウザで開く。Task 8 の placeholder ページが表示されることを確認。

- [ ] **Step 5: Commit (本タスクは push 済みなのでコード変更なし)**

特になし。次タスクへ。

---

## Task 12: Custom Domain (`fx.tcharton.com`) + DNS 設定 (代表手動操作)

**Files:** なし (Cloudflare DNS 操作)

- [ ] **Step 1: Cloudflare Pages に Custom domain 追加 (代表手動)**

代表操作:
1. Cloudflare Pages → `tcharton-fx` プロジェクト → Custom domains → Set up a custom domain
2. Domain: `fx.tcharton.com`
3. Cloudflare が自動で DNS レコード追加を提案 → Activate domain
4. 自動的に CNAME `fx.tcharton.com → tcharton-fx.pages.dev` が tcharton.com zone に追加される
5. 数分待って Active 表示確認

- [ ] **Step 2: HTTPS / SSL 証明書発行待ち**

Cloudflare Universal SSL が自動で証明書を払い出す (通常数分〜15 分)。Pages ダッシュボードで `fx.tcharton.com` が緑 (Active) になるのを待つ。

- [ ] **Step 3: HSTS preload 包含確認**

ルート `tcharton.com` の HSTS が `includeSubDomains` を含んでいれば `fx.tcharton.com` も自動的に preload 対象。

確認手順 (代表):
1. https://hstspreload.org/?domain=tcharton.com で `tcharton.com` を検索
2. `includeSubDomains` が ON で preload 済を確認
3. 含まれていない場合は ② tcharton セッションへエスカレーション (HSTS preload 追加申請)

- [ ] **Step 4: 本番 URL で動作確認**

ブラウザで以下を確認:
- `https://fx.tcharton.com/` → Task 8 の placeholder ページが表示
- 鍵マーク (HTTPS 有効) 表示
- 開発者ツール → Network で `strict-transport-security: max-age=...; includeSubDomains; preload` ヘッダ確認

- [ ] **Step 5: Lighthouse 簡易確認 (任意)**

Chrome 開発者ツール → Lighthouse タブで Performance / Best Practices / SEO を測定。Phase 1 Week 1-2 placeholder としては Performance ≥ 95, SEO ≥ 90 を期待。低い場合は Phase 1 Week 7-8 (QA) で対応。

---

## Task 13: Week 1-2 完了報告 (REPORT 追記 + ① への報告)

**Files:**
- Modify: `REPORT-TO-ROOT-FROM-TCHARTON-FX.md` (末尾に追記)

- [ ] **Step 1: 全 git commit hash を取得**

```bash
git log --oneline main
```

Week 1-2 で発生した commit を控える (Task 1 の chore: initial 以降全て)。

- [ ] **Step 2: 最終 verify 実行**

```bash
npm run verify
```

期待: build + 法的 grep PASS + tests 11 pass。出力をログ保存。

- [ ] **Step 3: 報告追記**

`REPORT-TO-ROOT-FROM-TCHARTON-FX.md` 末尾に追記:

```markdown
## Phase 1 Week 1-2 (基盤構築) 完了報告 (YYYY-MM-DD)

### Phase ステータス

- **現在 Phase**: 1 Week 1-2 → **完了** / Week 3-4 (静的ページ + Docs) 着手準備中
- **公開状態**: https://fx.tcharton.com で placeholder ページ稼働中

### 実装内容

- Astro 5 + Tailwind 4 + TypeScript strict プロジェクト初期化
- BaseLayout / Header (7 ナビ) / Footer (リスク開示) / SEO / DisclaimerBanner コンポーネント
- ホーム placeholder (Hero + 3 カードセクション)
- 法的禁止用語 grep スクリプト (景表法 12 語 + 金商法 6 語)
- npm script `verify` (build + grep + test) を Cloudflare Pages ビルドコマンドに設定
- GitHub `<USERNAME>/tcharton-fx` リポジトリ作成 + push
- Cloudflare Pages 連携 + fx.tcharton.com Custom domain + 自動 SSL

### git commit hashes

(Task 13 Step 1 で取得した commit hash 一覧を貼る)

### 法的検証

- 景表法 grep: PASS (ヒット 0)
- 金商法 grep: PASS (ヒット 0)
- 開示義務記載: PASS (Footer に常時表示)

### HSCEL §3.1 4 Skill 適用記録

- ✅ superpowers:writing-plans (Phase 1 Week 1-2 計画起草)
- ✅ superpowers:executing-plans (or subagent-driven-development) (本タスク群実行)
- ✅ superpowers:requesting-code-review (Week 1-2 完了時点で codex 等にレビュー依頼)
- ✅ superpowers:receiving-code-review (上記レビューへの対応)
- ⏳ gstack (本格的サイト QA は Week 7-8 で実施)

### Lighthouse (placeholder ページ、参考)

- Performance: ___
- Accessibility: ___
- Best Practices: ___
- SEO: ___

### ① への確認事項

- placeholder ページの体裁が代表の意向と合致するか確認
- Week 3-4 着手の承認
```

- [ ] **Step 4: Commit + push**

```bash
git add REPORT-TO-ROOT-FROM-TCHARTON-FX.md
git commit -m "docs: REPORT に Phase 1 Week 1-2 完了報告追記"
git push origin main
```

最後の push が Cloudflare Pages 自動デプロイをトリガーし、本書追記が公開サイトに影響しない (md ファイルなのでビルド対象外) ことを確認。

- [ ] **Step 5: ① への報告**

チャットで ① セッション (HARTON 総合責任者) に下記要旨で報告:

> ⑦ tcharton-fx Phase 1 Week 1-2 完了。
> - fx.tcharton.com で placeholder 公開中
> - 法的 grep PASS / tests 11 pass / Cloudflare Pages 自動デプロイ稼働
> - 詳細は `tcharton-fx/REPORT-TO-ROOT-FROM-TCHARTON-FX.md` Week 1-2 entry 参照
> - Week 3-4 (Docs + 静的ページ) 着手承認をお願いします

---

## Self-Review (本書執筆者による)

**1. Spec coverage check** (PHASE-0-CONCEPT.md の Week 1-2 要件カバー):

| PHASE-0 §6 Week 1-2 要件 | 対応タスク |
|---|---|
| Astro プロジェクト初期化 | Task 2 |
| Tailwind 設定 | Task 3, 4 |
| 共通レイアウト (Header/Footer/SEO meta) | Task 5, 6 |
| Cloudflare サブドメイン DNS 設定 | Task 12 |

PHASE-0-CONCEPT.md §4-3 注釈バナーは Task 7 で部品化済 (本格統合は Week 5-6)。

**2. Placeholder scan:** 「TBD」「TODO」なし。代表手動操作は Step で明示。

**3. Type consistency:**
- `BaseLayout` Props: `title, description, canonicalPath` — Task 5 / 8 で一貫
- npm scripts (`dev / build / test / check:legal / verify`) — Task 5 / 9 で重複定義あり → Task 9 が最終版 (上書き)、Task 5 段階は仮実装で問題なし
- nav links 配列 — Task 6 内に閉じる

**4. ファイル配置:** すべて `C:\Users\ohuch\Desktop\HARTON\tcharton-fx\` 配下、絶対パス不要 (working directory で完結)。

---

**End of Phase 1 Week 1-2 Implementation Plan v1.0**
