/* PVL.ONE prototype — small interactions: mobile menu, directory filtering,
   filter chips and reveal-on-scroll. No dependencies. */
(function () {
  'use strict';

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- directory search + category filter ---- */
  var search = document.querySelector('[data-search-input]');
  var category = document.querySelector('[data-search-filter]');
  var items = [].slice.call(document.querySelectorAll('[data-search]'));
  var empty = document.querySelector('[data-empty-state]');
  var counter = document.querySelector('[data-result-count]');

  function applyFilter() {
    var term = (search && search.value || '').trim().toLowerCase();
    var cat = (category && category.value) || 'all';
    var visible = 0;
    items.forEach(function (item) {
      var matchesText = item.getAttribute('data-search').toLowerCase().indexOf(term) !== -1;
      var matchesCat = cat === 'all' || item.getAttribute('data-category') === cat;
      var show = matchesText && matchesCat;
      item.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
    if (counter) counter.textContent = String(visible);
  }
  if (search) search.addEventListener('input', applyFilter);
  if (category) category.addEventListener('change', applyFilter);

  /* ---- removable filter chips ---- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip button');
    if (btn) { btn.closest('.chip').remove(); applyFilter(); }
  });

  /* ---- reveal on scroll ----
     Content must never depend on this to be readable: elements are only faded
     when the observer is available, every reveal is idempotent, and a failsafe
     shows everything after 1.2s whatever happened. */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = [].slice.call(document.querySelectorAll('[data-reveal]'));

  function show(el) { el.style.opacity = '1'; el.style.transform = 'none'; }

  if (!reduced && 'IntersectionObserver' in window && targets.length) {
    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .45s cubic-bezier(.22,.61,.36,1), transform .45s cubic-bezier(.22,.61,.36,1)';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { show(el); }, Math.min(i, 6) * 55);
        io.unobserve(el);
      });
    }, { rootMargin: '120px 0px 0px 0px', threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });

    // failsafe: nothing stays invisible, whatever the browser does
    setTimeout(function () { targets.forEach(show); }, 1200);
    window.addEventListener('pagehide', function () { targets.forEach(show); });
  }

  /* ---- current year ---- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
