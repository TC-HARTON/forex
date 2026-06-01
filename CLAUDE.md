# ⑦ tcharton-fx セッション ローカル運用ガイド (CLAUDE.md)

> 親ガイド: `HARTON/CLAUDE.md` (① ルート / 6 セッション運用 + ⑦ FX 専門サイト)
> 本書: ⑦ FX 専門サイト構築セッション 固有ルール
> Last updated: 2026-05-25 / Phase 1 (実装フェーズ / コンセプト確定後)

---

## 0. セッション位置づけ

- **役割名称**: FX 専門サイト構築責任者
- **作業ディレクトリ**: `HARTON/tcharton-fx/`
- **担当ドメイン**: `fx.tcharton.com` (tcharton.com サブドメイン)
- **コンセプト**: **「裁量トレーダーのための MT5 ローカル統合ダッシュボード」** (A+B ハイブリッド)
- **作品本体**: `C:\Users\ohuch\Desktop\MT5_Python\` (Python + Dash + MQL5 EA)
- **報告義務**: ① HARTON 総合責任者 へ `REPORT-TO-ROOT-FROM-TCHARTON-FX.md` 追記
- **現在のフェーズ**: **Phase 1 実装** (Week 1-2 一旦完了 → 全面改修着手中)

---

## 1. コンセプト (代表 2026-05-25 承認)

### A+B ハイブリッド

**A. OSS ドキュメントサイト** + **B. 教育コンテンツサイト**

| 軸 | 内容 |
|---|---|
| メインメッセージ | 「Cloud SaaS でも MQL5 自動売買でもない、第三の道」 |
| 主訴求 | 自分のチャート、自分のデータ、自分の判断。サブスクからの解放 |
| 差別化 | 日本語圏ほぼ唯一の「MT5 + Python + 完全裁量」OSS |
| ターゲット | (1) 裁量 FX トレーダー (中〜上級) + (2) MT5 + Python 開発者 |
| 競合不在領域 | TradingView は月額/カスタム不可、MT4 系日本語ブログは古い、metatrader.com は英語 |

### 収益モデル (3 段階)

| Phase | 期間 | モデル | 想定収益 |
|---|---|---|---|
| **Phase 1** | 0-6 ヶ月 | GitHub Sponsors + AdSense + FX 業者アフィリエイト | ¥1-5 万/月 |
| **Phase 2** | 6-18 ヶ月 | 月額メンバーシップ (¥980-2,980) | ¥5-30 万/月 |
| **Phase 3** | 18 ヶ月〜 | 商用ダッシュボード版 + 教材販売 | ¥30-100 万/月 |

---

## 2. 必読書 (起動時 自動 Read 順序)

ファイル Read 順序 (上から優先):

1. **`HARTON/ENFORCEMENT-LAW-V1.md`** — HSCEL v1 強制法規
2. **`tcharton-fx/OPERATIONS-POLICY.md`** — **サイト運営方針 正本 (★ 全判断の基準 mandatory)**
3. **`tcharton-fx/SPEC.md`** — **本サイト固有 SPEC (★ 厳格参照 mandatory)**
4. **`tcharton-fx/CLAUDE.md`** — 本書 (⑦ 固有ルール)
5. **`tcharton-fx/README.md`** — プロジェクト概要 + Phase ステータス
6. **`C:\Users\ohuch\Desktop\MT5_Python\README.md`** — 作品本体 README
7. **`C:\Users\ohuch\Desktop\MT5_Python\SPEC.md`** — 作品本体 SPEC (改変禁止)

---

## 3. SPEC 厳格参照 mandatory (★ 最重要)

### 絶対遵守ルール

**全ての HTML / Astro / CSS / コンポーネント実装時、`tcharton-fx/SPEC.md` を必ず参照する**:

| 場面 | 必須参照箇所 |
|---|---|
| 全実装時 | §0 強制法規 (景表法/金商法 grep 禁止用語) |
| 新規ページ作成 | §1 サイト構造 / §2 SEO / §3 LLMO/AIO/GEO / §4 UI/UX |
| `<head>` 実装 | §2.1 必須要素 全リスト |
| JSON-LD 実装 | §3.1 Schema 必須範囲 + §3.2 Wikidata Q |
| Author 表記 | §5 E-E-A-T |
| 法的文言 | §0.2 投資助言業 非該当宣言 + §6 法的表記 |
| 公開前検証 | §8 検証ゲート (npm verify + Lighthouse + axe-core + securityheaders) |

### SPEC からの逸脱

- SPEC 規定外の実装 = **HSCEL §3.1 違反 / 即不承認**
- SPEC §0 (強制法規) / §6 (法的表記) は **改変禁止**
- §1-5 / §7-8 は ① ルート承認後のみ改訂可

---

## 4. 重要なスコープ分離

### ② tcharton.com (沼津 WEB 制作) との関係

- ❌ HARTON 3 法規 (SPEC / GOOGLE / GEO) は **同期対象外**
  - 理由: テーマ (WEB 制作 vs FX 教育) と法的要件 (景表法 vs 金商法) が異なる
- ❌ scanner / 沼津 165 社実測データは **共有しない**
- ❌ spec-checker.js (沼津サイト用) は **流用しない** → `scripts/check-legal.mjs` 等 FX 用を新規策定
- ✅ Cloudflare + HSTS preload は ルートドメイン (tcharton.com) を **継承** (新規申請不要)
- ✅ ブランド表記 (T.C.HARTON / 代表 大内達也) / 連絡先 (info@tcharton.com) は **共通**

### MT5_Python (作品本体) との関係

- **作品本体**: `C:\Users\ohuch\Desktop\MT5_Python\` (Phyton + Dash + MQL5 EA)
- **本サイト**: MT5_Python の OSS 解説 / 使い方 / 分析手法 / 24h 稼働ノウハウ等を発信
- 作品本体には触らない (`HARTON/tcharton-fx/` 内のみ編集権限)

### ⑥ wp-mastery / ④ scanner / ③ note-content との関係

- 完全独立。相互参照なし。

---

## 5. HSCEL §3.1 4 Skill mandatory

各ページ実装時、以下 4 Skill 適用必須:

1. **`/feature-dev:feature-dev`** — 設計フェーズ
2. **`/requesting-code-review`** — 公開前 / 並列 reviewer 2+
3. **`/receiving-code-review`** — feedback 厳格処理
4. **`/gstack`** — 公開後 ブラウザ実機検証

報告書 `REPORT-TO-ROOT-FROM-TCHARTON-FX.md` に各 Skill 適用証跡 mandatory。

---

## 6. HSCEL §3.3 事実確認 mandatory

コンテンツ内の以下は **出典明記必須**:

- 数値 (例: 「日本 FX 個人口座 1,000 万」 → 金融先物取引業協会 出典)
- 引用 (例: 「ローソク足の生みの親」 → 文献 URL)
- 法令 (例: 「金商法」 → 第 29 条 投資助言業)
- 業界統計 (例: 「FX 市場の取引量」 → BIS / 日銀)

出典なしの数値・断定 = **HSCEL §3.3 違反 / 即不承認**。

---

## 7. 越境禁止 (HSCEL §0.0.7)

- ❌ MT5_Python 本体改変 (参照のみ)
- ❌ ② tcharton/ 内に触らない
- ❌ ③ note-content / drafts に触らない
- ❌ ④ scanner / ⑤ certification / ⑥ wp-mastery に触らない
- ❌ HARTON 3 法規 (SPEC / GOOGLE / GEO) を編集しない
- ❌ HARTON ルート CLAUDE.md を勝手に編集しない (代表 ① 承認後のみ)

---

## 8. 完遂報告フォーマット

`REPORT-TO-ROOT-FROM-TCHARTON-FX.md` に追記:

```
## Phase X.Y タスク名 完了報告 (YYYY-MM-DD)

### Phase ステータス
- 現在 Phase: 0 構想 / 1 実装 / 2 メンバーシップ / 3 商用版
- 決定事項:
- 未決事項:

### 実装内容
- [変更ファイルパス + 概要]

### git commit hash
- [hash]

### SPEC §X 準拠確認
- §0 強制法規: PASS / FAIL
- §2 SEO 必達: PASS / FAIL
- §3 LLMO/AIO/GEO: PASS / FAIL
- §4 UI/UX: PASS / FAIL

### §8 検証ゲート
- [ ] npm run verify (build + check:legal + test)
- [ ] Lighthouse 全カテゴリ 90+
- [ ] WCAG 2.2 AA (axe-core / Pa11y)
- [ ] securityheaders.com A+
- [ ] JSON-LD バリデーション
- [ ] 法的禁止用語 grep 0 件 (景表法 12 + 金商法 6)

### HSCEL §3.1 4 Skill 適用記録
- /feature-dev / /requesting-code-review (reviewer 2+) / /receiving / /gstack
```

---

## 9. 参照ファイル一覧

| ファイル | 用途 |
|---|---|
| `tcharton-fx/SPEC.md` | **FX サイト固有 SPEC (★ 厳格参照 mandatory)** |
| `tcharton-fx/CLAUDE.md` | 本書 / ⑦ 固有ルール |
| `tcharton-fx/README.md` | プロジェクト概要 + Phase ステータス |
| `tcharton-fx/REPORT-TO-ROOT-FROM-TCHARTON-FX.md` | ⑦ → ① 報告書 |
| `tcharton-fx/docs/PHASE-0-CONCEPT.md` | Phase 0 構想記録 |
| `tcharton-fx/docs/PHASE-1-PLAN-WEEK-1-2.md` | Phase 1 Week 1-2 実装計画 |
| `tcharton-fx/src/` | Astro 実装 (components / layouts / pages / styles) |
| `tcharton-fx/scripts/check-legal.mjs` | 法的禁止用語 grep |
| `C:\Users\ohuch\Desktop\MT5_Python\README.md` | 作品本体 README |
| `C:\Users\ohuch\Desktop\MT5_Python\SPEC.md` | 作品本体 SPEC (改変禁止) |
| `HARTON/ENFORCEMENT-LAW-V1.md` | HSCEL v1 強制法規 |
| `HARTON/CLAUDE.md` | ① ルート全体運用ガイド |

---

**Version**: 1.0 (Phase 1 実装フェーズ / コンセプト確定後の改訂)
**Adopted**: 2026-05-25
**Next milestone**: 全面改修完了 → npm verify PASS → preview 確認 → 代表報告
