# T.C.HARTON (tcharton.com) サイト運営方針

> 本書はサイトの**運営方針の正本**。実装判断・記事執筆・公開判断はすべて本書に従う。
> 確定: 2026-06-01 (代表決定の集約) / 対象: `TC-HARTON/forex` repo (本番ドメイン tcharton.com 予定)

---

## 0. サイトの定義

- **ドメイン**: tcharton.com (現 WEB 制作サイトと入れ替えで本番化予定 / 手順は `DEPLOY-SWAP-TO-TCHARTON-COM.md`)
- **正体**: XAUUSD (ゴールド) 中上級者向け FX 専門サイト
- **技術**: Astro (静的出力) / Tailwind / Cloudflare Pages / Node 22+
- **屋号**: T.C.HARTON (所在地は沼津市まで・氏名は非公開・連絡先 info@tcharton.com)

---

## 1. 3 本柱 (提供価値)

| # | 柱 | 内容 | 主ページ |
|---|---|---|---|
| 01 | XAUUSD 裁量手法・タイミング発信 | マルチTF + 構造ベースでゴールドの相場を読む手法 (教育目的) | /method/ |
| 02 | MT5-Python Trading Dashboard | 8銘柄×4TF・通貨強弱・相関・経済指標を統合した分析の司令塔 | /dashboard/ |
| 03 | 海外 FX ブローカー検証 | 海外15サイト以上の一次情報で約定・スプレッド・規制・流動性を比較 | /broker/ |

将来: アプリ販売 (Phase 3 以降) / IC Markets 等の IB・アフィリエイト収益。

---

## 2. 絶対遵守の法的ライン (越えない)

1. **投資助言業 (金商法 §29) 非該当を厳守**
   - 売買シグナル・推奨銘柄・特定タイミングの断定を出さない
   - ダッシュボードの数値は「市場全体から計算した客観値」であり助言ではない、と明示
   - 全記事・トップ・免責に非該当宣言を置く
2. **景表法 (優良誤認回避)**
   - 禁止語 grep 0件を維持: 圧倒的 / 完全(優良誤認文脈) / 完璧 / 業界一 / 世界一 / No.1 / 最高 / 最強 / 最速 / 唯一
   - 「最新」「最小」など事実・技術用語の「最X」は許容 (文脈確認)
   - 機械検証: `npm run check:legal` (build 後)
3. **アフィリエイト開示 (景表法§5 / 特商法)**
   - 広告リンクを含むページは冒頭で明示。順位は紹介料で操作しない
4. **個人情報・プライバシー**
   - 氏名 (大内達也) はサイト内非公開 / 住所は沼津市まで / alt も氏名なし
   - お問い合わせは Web3Forms 経由 (外部送信先を明示) + プライバシー同意チェック

---

## 3. コンテンツ品質基準 (HSCEL §3.3 準拠)

- **数値・主張は一次情報の出典必須**。断定を避け「約」「目安」「変動あり」を付す
  - 例: ブローカースプレッドは ForexBrokers.com / Trustpilot / 各社公式の参照時点を明記
  - 例: 規制・法令は金融庁・条文を一次情報とする
- **記事はイラスト (インライン SVG) 付き**。図は `<svg role="img" aria-label>` で代替テキスト必須
- **SoT (Single Source of Truth)**: 記事メタは `src/data/blog-posts.json` / `method-posts.json` / `brokers.json` に集約。1 行追加でトップ最新記事・sitemap・RSS に自動反映

---

## 4. SEO / OGP / 技術必達 (全ページ)

- title (15–60字・ブランド名末尾) / meta description (70–160字) / canonical 絶対URL (tcharton.com)
- OGP (og:title/description/image/url/type) + Twitter Card。og:image はページ種別で出し分け
- JSON-LD (Organization / WebPage / BreadcrumbList / Article / FAQPage 該当時)
- 内部リンク切れ 0 / h1 各ページ1個 / viewport / html lang="ja"
- sitemap.xml (noindex ページは除外) / robots.txt (主要AIクローラ許可) / rss.xml (記事連動)
- ロングテールキーワード (keywords メタ) を全記事に付与

---

## 5. デザイン / UX

- HARTON ブランド: teal-700 #1B4965 主軸 + indigo/amber/rose アクセント、明背景、Noto Sans JP + Inter
- カードは装飾 (左カラーボーダー・アイコン・上端バー・card-lift・arrow-go・reveal) でメリハリ
- アニメーション (fx-glow/float/bob/fade-up/gradient-text) は `prefers-reduced-motion` で全無効化
- **モバイルフレンドリー厳守**: 横スクロール 0 / タップ領域 40px+ / input font-size 16px (iOSズーム防止) / ハンバーガー+ドロワー

---

## 6. データ自動更新

- 経済指標 (Forex Factory)・通貨強弱 (ECB/Frankfurter)・GitHub stats を GitHub Actions (daily-data-refresh.yml) で日次取得
- 鮮度がFXサイトの価値。トップに「いまの相場コンディション」を毎日自動更新

---

## 7. 公開・デプロイ運用

- **検証ゲート**: 公開前に必ず `npm run verify` (build + check:legal + test) が green
  - build 成功 / 法令 grep 0件 / test 全 pass / fx.tcharton.com 残存 0
- **Cloudflare / GitHub 連携の設定変更は代表手動**。AI は push までは可、Cloudflare ダッシュボード操作は代行しない
- 本番 repo は `TC-HARTON/forex`。ドメイン入れ替え後にリポジトリ名整理 (forex→tcharton リネーム)

---

## 8. やらないこと (確定)

- メルマガ (やらない)
- 売買シグナル配信・投資助言
- 氏名・詳細住所の公開
- 出典のない数値・断定
- 禁止語による誇大表現
- 口座番号/残高/P&L/ポジション/取引記録の export・公開 (export_for_fx_site.py 制約)

---

**確定根拠**: 本セッション (2026-06-01) の代表決定 — FXサイト本番化 / 現サイト廃止 / 方法B (ドメイン付替) / 記事イラスト+SEO完璧化 / 全ページ装飾 / 入出金記事の一次情報化 / 問合せ+thanks+RSS 整備 / 厳格監査。
**最終更新**: 2026-06-01
