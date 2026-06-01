# tcharton.com 入れ替え手順 (FX サイトを本番化 / 方法B)

> 方針確定 (代表 2026-06-01): FX を本番に / 現サイト完全廃止 / 方式 = **方法B (ドメイン付け替え)**

## 現状 (確認済みの事実)

| 項目 | 現サイト (WEB制作) | FX サイト (本番化対象) |
|---|---|---|
| GitHub repo | `TC-HARTON/tcharton` | `TC-HARTON/forex` |
| 種別 | 静的 (ルート直 index.html) | Astro (`npm run build` → `dist/`) |
| Cloudflare Pages | tcharton → **tcharton.com** | forex → **fx.tcharton.com** (稼働中) |

**方法B が最安全な理由**: forex プロジェクトは既に Astro を正しくビルドして fx.tcharton.com を配信中。
Cloudflare のビルド設定を一切いじらず、**カスタムドメインを移すだけ**で済む(設定ミスの余地が最小)。

---

## フェーズ 0 — ローカル変更 (✅ 完了済み)

- [x] `fx.tcharton.com` → `tcharton.com` 全置換 (src/scripts/public/config/.github = **76 箇所 / 30 ファイル**, dist 残存 0)
- [x] `astro.config.mjs` の `site: 'https://tcharton.com'`
- [x] `public/robots.txt` Sitemap を tcharton.com に
- [x] `public/_headers` (HSTS preload + セキュリティヘッダ + キャッシュ)
      ※ CSP は BaseLayout の meta タグ側に既存。_headers 側に CSP を入れると二重定義で競合するため入れていない。
- [x] `public/_redirects` (`/index.html → /` 301)
- [x] `npm run verify` green (31ページ / 21 pass / 法令 grep 0 / fx 残存 0)

---

## フェーズ 1 — forex repo にコミット & push (代表 GO 後)

```bash
cd C:/Users/ohuch/Desktop/HARTON/tcharton-fx
npm run verify          # 最終確認
git add -A
git commit -m "feat: tcharton.com 本番化 (ドメイン fx→ルート / _headers / contact+thanks / rss / 全ページ装飾)"
git push origin main    # → forex の Cloudflare Pages が自動リビルド
```

この時点ではまだ fx.tcharton.com で配信 (ドメイン未付替)。canonical は tcharton.com を指すが数分の過渡状態で実害なし。

---

## フェーズ 2 — Cloudflare ドメイン付け替え (代表手動 / ダッシュボード)

> ⚠ Cloudflare 操作は代表権限。AI は代行しない (README ルール)。

1. **Pages → `tcharton` プロジェクト → Custom domains** で `tcharton.com` (+ `www`) を **Remove**
2. **Pages → `forex` プロジェクト → Custom domains** で `tcharton.com` を **Add** (DNS は自動)
   - `www.tcharton.com` も追加し apex へリダイレクト (任意)
3. `fx.tcharton.com` は forex に残し、ルートへ **301 リダイレクト推奨** (旧URLの被リンク保全)

> HSTS preload は apex (tcharton.com) で既存登録済み。`_headers` の `includeSubDomains; preload` を継承するため新規申請不要。

---

## フェーズ 3 — 公開検証 (付替後 数分〜)

```bash
curl -sI https://tcharton.com/ | grep -iE "HTTP/|strict-transport|x-frame"
curl -s  https://tcharton.com/ | grep -c "ゴールドの相場を"            # FX トップ
curl -s  https://tcharton.com/sitemap.xml | grep -c "tcharton.com"
curl -sI https://tcharton.com/rss.xml     | grep -i "content-type"
curl -sI https://tcharton.com/contact/    | grep -i "HTTP/"
```

- [ ] tcharton.com が FX サイトを表示
- [ ] HTTPS / HSTS ヘッダあり / sitemap・robots・rss が tcharton.com
- [ ] 旧 fx.tcharton.com → ルート 301 (設定時)
- [ ] Google Search Console に tcharton.com で sitemap 再送信

---

## フェーズ 4 — 旧サイト廃止 + リポジトリ名整理 (新サイト安定後)

**現サイト廃止**:
- Cloudflare `tcharton` プロジェクト: ドメイン外した後 切断保管 or 削除
- GitHub `TC-HARTON/tcharton` repo: **Archive** (読み取り専用 / 履歴保全)

**「repo 名が違う」問題の解決 (リネーム手順)**:
1. 旧 `TC-HARTON/tcharton` を先に `tcharton-legacy` 等へリネーム (or Archive)
2. `TC-HARTON/forex` → `TC-HARTON/tcharton` へリネーム
3. ローカル remote 更新:
   ```bash
   cd C:/Users/ohuch/Desktop/HARTON/tcharton-fx
   git remote set-url origin https://github.com/TC-HARTON/tcharton.git
   ```
- **重要**: GitHub の repo リネームは旧URLを自動リダイレクトし、**Cloudflare Pages は repo を内部IDで追跡するためリネーム後も連携は切れない**。push も継続できる。

---

## ロールバック

問題発生時は Cloudflare で `tcharton.com` を **forex から外し tcharton プロジェクトに戻す**だけで即時復旧。
→ **フェーズ4 (旧サイト廃止) は新サイトが数日安定してから**実施すること。
