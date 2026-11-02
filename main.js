(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const $ = id => document.getElementById(id);
  const bar = $('bar'), cur = $('cur'), dotsBox = $('dots'), prev = $('prev'), next = $('next'), toast = $('toast');
  let i = 0;

  $('total').textContent = slides.length;

  // Thứ tự xuất hiện của các phần tử trong mỗi slide
  slides.forEach(s => s.querySelectorAll('[data-anim]').forEach((el, n) => el.style.setProperty('--d', n)));
  document.querySelectorAll('.journey li').forEach((li, n) => li.style.setProperty('--d', n));

  // Chấm điều hướng
  const dots = slides.map((s, n) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Slide ${n + 1}: ${s.getAttribute('aria-label') || ''}`);
    b.addEventListener('click', () => go(n));
    dotsBox.appendChild(b);
    return b;
  });

  function go(n, updateHash = true) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => {
      s.classList.toggle('active', k === i);
      s.classList.toggle('past', k < i);
      s.toggleAttribute('inert', k !== i);
      if (k === i) s.scrollTop = 0;
    });
    dots.forEach((d, k) => d.setAttribute('aria-selected', k === i));
    cur.textContent = i + 1;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    if (updateHash) history.replaceState(null, '', '#' + (i + 1));
  }

  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' '].includes(k)) { e.preventDefault(); go(i + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(k)) { e.preventDefault(); go(i - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k.toLowerCase() === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    }
  });

  // Vuốt trên điện thoại
  let x0 = null, y0 = null;
  document.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i + (dx < 0 ? 1 : -1));
    x0 = y0 = null;
  }, { passive: true });

  window.addEventListener('hashchange', () => go((parseInt(location.hash.slice(1), 10) || 1) - 1, false));

  // Khung ảnh: chưa có file thì hiện gợi ý đường dẫn cần thêm
  document.querySelectorAll('.slot').forEach(slot => {
    const img = slot.querySelector('img');
    slot.dataset.path = img.getAttribute('src');
    const mark = () => slot.classList.add('is-empty');
    img.addEventListener('error', mark);
    if (img.complete && img.naturalWidth === 0) mark();
  });

  // Bấm ô màu để sao chép mã
  document.querySelectorAll('.sw').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.hex); } catch {}
    toast.textContent = 'Đã sao chép ' + b.dataset.hex;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }));

  go((parseInt(location.hash.slice(1), 10) || 1) - 1, false);
})();
