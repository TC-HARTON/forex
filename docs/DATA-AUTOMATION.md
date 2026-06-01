# データ自動更新フロー

> 本サイト (fx.tcharton.com) はリアル情報が価値の中核。全データソースの鮮度を確保するため、以下の自動化を運用する。
> Last updated: 2026-05-25

---

## 自動化マトリクス

| データ | ソース | 自動化レベル | 更新頻度 | 実行環境 |
|---|---|---|---|---|
| **経済指標カレンダー** | Forex Factory 公開 XML | ✅ 完全自動 (GitHub Actions) | 毎日 03:00 JST | GitHub Actions runner |
| **GitHub Repo Stats** | GitHub REST API | ✅ 完全自動 (GitHub Actions) | 毎日 03:00 JST | GitHub Actions runner |
| **通貨強弱 (G7+XAU)** | MT5_Python analyzer | ⚠ 半自動 (代表ローカル必須) | 週次 (推奨: 日曜夜) | 代表 PC (MT5 + Python 稼働環境) |
| **London-NY overlap カウントダウン** | クライアント JS 計算 | ✅ 完全自動 (毎秒) | 1 秒 | ブラウザ |

---

## 1. 経済指標カレンダー (完全自動)

### 仕組み

```
GitHub Actions cron (daily 18:00 UTC = 03:00 JST)
  ↓
node scripts/fetch-economic-calendar.mjs
  ↓
fetch https://nfs.faireconomy.media/ff_calendar_thisweek.xml
  ↓
parse + 主要通貨 (G7+AUD+NZD+CNY) フィルタ + ET→JST 変換
  ↓
src/data/economic-calendar.json 上書き
  ↓
差分あれば git commit + push
  ↓
Cloudflare Pages 自動再ビルド (push hook)
  ↓
fx.tcharton.com 反映
```

### ローカル手動実行

```bash
npm run fetch:calendar
# または
node scripts/fetch-economic-calendar.mjs
```

### 障害時の挙動

- fetch 失敗 (DNS/HTTP error 等) → exit 1 / 既存 JSON は維持 (stale を空にしない)
- workflow 失敗通知は GitHub Actions の Notifications で確認

---

## 2. GitHub Repo Stats (完全自動)

同 workflow (`.github/workflows/daily-data-refresh.yml`) 内で実行。Stars / Forks / Issues / pushed_at を取得。

### ローカル手動実行

```bash
npm run fetch:github
# または
GH_TOKEN=ghp_xxxx node scripts/fetch-github-repo.mjs
```

---

## 3. 通貨強弱 (半自動 / 代表ローカル必須)

### なぜ半自動か

MT5 (MetaTrader 5) は Windows 専用 GUI アプリで、GitHub Actions runner (Linux) 上では動作しない。
通貨強弱データは MT5 から MetaQuotes 公式 Python ライブラリ経由で取得するため、**代表のローカル PC (MT5 稼働中) でしか生成できない**。

### 推奨運用 (週次)

```
1. 代表 PC で MT5_Python 起動中の状態で:
   python C:\Users\ohuch\Desktop\MT5_Python\scripts\export_currency_strength_for_fx_site.py
   → fx.tcharton.com 用 JSON を吐き出す

2. 出力された JSON を tcharton-fx/src/data/currency-strength.json に上書き

3. git commit -m "data(currency-strength): YYYY-MM-DD weekly snapshot" && git push
   → Cloudflare Pages 自動再ビルド
```

### TODO (Phase 1.7)

- [ ] **MT5_Python 側**: `scripts/export_currency_strength_for_fx_site.py` を新設 (analyzer/currency_strength.py の H4 値 → tcharton-fx JSON フォーマット出力)
- [ ] **代表 PC**: Windows タスクスケジューラで毎週日曜 23:00 自動実行
- [ ] **半自動 → 完全自動 (Phase 2)**: MT5_Python に常駐 HTTPS endpoint を立てて GitHub Actions から fetch (要 Cloudflare Tunnel / Tailscale 等で外部公開)

### Phase 1 暫定運用

代表手動 + UI に「最終取得日時」を明示表示 (古ければ古いほど見たユーザーに判断材料を渡す)。

---

## 4. London-NY overlap カウントダウン (完全自動)

`public/session-countdown.js` がブラウザで毎秒 JST 時刻を計算 → UI 表示。
データソース不要 (ローカル時計のみ)。CSP `'self'` 準拠。

---

## 鮮度の UI 表示

各データブロックには「最終取得日時 / 出典 URL」を明示する。これにより:

- ユーザーがデータの鮮度を判断できる
- 自動化失敗時 (stale データ表示中) もユーザーに伝わる
- HSCEL §3.3 (事実確認 mandatory) の出典明記要件を満たす

---

## 監視 / アラート (Phase 1.6 TODO)

- [ ] GitHub Actions 失敗時の Email / Discord 通知
- [ ] `_fetched_at` が 48h 以上古い場合の UI 警告バナー
- [ ] Sentry / 同等の error tracking
