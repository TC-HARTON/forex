/* menu.js — モバイルナビ ドロワー開閉 (CSP script-src 'self' 準拠)
 * 参考: tcharton.com /dist/scripts/menu.js のパターン
 * - ハンバーガー (#menuToggle) でドロワー (#mobileMenu) を開閉
 * - Esc / 背景クリック / リンククリック / 閉じるボタンで閉じる
 * - aria-expanded / inert / body スクロールロックを管理
 */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    var closeBtn = document.getElementById('menuClose');
    var backdrop = document.getElementById('menuBackdrop');
    if (!toggle || !menu) return;

    function open() {
      menu.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
      var first = menu.querySelector('a, button');
      if (first) first.focus();
    }
    function close() {
      menu.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('inert', '');
      document.body.style.overflow = '';
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) close();
      else open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) close();
    });
    // 初期状態は閉
    menu.setAttribute('inert', '');
  });
})();
