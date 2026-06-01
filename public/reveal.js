/**
 * reveal.js — スクロール連動フェードイン (CSP 'self' 適合 / 外部 JS)
 *
 * class="reveal" の要素が画面に入ると .is-visible を付与し、CSS でフェード + 上スライド表示。
 * data-reveal-delay="N" (ms) で出現を遅らせ、カード群のずらし出現を作る。
 * prefers-reduced-motion: reduce / IntersectionObserver 非対応 / JS 無効 は即時表示。
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll(els) { els.forEach(function (el) { el.classList.add('is-visible'); }); }

  function init() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { revealAll(els); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        if (delay > 0) {
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
        } else {
          el.classList.add('is-visible');
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
