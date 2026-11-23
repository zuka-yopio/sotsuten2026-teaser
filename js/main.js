(function () {
  'use strict';

  /* ---------------------------------------------
     メインビジュアル：画像読み込み後に front → middle → back の順でフェードイン
  --------------------------------------------- */
  const fvImages = document.querySelectorAll('.fv__layer img');
  let loadedCount = 0;
  let started = false;

  const startFv = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  };

  const onImgReady = () => {
    loadedCount++;
    if (loadedCount >= fvImages.length) startFv();
  };

  fvImages.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      onImgReady();
    } else {
      img.addEventListener('load', onImgReady, { once: true });
      img.addEventListener('error', onImgReady, { once: true });
    }
  });
  // 読み込みが極端に遅い場合の保険
  setTimeout(startFv, 4000);

  /* ---------------------------------------------
     写真の自動スクロール：リストを複製してシームレスにループ
  --------------------------------------------- */
  const track = document.getElementById('scrollTrack');
  if (track) {
    Array.from(track.children).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ---------------------------------------------
     グロナビ：FV通過後（開催概要の手前）から追従
  --------------------------------------------- */
  const header = document.getElementById('header');
  const fv = document.getElementById('fv');

  /* ---------------------------------------------
     SP：ハンバーガーメニュー
  --------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const spMenu = document.getElementById('spMenu');

  const setMenu = (open) => {
    header.classList.toggle('is-menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    spMenu.setAttribute('aria-hidden', String(!open));
  };
  const closeMenu = () => setMenu(false);

  hamburger.addEventListener('click', () => {
    setMenu(!header.classList.contains('is-menu-open'));
  });
  spMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) closeMenu();
  });
  let isFixed = false;
  let ticking = false;

  const getThreshold = () => {
    // FVを通過したタイミング（＝開催概要が見え始めるあたり）で追従を開始
    return fv.offsetTop + fv.offsetHeight;
  };

  const updateHeader = () => {
    const shouldFix = window.scrollY > getThreshold();
    if (shouldFix !== isFixed) {
      isFixed = shouldFix;
      header.classList.toggle('is-fixed', isFixed);
      // SPの追従ボタン（卒展公式X／TOPへ戻る）の表示切替
      document.body.classList.toggle('is-scrolled', isFixed);
      if (!isFixed) closeMenu();
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateHeader();
})();
