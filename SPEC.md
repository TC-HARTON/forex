# tcharton-fx SPEC — FX 専門サイト品質仕様書

> ドメイン: `fx.tcharton.com` (tcharton.com サブドメイン)
> コンセプト: **「裁量トレーダーのための MT5 ローカル統合ダッシュボード」** (A+B ハイブリッド)
> 作品本体: `C:\Users\ohuch\Desktop\MT5_Python\`
> Version: 1.0
> Adopted: 2026-05-25
> Owner: ⑦ FX 専門サイト構築責任者

---

## 0. 強制法規 (Immutable)

### 0.1 適用法規範

| 区分 | 法令 | 主要リスク |
|---|---|---|
| **金商法** | 金融商品取引法 §29 (投資助言業) | 登録なしでの「売買シグナル」「推奨銘柄」発信 |
| **景表法** | 景品表示法 §5 (優良誤認 / 有利誤認) | 「必勝」「絶対」「確実」「No.1」等の禁止表現 |
| **特商法** | 特定商取引法 §11 (通信販売広告表示) | 教材販売・有料メンバーシップ時の表示義務 |
| **著作権法** | 著作権法 §32 (引用) | スクショ・引用の要件遵守 |
| **不当競争防止法** | §2(1)14 (営業誹謗) | 他 FX 業者・ツールへの名指し批判 |

### 0.2 投資助言業 非該当宣言 (全ページ強制掲載)

**本サイトは投資助言業ではない**。提供するのは:
- ✅ ツール (MT5_Python) の紹介・使い方
- ✅ 裁量分析手法の教育コンテンツ
- ✅ 経済指標・通貨強弱の客観データ可視化
- ❌ 売買シグナル配信 (禁止)
- ❌ 推奨銘柄・通貨ペア発信 (禁止)
- ❌ 「今買え」「今売れ」表現 (禁止)
- ❌ 個別具体的売買判断の助言 (禁止)

### 0.3 ブランド禁止用語 (grep 0 件 mandatory)

公開前 grep 検証:

```bash
# 景表法 (12 パターン)
grep -rE "(必勝|絶対|確実|保証|稼げる|誰でも|簡単に|楽に|不労所得|未来予測|的中率 ?100|勝率 ?100)" tcharton-fx/dist/ --include="*.html"

# 金商法 (6 パターン / 投資助言業 リスク)
grep -rE "(買いシグナル|売りシグナル|今買え|今売れ|推奨銘柄|おすすめ通貨ペア)" tcharton-fx/dist/ --include="*.html"

# 景表法 補強 (6 パターン)
grep -rE "(業界一|世界一|圧倒的|最高|最強|最速)" tcharton-fx/dist/ --include="*.html"
```

ヒット 0 件 mandatory。`scripts/check-legal.mjs` で自動化。

---

## 1. サイト構造 (Phase 1 必達)

```
fx.tcharton.com/
├── /                          トップ (Hero + コンセプト + 3 カード)
├── /docs/                     OSS ドキュメント hub
│   ├── /docs/install/         インストール
│   ├── /docs/quickstart/      クイックスタート
│   ├── /docs/dashboard-guide/ ダッシュボード使い方
│   ├── /docs/architecture/    アーキテクチャ
│   └── /docs/spec/            SPEC 公開 (読み取り専用)
├── /blog/                     裁量手法・経済指標活用記事 hub
├── /about/                    代表プロフィール (大内達也 / E-E-A-T)
├── /legal/                    法令表記 hub
│   ├── /legal/disclaimer/     免責事項 (損失リスク警告)
│   ├── /legal/terms/          利用規約
│   ├── /legal/privacy/        プライバシーポリシー
│   └── /legal/tokushoho/      特商法表記 (有料コンテンツ提供時)
└── /contact/                  問い合わせ (将来 Phase 2 メンバーシップ受付)
```

**Phase 1 (Week 3-4) で公開**: `/`, `/docs/*`, `/about/`, `/legal/*`
**Phase 1 (Week 5-6)**: `/blog/`, `/dashboard/` (ライブ可視化ではなく静止画ギャラリー)
**Phase 2 以降**: `/services/`, `/contact/`

---

## 2. SEO 必達 (全ページ強制)

### 2.1 <head> 必須要素

```html
<title>(30-60 字 / ブランド名末尾)</title>
<meta name="description" content="(120-160 字 / 主訴求 + CTA)">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<meta name="theme-color" content="#0a0a0a">
<link rel="canonical" href="https://fx.tcharton.com/...">
<meta property="og:type" content="website">  <!-- or "article" -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="(canonical 同一)">
<meta property="og:image" content="(絶対 URL)">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="...">
<meta property="og:site_name" content="fx.tcharton.com">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

### 2.2 CSP (Content-Security-Policy) 必達

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';       # Tailwind 4 inline 許容
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
require-trusted-types-for 'script';
trusted-types default;
upgrade-insecure-requests
```

### 2.3 サイトマップ + robots.txt

- `sitemap.xml`: Astro 標準 (`@astrojs/sitemap`)
- `robots.txt`: AI ボット (GPTBot / ClaudeBot / PerplexityBot / Google-Extended) 許可

### 2.4 内部リンク

- 各ページ最低 3 リンク (関連ページへ)
- BreadcrumbList Schema 全ページ (トップ除く)

---

## 3. LLMO / AIO / GEO (全ページ必達)

### 3.1 JSON-LD 4 種以上

| Schema | 必須範囲 |
|---|---|
| `Organization` (T.C.HARTON) | 全ページ (BaseLayout 集約) |
| `WebSite` (search action) | トップのみ |
| `WebPage` | 全ページ |
| `BreadcrumbList` | トップ以外 |
| `SpeakableSpecification` | 全ページ (cssSelector: ["h1", "#summary"]) |
| `Article` | /blog/* |
| `TechArticle` | /docs/* |
| `SoftwareApplication` | /docs/install/ /docs/quickstart/ |

### 3.2 Wikidata Q 統合

| 対象 | Q コード |
|---|---|
| 日本円 (JPY) | Q8367 |
| 米ドル (USD) | Q4917 |
| 外国為替市場 (Forex) | Q204034 |
| MetaTrader 5 | (一般名詞化のため Q なし) |
| Python | Q28865 |

`additionalType` 配列に Wikidata URL を掲載。

### 3.3 GEO (Generative Engine Optimization)

- `<blockquote cite="https://...">` 引用ブロック (公的出典)
- `.go.jp` / `.ac.jp` 公的リンク (金融庁 / 日銀 / 財務省 / 統計局)
- 学術引用 (arXiv / DOI / KDD / SSRN) 該当時
- Lead Evidence Block (記事冒頭に出典明示)

### 3.4 llms.txt / llms-full.txt

- root に配置
- 全ページ要約 + URL リスト
- AI 検索引用率向上目的

---

## 4. UI/UX 必達

- **Disclaimer 全ページ表示** (`DisclaimerBanner` sticky top)
- **CTA 3 配置** (Hero + 中間 + フッター)
- **モバイル**: タップ領域 44x44px 以上 / レスポンシブ完備
- **WCAG 2.2 AA** 準拠 (axe-core / Pa11y で検証)
- **CWV 全 GOOD** (LCP < 2.5s / INP < 200ms / CLS < 0.1)
- **Lighthouse 90+** 全カテゴリ

---

## 5. E-E-A-T (Google) 必達

### 5.1 Author (執筆者)

`/about/` で全要素開示:
- 氏名: 大内 達也
- 経歴: HARTON 代表 / 個人事業主 / WEB 制作 + AI 予測モデル開発
- FX 経験: 裁量トレーダー (実年数 / 主戦時間 21:00-25:00 JST)
- 開発: MT5_Python (Python + MQL5 EA / GitHub)
- 連絡先: info@tcharton.com

### 5.2 各記事 (Phase 2 以降)

- `Article` JSON-LD `author` フィールド
- 著者名 + プロフィールリンク
- 投稿日 / 更新日
- 出典明記 (`<blockquote cite>`)

### 5.3 編集ポリシー (Phase 2 以降)

- `/about/editorial-policy/` に明記
- 引用基準 / 訂正方針 / 利益相反開示

---

## 6. 法的表記必達ページ

### 6.1 /legal/disclaimer/ (免責事項)

- 投資助言業 非該当宣言 (verbatim 0.2)
- 損失リスク警告 (FX 元本超過損失の可能性)
- 第三者ツール (MT5 / MetaQuotes / FX 業者) 商標明示
- 過去実績は将来を保証しない

### 6.2 /legal/terms/ (利用規約)

- サイト利用条件
- 禁止事項
- 免責範囲
- 準拠法 (日本法)

### 6.3 /legal/privacy/ (プライバシーポリシー)

- 個人情報取得項目 (問い合わせフォーム / Cookie)
- 利用目的
- 第三者提供
- アクセス解析ツール (使用時)

### 6.4 /legal/tokushoho/ (特商法表記)

- Phase 2 以降 (有料コンテンツ提供時) に本実装
- Phase 1 は「現在無料」の旨記載

---

## 7. 技術スタック (Phase 1 確定)

| 項目 | 採用 |
|---|---|
| 静的サイトジェネレータ | Astro 6.x |
| CSS | Tailwind CSS 4.x (via `@tailwindcss/vite`) |
| TypeScript | strict |
| Node | 22+ LTS (engines.node >= 22.0.0 / 実運用 Node 24) |
| デプロイ | Cloudflare Pages + GitHub 連携 |
| リポジトリ | `TC-HARTON/forex` (private 当面 / 公開検討) |
| 検証 | `npm run verify` = build + check:legal + test |

---

## 8. 検証ゲート (公開前 mandatory)

```bash
npm run verify           # build + 法的 grep + テスト
# ↓ PASS なら以下も追加検証:
npm run preview          # ローカル確認
# Lighthouse 全カテゴリ 90+
# axe-core / Pa11y で WCAG 2.2 AA PASS
# securityheaders.com で A+
# Search Console 構造化データ検証
```

公開前にすべて PASS mandatory。1 件でも FAIL なら公開禁止。

---

## 9. 改訂履歴

| Version | Date | 内容 |
|---|---|---|
| 1.0 | 2026-05-25 | 初版策定 (A+B ハイブリッドコンセプト確定後 / 全面改修着手) |

---

**改変禁止部分**: §0 強制法規 / §6 法的表記
**改訂可能部分**: §1-5 / §7-8 (代表 ① 承認後のみ)
