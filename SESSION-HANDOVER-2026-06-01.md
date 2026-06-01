# セッション引き継ぎ — tcharton.com 本番公開 (2026-06-01)

> 新セッションはこれを読めば現状を即把握できる。正本ルールは `OPERATIONS-POLICY.md`、入替手順は `DEPLOY-SWAP-TO-TCHARTON-COM.md` を併読。

---

## 0. 最重要の現状 (一言で)

**FX 専門サイトは https://tcharton.com で本番公開・正常稼働中。** 旧 WEB 制作サイトと入れ替え完了。

- 公開URL(本番): **https://tcharton.com** (実測 200 / 最新コミット配信中)
- 公開URL(仮): https://forex.harton-info.workers.dev (同一物・Worker の既定URL)
- GitHub: **`TC-HARTON/forex`** (main ブランチ) ← 本番リポジトリ
- ローカル作業ディレクトリ: `C:\Users\ohuch\Desktop\HARTON\tcharton-fx`
- 最新コミット: `06cefdf` (ヒーローにゴールドチャート追加) ※ローカル=リモート一致

---

## 1. サイトの正体・技術

- **XAUUSD (ゴールド) 中上級者向け FX 専門サイト** (3本柱: ①裁量手法 ②MT5-Python Trading Dashboard ③海外ブローカー検証 / 将来アプリ販売)
- **技術: Astro (静的出力) + Tailwind v4 + Node 22+** → `npm run build` で `dist/` に静的HTML 31ページ
- **配信: Cloudflare Workers Static Assets** (`wrangler.jsonc` の `assets.directory: ./dist`)
  - ※ 旧サイトも Workers Static Assets 方式。Pages ではない。
  - デプロイ: Cloudflare の Git 連携 → `npm run build` → `npx wrangler deploy` が自動実行
- ※ 代表は当初「本サイト(素HTML)踏襲」を指示したが、既存FXサイトがAstro構築済みのため **Astro 継続を承認 (2026-06-01)**。理由: 記事が増え続けるメディア特性に Astro が最適 (記事追加で一覧/sitemap/RSS 自動反映)。

---

## 2. Cloudflare 構成 (重要)

| 項目 | 値 |
|---|---|
| アカウントID | 470ab08bca6578ded9ccf1650e85bd5a |
| Worker プロジェクト名 | **forex** (※GitHub上の `forex` repo 由来。`tcharton-fx` ではない) |
| 連携リポジトリ | TC-HARTON/forex (main) |
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npx wrangler deploy` |
| カスタムドメイン | **tcharton.com** (forex プロジェクトに付与済み) |
| 旧 tcharton プロジェクト | Worker。tcharton.com は **削除済み** (forex へ移管完了) |
| APIトークン (CI) | "forex build token" (Cloudflare 側に設定済み) |

- **AI はローカルに Cloudflare 認証を持たない** (CLOUDFLARE_API_TOKEN 未設定 / wrangler 未ログイン)。
  → Cloudflare ダッシュボード操作 (ドメイン/プロジェクト設定) は**代表手動のみ**。AI は git push までが範囲。

---

## 3. 今セッションで実施した作業 (全完了・push済み)

1. **全記事にインライン SVG 図解 + ロングテール keywords** (SEO)
2. **全ページ装飾** (カードアクセント色 / アニメーション / gradient-text)
3. **トップ刷新**: 統計バー削除 → 最新記事自動反映セクション / 3本柱カード装飾 / **ヒーローに XAUUSD ゴールドチャート SVG アニメ** (最新)
4. **お問い合わせ機能**: Web3Forms 実送信 (`/contact/`) → サンキューページ (`/contact/thanks/`)
5. **RSS** (`/rss.xml`) blog-posts.json 連動・head に自動発見リンク
6. **404 ページ** / **about に代表画像 (ceo.webp 顔隠し・氏名非公開)**
7. **モバイルナビ**: ハンバーガー + 右ドロワー (menu.js)
8. **ブローカー比較を一次情報で全面刷新** (口座種別分離 / XM「EUR/USD 1.0pips」誤解訂正 / Trustpilot・ForexBrokers.com 出典)
9. **入出金記事を一次情報化** (金融庁登録業者 GMO第00006号/SBI VC第00011号/bitbank第00004号 / 販売所vs取引所コスト)
10. **ドメイン置換** fx.tcharton.com → tcharton.com (76箇所/30ファイル)
11. **デプロイ設定** wrangler.jsonc + _headers (HSTS preload) + _redirects
12. **厳格監査** (SEO/OGP/内部リンク/sitemap) → リンク切れ修正・description拡充
13. **運営方針正本** `OPERATIONS-POLICY.md` 作成 (CLAUDE.md 必読書に登録)

---

## 4. 検証ゲート (公開前 mandatory)

```bash
cd C:\Users\ohuch\Desktop\HARTON\tcharton-fx
npm run verify   # = build (31ページ) + check:legal + test
```
合格基準: build成功 / 法令grep PASS(リスク0件) / test 21 pass・0 fail / fx.tcharton.com 残存0

**現状の最新検証**: VERIFY_EXIT=0 / 31ページ / 21 pass / 法令 PASS。

---

## 5. 通常運用 (記事追加など)

- **記事を追加** → `src/data/blog-posts.json` に1エントリ + `src/pages/blog/<slug>/index.astro` 作成
  → トップ最新記事・/blog/ 一覧・sitemap・RSS に**自動反映**
- **数値・主張は一次情報の出典必須・断定回避** (HSCEL §3.3)
- **禁止語 grep 0件維持** (圧倒的/完璧/業界一/世界一/No.1/最高/最強/最速/唯一)。「最新」等は許容
- **デプロイ**: main に push すれば Cloudflare が自動ビルド&デプロイ
- **データ自動更新**: GitHub Actions (daily-data-refresh.yml) が日次で 経済指標/通貨強弱/GitHub stats を取得 → 自動再ビルド

---

## 6. 既知の注意点・トラブル履歴

- **「ビルド失敗ログ」を見ても慌てない**: 初回デプロイで `npm ci` が lock 未同期で1回失敗 (12:12 UTC)。直後に `package-lock.json` 同期 push で解決、12:23 成功。Cloudflare のビルド詳細ページは**過去の特定ビルドを保持表示**するため、古い失敗ログが見え続けることがある。最新は「デプロイ」一覧で確認。
- **package.json 変更時は必ず `npm install` で lock 同期してから push** (でないと `npm ci` 失敗)。
- **Cloudflare bot の PR** (#1: wrangler name を forex に統一) はマージ済み。今後も config名不一致PRが出たらマージ可。
- **preview MCP (port 8789) は別プロジェクト (tcharton worktree) 固定**で FXサイトを開けない。FX確認は `npm run preview` (localhost:4321) か Chrome CDP を使う。
- **モバイル検証で `wide:74` 等が出るのはドロワー(画面外)の検出ノイズ**。真の指標は `scrollWidth === innerWidth` (= 横スクロール無し)。375/320px で確認済み。

---

## 7. 残タスク (代表のタイミングで / 急がない)

1. **www → tcharton.com 301 リダイレクト** (未設定 / Cloudflare の DNS CNAME + Redirect Rules)。代表が中断中。
2. **旧サイト後始末** (新サイト安定後): 旧 tcharton Worker 停止・削除、GitHub `TC-HARTON/tcharton` repo を Archive
3. **repo名整理**: `forex` → `tcharton` リネーム (Cloudflareは内部ID追跡で連携維持 / ローカル `git remote set-url` 要更新)
4. **Search Console**: tcharton.com で sitemap 再送信
5. **Web3Forms 専用キー**: 現状 tcharton.com 共用キー。fx専用キー取得時は `src/pages/contact/index.astro` の `WEB3FORMS_ACCESS_KEY` 1行差し替え

---

## 8. 絶対遵守 (運営方針 §2 / 詳細は OPERATIONS-POLICY.md)

- 投資助言業 (金商法 §29) 非該当: 売買シグナル・推奨銘柄・断定を出さない
- 景表法: 禁止語0件 / アフィリエイト開示
- 氏名 (大内達也) サイト内非公開 / 住所は沼津市まで
- メルマガはやらない (削除済・復活させない)
- 取引データ (口座/残高/P&L/ポジション) は export・公開しない

---

**作成**: 2026-06-01 / 最新コミット `06cefdf` / 本番 https://tcharton.com 稼働中
