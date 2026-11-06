/* PVL.ONE — "Institutions using PVL" logo wall.
   Built from the member list in assets/network-data.js, so the wall and the
   network directory can never drift apart. Needs network-data.js before it.

   A logo appears only if the member list carries one. Members whose details are
   still to be confirmed are skipped, and a logo that fails to load removes
   itself rather than leaving a gap. */
(function () {
  'use strict';

  var wall = document.querySelector('[data-logo-wall]');
  var D = window.PVL_NETWORK;
  if (!wall || !D || !D.members) return;

  var limit = parseInt(wall.getAttribute('data-limit'), 10) || 0;

  var members = D.members.filter(function (m) { return !m.pending && m.logo; });
  var shown = limit > 0 ? members.slice(0, limit) : members;

  shown.forEach(function (m) {
    var img = document.createElement('img');
    img.src = m.logo;
    img.alt = m.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = function () { img.remove(); };
    wall.appendChild(img);
  });

  var note = wall.parentNode.querySelector('[data-logo-wall-count]');
  if (note) {
    note.textContent = members.length + (limit > 0 && members.length > limit
      ? ' institutions run PVL.ONE today.'
      : ' institutions run PVL.ONE today.');
  }
})();
