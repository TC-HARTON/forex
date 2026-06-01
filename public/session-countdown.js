/**
 * session-countdown.js — London-NY overlap カウントダウン (週末・市場休場対応)
 *
 * CSP 'self' 準拠 (外部 JS / no inline)
 *
 * London-NY overlap = 21:00〜翌 01:00 JST、ただし「平日のみ」。
 *  - 月〜金 21:00 開始 → 翌 01:00 終了 (金は土 01:00 まで)
 *  - 土 01:00 〜 月 21:00 は FX 市場休場 (overlap なし)
 *
 * 表示:
 *  - overlap 進行中: 「London-NY overlap 進行中 / 残り HH:MM:SS」
 *  - 平日休場中:     「次の London-NY overlap (21:00 JST) まで HH:MM:SS」
 *  - 週末休場中:     「FX 市場休場 (週末) / 月曜 overlap まで DD:HH:MM:SS」
 *
 * タイムゾーン: ブラウザのローカル TZ に依存せず、常に JST (UTC+9) で判定。
 */
(function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  // 現在時刻を JST wall-clock として読める Date を返す (epoch を +9h シフトし getUTC* で読む)
  function jstDate() {
    return new Date(Date.now() + 9 * 3600 * 1000);
  }

  // overlap セッション中か判定 (JST 平日 21:00〜翌 01:00)
  function inSession(d) {
    const day = d.getUTCDay();   // 0=日 .. 6=土 (JST)
    const h = d.getUTCHours();
    // 月〜金 21:00 以降 = その日のセッション開始
    if (day >= 1 && day <= 5 && h >= 21) return true;
    // 火〜土 00:00〜00:59 = 前営業日のセッション継続
    if (day >= 2 && day <= 6 && h < 1) return true;
    return false;
  }

  // セッション終了 (次の 01:00 JST) までの秒
  function secsToSessionEnd(d) {
    const sod = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
    if (d.getUTCHours() >= 21) return 25 * 3600 - sod;  // 翌 01:00
    return 1 * 3600 - sod;                               // 当日 01:00
  }

  // 次の overlap 開始 (次の平日 21:00 JST) までの秒
  function secsToNextStart(d) {
    // d と同じ「+9h シフト = JST を UTC として読む」空間でターゲットを構築
    let target = new Date(Date.UTC(
      d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 21, 0, 0
    ));
    for (let i = 0; i < 8; i++) {
      const day = target.getUTCDay();
      const isWeekday = day >= 1 && day <= 5;
      if (isWeekday && target.getTime() > d.getTime()) break;
      target = new Date(target.getTime() + 24 * 3600 * 1000);
      target.setUTCHours(21, 0, 0, 0);
    }
    return Math.max(0, Math.floor((target.getTime() - d.getTime()) / 1000));
  }

  function fmtHMS(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function fmtDHMS(sec) {
    const d = Math.floor(sec / 86400);
    const r = sec % 86400;
    const h = Math.floor(r / 3600);
    const m = Math.floor((r % 3600) / 60);
    const s = r % 60;
    return d > 0 ? `${d}日 ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function update() {
    const el = document.querySelector('[data-session-countdown]');
    if (!el) return;

    const d = jstDate();
    let label, value, dot;

    if (inSession(d)) {
      label = 'London-NY overlap 進行中 / 残り';
      value = fmtHMS(secsToSessionEnd(d));
      dot = 'live';
    } else {
      const sec = secsToNextStart(d);
      const day = d.getUTCDay();
      const isWeekend = (day === 0) || (day === 6) || (day === 5 && d.getUTCHours() >= 1 && d.getUTCHours() < 21 && sec > 24 * 3600);
      // 週末判定: 残り 24h 超 = 翌営業日以降 (= 市場休場の週末)
      if (sec > 24 * 3600) {
        label = 'FX 市場休場 (週末) / 次の London-NY overlap まで';
        value = fmtDHMS(sec);
        dot = 'closed';
      } else {
        label = '次の London-NY overlap (21:00 JST) まで';
        value = fmtHMS(sec);
        dot = 'wait';
      }
    }

    const labelEl = el.querySelector('[data-session-label]');
    const valueEl = el.querySelector('[data-session-value]');
    const dotEl = el.querySelector('[data-session-dot]');
    if (labelEl) labelEl.textContent = label;
    if (valueEl) valueEl.textContent = value;
    if (dotEl) {
      dotEl.classList.remove('animate-pulse');
      // live のときだけ点滅 (CSP 適合 / class 操作のみ)
      if (dot === 'live') dotEl.classList.add('animate-pulse');
    }
  }

  function init() {
    update();
    setInterval(update, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
