# ⑦ tcharton-fx セッション ローカル運用ガイド (CLAUDE.md)

> 親ガイド: `HARTON/CLAUDE.md` (① ルート / 6 セッション運用 + ⑦ FX 専門サイト)
> 本書: ⑦ FX 専門サイト構築セッション 固有ルール
> Last updated: 2026-05-18 / Phase 0 (構想具体化フェーズ)

---

## 0. セッション位置づけ

- **役割名称**: FX 専門サイト構築責任者
- **作業ディレクトリ**: `HARTON/tcharton-fx/`
- **担当ドメイン**: `fx.tcharton.com` (tcharton.com サブドメイン)
- **対象**: 裁量 FX トレーダー向け 専門サイト (MT5_Python ダッシュボード解説 + 分析手法 + 経済指標活用 等)
- **報告義務**: ① HARTON 総合責任者 へ `REPORT-TO-ROOT-FROM-TCHARTON-FX.md` 追記
- **現在のフェーズ**: **Phase 0 構想具体化** (実装着手前)

---

## 1. 重要なスコープ分離

### ② tcharton.com (沼津 WEB 制作) との関係

- ❌ 3 法規 (SPEC / GOOGLE / GEO) は **同期対象外** (テーマ別 / 法的要件別)
- ❌ scanner / 沼津 165 社実測データは **共有しない**
- ❌ spec-checker.js (沼津サイト用) は **流用しない** (FX 用は別途設計)
- ✅ Cloudflare + HSTS preload 設定は ルートドメイン (tcharton.com) を **継承** (新規申請不要)
- ✅ ブランド表記 (T.C.HARTON / 代表 大内達也) / 連絡先は **共通**

### ⑥ wp-mastery / ④ scanner / ③ note-content との関係

- 完全独立。相互参照なし。

### MT5_Python (作品本体) との関係

- **作品本体**: `C:\Users\ohuch\Desktop\MT5_Python\` (Phyton + Dash + MQL5 EA)
- **本サイト**: MT5_Python の OSS 解説 / 使い方 / 分析手法 / 24h 稼働ノウハウ等を発信
- 作品本体には触らない (`HARTON/tcharton-fx/` 内のみ編集権限)

---

## 2. Phase 0 構想具体化で決めるべき項目 (新セッション宿題)

### 2.1 サイト目的 (要決定)

- [ ] OSS プロジェクト紹介 + ドキュメントサイト
- [ ] 裁量トレーダー向け 教育コンテンツ
- [ ] 商用ダッシュボード版 販売
- [ ] 上記の組み合わせ

### 2.2 ターゲット読者 (要決定)

- [ ] 裁量 FX トレーダー (中〜上級)
- [ ] MT5 + Python 開発者
- [ ] FX 初心者
- [ ] 投資情報を求める一般層

### 2.3 収益モデル (要決定)

- [ ] OSS + GitHub Sponsors / Open Collective
- [ ] 有料ダッシュボード版 (商用ライセンス)
- [ ] 教材販売 (note 連携)
- [ ] アフィリエイト (FX 業者 / VPS / 書籍)
- [ ] 広告 (Google AdSense / 専門広告)
- [ ] 収益化しない (HARTON ブランド強化目的)

### 2.4 法的要件 (要決定 / 最重要)

- [ ] 金商法上の「投資助言業」**登録なし** で運用 (= 売買推奨表現禁止 / ツール紹介と教育のみ)
- [ ] 金商法登録 を行う (本格的な売買シグナル / 推奨を提供する場合)
- [ ] 景表法 / 特商法 準拠表記 (No.1 / 必勝 / 絶対 等の禁止表現)
- [ ] 開示義務 (損失リスク警告 / 過去実績は将来を保証しない 等)

### 2.5 コンテンツ構造 (要決定)

- [ ] サイト階層 (例: /, /dashboard/, /docs/, /tutorial/, /blog/, /about/)
- [ ] MT5_Python ドキュメントの統合方針 (本体 docs/ をそのまま転載 vs サイト用に書き直し)
- [ ] ブログ更新頻度 / カテゴリ

### 2.6 公開タイムライン (要決定)

- [ ] β 公開: いつ / どの範囲で
- [ ] 正式公開: いつ
- [ ] 第一バージョンの機能スコープ

### 2.7 技術スタック (要決定)

- [ ] 静的サイト (HTML + Tailwind CSS / ② tcharton と同構成)
- [ ] Next.js / Nuxt 等 動的
- [ ] WordPress (⑥ wp-mastery 練習台兼用)
- [ ] Dash サイト (MT5_Python ダッシュボード を fx.tcharton.com で公開する場合)

### 2.8 デプロイ先 (要決定)

- [ ] Cloudflare Pages (推奨: tcharton.com と同基盤)
- [ ] GitHub Pages
- [ ] Vercel
- [ ] 自前 VPS (Dash サイトの場合)

---

## 3. HSCEL (HARTON Strict Code Enforcement Law) 適用

- §3.1 4 Skill mandatory (feature-dev / requesting-code-review / receiving-code-review / gstack) 適用
- §3.3 事実確認 mandatory (数値 / 引用 / 法令 / 統計は出典必須)
- §0.0.7 越境禁止 (他セッションのファイルを編集しない)
- §0.0.3 Failure-Self-Report (失敗・未達は ① へ即時申告)

---

## 4. ブランド禁止用語 (FX サイト特化版)

公開前 grep 検証 mandatory:

```bash
# 景表法 / 金商法 リスクワード
grep -rE "(必勝|絶対|確実|保証|稼げる|誰でも|簡単に|楽に|不労所得|未来予測|的中率 100|勝率 100)" tcharton-fx/ --include="*.html"

# 投資助言業 リスクワード (登録なしでは禁止)
grep -rE "(買いシグナル|売りシグナル|今買え|今売れ|推奨銘柄|おすすめ通貨ペア)" tcharton-fx/ --include="*.html"
```

ヒット 0 件 mandatory。

---

## 5. 次セッション着手時の Read 順序

1. **`HARTON/ENFORCEMENT-LAW-V1.md`** — HSCEL v1 強制法規
2. **`HARTON/CLAUDE.md`** — ① 全体ルート運用ガイド
3. **`tcharton-fx/CLAUDE.md`** — 本書
4. **`tcharton-fx/README.md`** — プロジェクト概要 + 構想ステータス
5. **`C:\Users\ohuch\Desktop\MT5_Python\README.md`** + **`SPEC.md`** — 作品本体の理解

---

## 6. 完遂報告フォーマット

`REPORT-TO-ROOT-FROM-TCHARTON-FX.md` に追記:

```
## Phase X タスク名 完了報告 (YYYY-MM-DD)

### Phase ステータス
- 現在 Phase: 0 構想 / 1 設計 / 2 実装 / 3 公開
- 決定事項:
- 未決事項:

### 実装内容
- [変更ファイルパス + 概要]

### git commit hash
- [hash]

### 法的検証 (該当時)
- 景表法 grep: PASS / FAIL
- 金商法 grep: PASS / FAIL
- 開示義務記載: PASS / FAIL

### HSCEL §3.1 4 Skill 適用記録
- /feature-dev / /requesting-code-review (reviewer 2+) / /receiving / /gstack
```

---

## 7. 参照ファイル一覧

| ファイル | 用途 |
|---|---|
| `tcharton-fx/CLAUDE.md` | 本書 / ⑦ 固有ルール |
| `tcharton-fx/README.md` | プロジェクト概要 + Phase 0 ステータス |
| `tcharton-fx/docs/` | 構想ドキュメント保管 (新セッションで生成) |
| `tcharton-fx/drafts/` | 草案保管 |
| `tcharton-fx/REPORT-TO-ROOT-FROM-TCHARTON-FX.md` | ⑦ → ① 報告書 (新セッション開始時に生成) |
| `C:\Users\ohuch\Desktop\MT5_Python\README.md` | 作品本体 README |
| `C:\Users\ohuch\Desktop\MT5_Python\SPEC.md` | 作品本体 SPEC (改変禁止) |
| `HARTON/ENFORCEMENT-LAW-V1.md` | HSCEL v1 強制法規 |
| `HARTON/CLAUDE.md` | ① ルート全体運用ガイド |

---

**Version**: 0.1 (Phase 0 構想スケルトン)
**Adopted**: 2026-05-18
**Next milestone**: 新セッションで Phase 0 構想を具体化 → §2 全項目決定 → Phase 1 設計へ移行
