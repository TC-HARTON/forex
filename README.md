# tcharton-fx — FX 専門サイト (fx.tcharton.com)

> tcharton.com サブドメイン `fx.tcharton.com` で公開する **FX 専門サイト** の構築ディレクトリ。
> 現在 **Phase 0 (構想具体化フェーズ)** — 新セッションで内容を決定する箱だけ作成済。

---

## このディレクトリは何か

| 項目 | 内容 |
|---|---|
| **ドメイン** | `fx.tcharton.com` (tcharton.com サブドメイン) |
| **位置付け** | 裁量 FX トレーダー向け 専門サイト |
| **作品本体** | `C:\Users\ohuch\Desktop\MT5_Python\` (Python + Dash + MQL5 EA ローカル統合ダッシュボード) |
| **運用責任者** | ⑦ FX 専門サイト構築責任者 (新セッション) |
| **③〜⑥との関係** | 完全独立 / 3 法規同期対象外 |
| **HSCEL** | 適用 (§3.1 4 Skill / §3.3 事実確認 mandatory) |

---

## 現在のステータス: Phase 0 構想スケルトンのみ

```
tcharton-fx/
├── CLAUDE.md           ← ⑦ セッション ローカル運用ガイド
├── README.md           ← 本書
├── docs/               ← 構想ドキュメント保管 (空)
└── drafts/             ← サイト本文 草案保管 (空)
```

実装ファイル (HTML / CSS / JS) は **未着手**。

---

## Phase 0 で決定すべき項目 (詳細は `CLAUDE.md §2`)

| # | 決定事項 | ステータス |
|---|---|---|
| 1 | サイト目的 (OSS 紹介 / 教育 / 商用 / 組合せ) | 🔘 未決 |
| 2 | ターゲット読者 (中上級トレーダー / 開発者 / 初心者) | 🔘 未決 |
| 3 | 収益モデル (Sponsors / 有料版 / 教材 / 広告) | 🔘 未決 |
| 4 | 法的要件 (金商法登録の有無 / 投資助言業) | 🔘 未決 ★最重要 |
| 5 | コンテンツ構造 (サイト階層) | 🔘 未決 |
| 6 | 公開タイムライン | 🔘 未決 |
| 7 | 技術スタック (静的 / Next / WordPress / Dash) | 🔘 未決 |
| 8 | デプロイ先 (Cloudflare Pages 推奨) | 🔘 未決 |

---

## 新セッション着手者へ

1. まず `CLAUDE.md` を Read (本ディレクトリ運用ルール)
2. 次に `HARTON/CLAUDE.md` を Read (① ルート全体運用)
3. `C:\Users\ohuch\Desktop\MT5_Python\README.md` + `SPEC.md` を Read (作品本体理解)
4. Phase 0 §2 の 8 項目について代表に確認 (一括 or 段階的)
5. 決定事項を `docs/PHASE-0-CONCEPT.md` に記録
6. Phase 1 (設計) へ移行

### Phase 0 で **やってはいけないこと**

- ❌ サイトの HTML を勝手に生成しない (構想未確定のため無意味)
- ❌ MT5_Python 本体を改変しない
- ❌ ② tcharton.com 既存資産 (沼津 165 社実測 等) を流用しない (テーマ別)
- ❌ ドメイン取得 / DNS 設定を勝手に実行しない (代表の承認後)
- ❌ Cloudflare / GitHub 連携を勝手に設定しない (代表の承認後)

---

## 関連リンク (新セッション向け)

| リンク | 内容 |
|---|---|
| `HARTON/CLAUDE.md` | ① ルート全体運用 (6 セッション + ⑦ 新設) |
| `HARTON/ENFORCEMENT-LAW-V1.md` | HSCEL v1 強制法規 |
| `HARTON/tcharton/CLAUDE.md` | ② tcharton.com (参考: 同型のローカル運用ガイド) |
| `C:\Users\ohuch\Desktop\MT5_Python\README.md` | 作品本体 README |
| `C:\Users\ohuch\Desktop\MT5_Python\SPEC.md` | 作品本体 SPEC (改変禁止) |
| `C:\Users\ohuch\Desktop\MT5_Python\docs\ARCHITECTURE.md` | 作品本体 アーキテクチャ |

---

**Phase**: 0 (構想スケルトン)
**Created**: 2026-05-18
**Owner**: ⑦ FX 専門サイト構築責任者 (新セッション)

---

## 実装ステータス (Phase 1 Week 1-2 完了)

### 技術スタック (Phase 1)

- Astro 6.x (SSG, TypeScript strict)
- Tailwind CSS 4.x (via `@tailwindcss/vite`)
- Node 22+ LTS (`engines.node >= 22.0.0`、実運用 Node 24 LTS)
- デプロイ: Cloudflare Pages + GitHub 連携 (リポジトリ: `TC-HARTON/forex`)

### 起動方法

```bash
# 依存インストール
npm install

# dev サーバ起動 (http://localhost:4321)
npm run dev

# 本番ビルド
npm run build

# 全検証 (build + 法的 grep + テスト) ← Cloudflare Pages ビルドコマンドと同等
npm run verify

# 個別
npm run check:legal   # dist/ を法的禁止用語 grep (景表法 + 金商法)
npm test              # build assertion テスト (Node 組込みランナー)
```

### 完了タスク

- [x] Astro 6 + Tailwind 4 セットアップ
- [x] BaseLayout / Header / Footer / SEO / DisclaimerBanner コンポーネント
- [x] ホーム placeholder ページ (Hero + 3 カード)
- [x] 法的禁止用語 grep スクリプト (景表法 12 + 金商法 6 = 18 patterns)
- [ ] Cloudflare Pages 連携 + `fx.tcharton.com` 公開 (Task 11-12 / 代表手動操作)

### 次工程 (Phase 1 Week 3-4)

- `/docs/` 配下 5 ページ (install / quickstart / dashboard-guide / architecture / spec)
- `/about/` `/services/` `/legal/*` `/contact/` ページ本実装
