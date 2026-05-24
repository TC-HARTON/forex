# fx.tcharton.com — Phase 0 構想 (確定版)

> ⑦ FX 専門サイト構築責任者 セッション 起草仕様。
> 本書は **構想 (What/Why/Scope)** の確定文書であり、実装手順 (How) は本書承認後に `writing-plans` skill で別途生成する。

| 項目 | 内容 |
|---|---|
| **Phase** | 0 (構想具体化) → 確定 |
| **Version** | 1.0 |
| **Owner** | ⑦ FX 専門サイト構築責任者 |
| **Created** | 2026-05-24 |
| **Approver** | ① HARTON 総合責任者 (大内達也) — 承認待ち |
| **Domain** | `fx.tcharton.com` + `live.fx.tcharton.com` |
| **HSCEL** | §3.1 4 Skill mandatory / §3.3 事実確認 mandatory / §0.0.7 越境禁止 |

---

## 1. 8 項目 確定マトリクス

### ① サイト目的

ハイブリッド (OSS 紹介 + 教育 + 商用)。Phase で軸を分離。

- **Phase 1 (情報発信中心)**: MT5_Python の OSS 紹介 / ドキュメント / 裁量 FX 教育コンテンツ / EA カスタム受注窓口
- **Phase 2 (収益拡張)**: 商用版アプリ販売 + 海外 FX 業者アフィ (ツール紹介型限定) + EA カスタム受注 本格展開

### ② Primary ターゲット読者

- **Primary**: 裁量 FX トレーダー (中〜上級、**海外 FX 業者利用者**)
- **Secondary**: MT5 + Python 開発者 (OSS Star/Issue/PR 経路、Sponsor 経路)
- **対象外**: FX 初心者 / 投資情報を求める一般層 (動線分散を避ける)

ホーム / About / 主要記事は Primary に向けて執筆。Secondary は `/docs/` を主玄関とする。

### ③ 収益モデル

| | Phase 1 | Phase 2 |
|---|---|---|
| EA カスタム受注 (`/services`) | ✅ 唯一の収益化要素 | ✅ 本格展開 |
| 商用版アプリ販売 (`/pro` 新設) | ❌ なし | ✅ 有料ライセンス / リッチ版ダッシュボード |
| 海外 FX 業者アフィ (`/partner` 新設) | ❌ なし | ✅ **ツール紹介型に限定** (比較レビュー、推奨表現を避ける) |
| 教材販売 (note/Gumroad) | ❌ なし | △ 需要見て判断 |
| GitHub Sponsors / Open Collective | ❌ なし | △ 需要見て判断 |
| Google AdSense / 表示型広告 | ❌ なし | ❌ なし (Primary 読者に不俱) |

**Phase 1 で収益化するのは `/services` (EA カスタム受注) のみ**。残りは読者・信頼が育ってから。

### ④ 法的要件 (★ 最重要)

#### 4-1. 金商法 (投資助言・代理業)

- **登録**: しない
- **公開ダッシュボード**: **客観データ表示のみ** に厳格化
  - OK: EMA / ADX / RSI / ATR / 通貨強弱 / 構造線 (TL/SR/PDH/PDL/PWH/PWL/PMH/PML/フラクタル) / 経済指標カレンダー
  - グレー (使う場合は表現精査): 「主要 SR を上抜けて H4 トレンド継続中」(教育的解説)
  - **NG (絶対不実装)**: 「今 EUR/USD 買い、TP 1.0900、SL 1.0800」(売買判断の提示)、「おすすめ通貨ペア」、「買いシグナル/売りシグナル」、「今買え/今売れ」、「推奨銘柄」
- **公開対象口座**: デモ口座 または 大内代表専用の公開マスター口座 (実 P&L を露出する個人特定口座は NG)
- **`/blog/case-study`**: 事後解説のみ。リアルタイム / 進行中のトレードは扱わない。「過去にこういう構造でこう動いた」止まり

#### 4-2. 景表法 / 特商法

- 全ページで禁止用語 grep mandatory (CLAUDE.md §4):
  - `必勝|絶対|確実|保証|稼げる|誰でも|簡単に|楽に|不労所得|未来予測|的中率 100|勝率 100`
  - `買いシグナル|売りシグナル|今買え|今売れ|推奨銘柄|おすすめ通貨ペア`
- `/services` (EA カスタム受注) は **特商法表記** mandatory (氏名・住所・連絡先・対価・引渡し時期・返金条件)
- `/legal/` 配下に集約:
  - `/legal/disclaimer/` — 損失リスク開示 (FX のリスク・自己責任原則)
  - `/legal/terms/` — 利用規約
  - `/legal/tokushoho/` — 特商法表記 (Phase 1 でも `/services` 提供のため必須)
  - `/legal/privacy/` — プライバシーポリシー

#### 4-3. 公開ダッシュボードの注釈バナー (恒久表示)

`/dashboard/` ページ最上部に下記バナーを CSS で常時固定表示:

> ⚠ 本ダッシュボードは **客観データの可視化** であり、投資判断の助言・推奨ではありません。表示されるすべての情報は参考に過ぎず、取引による損益は閲覧者ご自身に帰属します。

### ⑤ コンテンツ構造 (Phase 1)

```
fx.tcharton.com/                       ← Static (Cloudflare Pages)
├── /                                   ホーム
│                                       Hero=ライブ Dashboard 導線
│                                       MT5_Python 1 行紹介
│                                       最新記事 3 / カテゴリ 6 リンク
│                                       services 1 行リンク (押し出さない)
├── /dashboard/                         Live ダッシュボード ページ
│                                       上部注釈バナー (§4-3 常時)
│                                       本体は live.fx.tcharton.com を iframe 埋込
├── /docs/                              MT5_Python ドキュメント
│   ├── install/                        インストール手順
│   ├── quickstart/                     最速 5 分で起動
│   ├── dashboard-guide/                ダッシュボード各パネル解説
│   ├── architecture/                   システム構成 (本体 docs/ARCHITECTURE.md 圧縮版)
│   └── spec/                           SPEC.md からの抜粋 (要点のみ、本体 SPEC は改変禁止)
├── /blog/                              教育コンテンツ
│   ├── structure/                      構造ベース裁量 (TL/SR/PDH/PDL/フラクタル)
│   ├── multi-timeframe/                マルチ TF 分析手法
│   ├── currency-strength/              通貨強弱の読み方
│   ├── economic-calendar/              経済指標活用 (Forex Factory)
│   └── case-study/                     デモ口座の事後教育レビュー
├── /services/                          EA カスタム受注 (Phase 1 唯一の収益化)
├── /about/                             大内達也 / T.C.HARTON / 開発背景
├── /legal/                             損失リスク開示 / 利用規約 / 特商法 / プライバシー
└── /contact/                           問い合わせ (フォーム or メール直リンク)

Phase 2 で追加 (本書スコープ外、Phase 2 設計時に再決定):
├── /pro/                               有料商用版 LP
├── /partner/                           海外 FX 業者比較・レビュー
└── /members/                           会員限定エリア
```

#### 5-1. 本体 docs/ 統合方針

- **本体 `MT5_Python/docs/`、`SPEC.md`、`README.md` は改変禁止** (CLAUDE.md §1 / HSCEL §0.0.7 越境禁止)
- サイト側 `/docs/` は **本体を参照しつつ Web 向けに書き下ろし**
- 本体 SPEC からの引用は出典明記 + 編集なし (HSCEL §3.3)
- 本体側に変更があった際は サイト側 `/docs/` を ⑦ セッションで追随更新 (本体改変ではない)

#### 5-2. 言語

- **日本語のみ** (Phase 1)
- 英語化は Phase 2 で需要 (海外 Star / Issue 多発) があれば判断

#### 5-3. 更新頻度

- β 公開後: **週 1 記事ペース** (5 カテゴリを 5 週ローテーション、月 4 本)
- 公開後 8 週時点で 5 + 8 = 13 記事

### ⑥ 公開タイムライン

**T-2 Standard Launch (6-8 週)** 採用。

| Week | マイルストーン | 成果物 |
|---|---|---|
| 1-2 | 設計確定 + Astro セットアップ | Astro プロジェクト初期化 / Tailwind 設定 / 共通レイアウト (Header/Footer/SEO meta) / Cloudflare サブドメイン DNS 設定 |
| 3-4 | 主要静的ページ | `/` `/about/` `/services/` `/legal/*` `/contact/` + docs 5 本 |
| 5-6 | ブログ + Dashboard 統合 | blog 5 カテゴリ各 1 本 + `live.fx.tcharton.com` (Cloudflare Tunnel + Dash 公開) + `/dashboard/` ページ完成 |
| 7-8 | QA + 法的検証 + β 公開 | 全 page Lighthouse / 法的禁止用語 grep (mandatory PASS) / レスポンシブ確認 / Cloudflare Pages 本番公開 |
| 9〜 | 週 1 記事追加運用 | 月 4 本ペース、Phase 2 着手判断は β 公開 12 週後 (約 3 ヶ月) のアクセス・反応データを材料に |

### ⑦ 技術スタック

#### 7-1. Static サイト部分

- **Astro 4.x 系** (SSG、MD/MDX、部分 React 可、最小バンドル)
- **Tailwind CSS 3.x 系** (② tcharton と同コインで運用、デザイントークン継承可)
- **MD/MDX** (ブログ / Docs)
- **TypeScript** (型安全、Astro 推奨)
- **検索**: Phase 1 は Pagefind (静的全文検索) を仮選定、設計フェーズで再評価

#### 7-2. Dashboard サーバ部分

- **既存 `MT5_Python` を無改変流用** (HSCEL §0.0.7 越境禁止)
- Python 3.11+ / Dash / dash-extensions (WebSocket)
- MT5 接続: **デモ口座 or 公開マスター口座** (個人実口座は非接続)
- 自宅 PC で常時稼働 (Phase 1)、Cloudflare Tunnel 経由で外部公開

#### 7-3. 統合

- `live.fx.tcharton.com` をサブドメインとして DNS 設定 (Cloudflare 配下)
- `/dashboard/` ページ内で `<iframe src="https://live.fx.tcharton.com">` 埋込
- iframe 親で sandbox 制限 / CSP 設定 / 注釈バナー常時表示

### ⑧ デプロイ先

#### 8-1. Static サイト

- **Cloudflare Pages** (確定)
- ルートドメイン `tcharton.com` の HSTS preload / WAF 設定を継承
- GitHub リポジトリ → Cloudflare Pages 自動ビルド (Astro)

#### 8-2. Dashboard サーバ

- **Phase 1: 自宅 PC + Cloudflare Tunnel**
  - コスト ¥0
  - MT5_Python が既稼働中の PC をそのまま活用
  - Tunnel 設定で localhost:8050 を `live.fx.tcharton.com` に紐付け
  - 停電/回線断時は `/dashboard/` に 503 → "メンテナンス中" プレースホルダ表示 (Cloudflare Page Rules)
- **Phase 2: 国内 Windows VPS 移行検討**
  - ConoHa for Windows / Xserver VPS Windows 等 (¥3-5k/月)
  - 24h 安定性確保が必要になった段階で移行

#### 8-3. DNS / 証明書

- すべて Cloudflare 管理
- 証明書: Cloudflare Universal SSL (自動)
- ルート `tcharton.com` の HSTS preload に `fx` / `live` サブドメインが自動包含されることを設定時に確認 (`includeSubDomains` ディレクティブ)

---

## 2. アーキテクチャ概略図

```
                  ┌─────────────────────────────────────────┐
                  │  Cloudflare (DNS + Edge + HSTS preload)  │
                  └────────────┬─────────────────────┬──────┘
                               │                     │
                    fx.tcharton.com         live.fx.tcharton.com
                               │                     │
                  ┌────────────▼───────┐ ┌──────────▼─────────────┐
                  │ Cloudflare Pages   │ │ Cloudflare Tunnel       │
                  │ Astro + Tailwind   │ │ → 自宅 PC               │
                  │ + MD/MDX           │ │   MT5_Python (Dash 8050)│
                  │ ブログ/Docs/LP    │ │   ←→ MT5 (デモ口座)     │
                  └────────────────────┘ └─────────────────────────┘
                               ▲
                               │ iframe 埋込
                  ┌────────────┴──────────────┐
                  │ /dashboard/ ページ        │
                  │ (live サブドメインを iframe)│
                  └───────────────────────────┘

                  ┌──────────────────────────────────────┐
                  │  GitHub (tcharton-fx repo)            │
                  │  push → Cloudflare Pages 自動ビルド   │
                  └──────────────────────────────────────┘
```

---

## 3. リスクと対策

| # | リスク | 影響度 | 対策 |
|---|---|---|---|
| R1 | 「客観データ表示」と「シグナル」の境界が運用中にぶれる | 高 | (a) `/dashboard/` 注釈バナー常時表示、(b) `/blog/case-study` は事後解説のみ、(c) 公開前 grep 検証 mandatory (CLAUDE.md §4)、(d) 不安なら弁護士確認 |
| R2 | 自宅 PC 運用の停電・回線断・PC 再起動 | 中 | (a) Cloudflare 503 → "メンテナンス中" プレースホルダ、(b) Dashboard を「24h 稼働保証なし」と明記、(c) Phase 2 で VPS 移行 |
| R3 | 執筆時間が他 4 セッション (②③④⑥) を圧迫 | 中 | (a) Phase 1 は週 1 記事を超えない、(b) 代理執筆禁止 (HSCEL §3.3 事実確認 mandatory)、(c) ⑦ 単独で週次報告して負荷可視化 |
| R4 | 公開マスター口座の P&L 露出が個人特定 | 中 | (a) デモ口座をデフォルト、(b) 公開口座にする場合も口座番号・氏名・残高絶対値は非表示、(c) 損益はパーセント表示のみ検討 |
| R5 | 海外 FX 業者アフィ (Phase 2) の景表法/金商法リスク | 高 (Phase 2) | (a) Phase 2 着手時に弁護士相談、(b) 「ツール紹介型」(VPS/書籍/取引プラットフォーム機能比較) に限定、(c) 「無登録海外業者の積極推奨」は回避 |

---

## 4. Phase 1 設計に持ち越す項目

本書スコープ外。Phase 1 設計 (writing-plans) で詰める:

- [ ] Astro 内部のディレクトリ構造 (`src/pages/`, `src/content/`, `src/layouts/`, `src/components/`)
- [ ] ブログのフロントマター仕様 (`title`, `description`, `category`, `tags`, `publishedAt`, `disclaimer`)
- [ ] Dashboard iframe の CSP / sandbox 詳細設定
- [ ] Cloudflare Tunnel の認証/ACL (公開 OK な口座データのみ)
- [ ] Pagefind (or 代替) の組込み方法 / インデックス対象
- [ ] OGP / favicon / ロゴ素材
- [ ] アクセス解析 (Cloudflare Web Analytics or なし)
- [ ] お問い合わせフォームの実装 (Cloudflare Workers + メール送信 or mailto: )
- [ ] β 公開後の読者測定指標 (PV / セッション / Dashboard 滞在時間)
- [ ] Phase 2 移行判定の数値基準 (例: 月間 PV X 以上)

---

## 5. 越境チェックリスト (HSCEL §0.0.7)

⑦ セッションが触れて良い領域:

- ✅ `HARTON/tcharton-fx/` 配下の全ファイル
- ✅ `fx.tcharton.com` の Cloudflare 設定 (代表承認後)
- ✅ サブドメイン `live.fx.tcharton.com` の DNS 設定 (代表承認後)
- ✅ 新規 GitHub リポジトリ `tcharton-fx` の作成 (代表承認後)

⑦ セッションが触れない領域:

- ❌ `MT5_Python` 本体 (改変禁止、参照のみ)
- ❌ `tcharton` (② 沼津 WEB 制作のリポジトリ)
- ❌ `scanner/` `certification/` `note-content/` `wp-mastery/`
- ❌ 3 法規 (SPEC / GOOGLE / GEO) — ⑦ は同期対象外
- ❌ ルート `tcharton.com` 既存ページ (② tcharton セッション領域)

---

## 6. 報告

本書 ① 承認後、`REPORT-TO-ROOT-FROM-TCHARTON-FX.md` を新規作成し、Phase 0 完了報告を記載。

---

## 7. 次工程

1. **本書を ① HARTON 総合責任者 (大内達也) がレビュー** ← 現在ここ
2. 承認 → Phase 1 実装計画を `superpowers:writing-plans` で起草
3. Phase 1 計画 ① 承認 → Week 1 着手 (Astro セットアップ)

---

**End of Phase 0 構想 v1.0**
