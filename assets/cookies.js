/* PVL.ONE — cookie consent.
   Analytics cookies are OFF until the visitor explicitly accepts. Nothing is
   loaded before consent; the choice is kept in this browser only. */
(function () {
  'use strict';

  var KEY = 'pvl.cookie.consent';
  var banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: session only */ }
  }

  function enableAnalytics() {
    /* Placeholder: the Google Analytics snippet is injected here only after
       consent. Nothing is loaded in this prototype. */
    window.pvlAnalyticsConsent = true;
  }

  var choice = read();
  if (choice === 'accepted') {
    enableAnalytics();
  } else if (choice !== 'declined') {
    banner.classList.add('is-visible');
    banner.removeAttribute('hidden');
  }

  banner.addEventListener('click', function (e) {
    var accept = e.target.closest('[data-cookie-accept]');
    var decline = e.target.closest('[data-cookie-decline]');
    if (!accept && !decline) return;
    write(accept ? 'accepted' : 'declined');
    if (accept) enableAnalytics();
    banner.classList.remove('is-visible');
    banner.setAttribute('hidden', '');
  });
})();
