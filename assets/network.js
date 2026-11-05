/* PVL.ONE — Network explorer
   Map projection, markers, filters and directory. No dependencies.
   Data lives in assets/network-data.js (window.PVL_NETWORK). */
(function () {
  'use strict';

  var D = window.PVL_NETWORK;
  if (!D) return;

  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, word) {
    if (n === 1) return n + ' ' + word;
    return n + ' ' + ({ city: 'cities', country: 'countries' }[word] || word + 's');
  }
  function uniq(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }

  var members = D.members;
  var regionOf = function (m) { return (D.countries[m.country] || {}).region || 'Other'; };
  var codeOf = function (c) { return (D.countries[c] || {}).code || c.slice(0, 2).toUpperCase(); };
  var catColour = function (t) { return D.categoryColors[t] || '#164194'; };
  var locationsOf = function (m) { return m.locations || [m.city]; };
  var confirmedOnly = function (list) { return list.filter(function (m) { return !m.pending; }); };
  var citiesOf = function (list) {
    return uniq(list.reduce(function (acc, m) { return acc.concat(locationsOf(m)); }, []));
  };
  /* an institution can hold several types; the card shows the first */
  var typesOf = function (m) { return m.types && m.types.length ? m.types : [m.type]; };

  /* ---------- Natural Earth projection (matches the embedded map paths) ---------- */
  var S = 170, CX = 500, CY = 240;
  function project(lat, lng) {
    var l = lng * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
    var x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    var y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
    return [CX + S * x, CY - S * y];
  }
  function validCoord(c) {
    return Array.isArray(c) && c.length === 2 && c.every(Number.isFinite) &&
      Math.abs(c[0]) <= 90 && Math.abs(c[1]) <= 180;
  }
  function countryPoint(name) {
    var a = (D.countries[name] || {}).anchor;
    return validCoord(a) ? project(a[0], a[1]) : null;
  }

  /* ---------- state ---------- */
  var state = { region: 'All', country: 'All', city: null, type: 'All', query: '' };
  var regionNames = Object.keys(D.regions);
  var typeNames = Object.keys(D.categoryColors);

  /* ---------- hero counters ---------- */
  var totals = {
    institutions: members.length,
    countries: uniq(members.map(function (m) { return m.country; })).length,
    cities: citiesOf(members).length,
    regions: uniq(members.map(regionOf)).length
  };
  [].forEach.call(document.querySelectorAll('[data-nx-total]'), function (el) {
    var target = totals[el.getAttribute('data-nx-total')];
    if (target === undefined) return;
    if (reduced.matches) { el.textContent = target; return; }
    var t0 = performance.now();
    (function tick(now) {
      var k = Math.min(1, (now - t0) / 1100);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  });

  /* ---------- map chrome ---------- */
  var svg = $('nx-map'), stage = $('nx-stage'), overlay = $('nx-overlay'), leaders = $('nx-leaders');
  if (!svg || !stage) return;

  (function graticule() {
    var d = '', lat, lng, xy;
    for (lng = -180; lng <= 180; lng += 15) {
      d += 'M';
      for (lat = -60; lat <= 80; lat += 5) { xy = project(lat, lng); d += (lat === -60 ? '' : 'L') + xy[0].toFixed(1) + ',' + xy[1].toFixed(1); }
    }
    for (lat = -60; lat <= 75; lat += 15) {
      d += 'M';
      for (lng = -180; lng <= 180; lng += 5) { xy = project(lat, lng); d += (lng === -180 ? '' : 'L') + xy[0].toFixed(1) + ',' + xy[1].toFixed(1); }
    }
    $('nx-grat').innerHTML = '<path d="' + d + '"/>';
  })();

  var countryPaths = {};
  [].forEach.call(document.querySelectorAll('#nx-land path'), function (p) {
    var name = p.getAttribute('data-map-country');
    if (D.countries[name]) { p.classList.add('is-member'); p.dataset.country = name; countryPaths[name] = p; }
  });
  $('nx-land').addEventListener('click', function (e) {
    var p = e.target.closest('path.is-member');
    if (p) selectCountry(p.dataset.country);
  });

  (function arcs() {
    var pts = uniq(members.map(function (m) { return m.country; })).map(countryPoint).filter(Boolean);
    var html = '';
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var a = pts[i], b = pts[j];
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var dx = b[0] - a[0], dy = b[1] - a[1], k = 0.22;
        html += '<path d="M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) +
          ' Q' + (mx + dy * k).toFixed(1) + ',' + (my - dx * k).toFixed(1) +
          ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1) + '"/>';
      }
    }
    $('nx-arcs').innerHTML = html;
  })();

  /* ---------- viewport ---------- */
  var viewBox = [0, 0, 1000, 430], currentBounds = D.allBounds, raf = 0;

  function boundsToViewBox(b) {
    var west = b[0], south = b[1], east = b[2], north = b[3];
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (var i = 0; i <= 10; i++) {
      var lats = [south, north, south + (north - south) * i / 10];
      var lngs = [west, east, west + (east - west) * i / 10];
      for (var a = 0; a < lats.length; a++) for (var c = 0; c < lngs.length; c++) {
        var xy = project(lats[a], lngs[c]);
        x0 = Math.min(x0, xy[0]); x1 = Math.max(x1, xy[0]);
        y0 = Math.min(y0, xy[1]); y1 = Math.max(y1, xy[1]);
      }
    }
    var bw = x1 - x0, bh = y1 - y0;
    var padX = bw * 0.06, padY = bh * 0.08;
    x0 -= padX; y0 -= padY; bw += padX * 2; bh += padY * 2;
    var W = stage.clientWidth || 1000, H = stage.clientHeight || 600, ratio = W / H;
    if (bw / bh > ratio) { var nh = bw / ratio; y0 -= (nh - bh) / 2; bh = nh; }
    else { var nw = bh * ratio; x0 -= (nw - bw) / 2; bw = nw; }
    return [x0, y0, bw, bh];
  }

  function applyViewBox() { svg.setAttribute('viewBox', viewBox.join(' ')); placeMarkers(); }

  function setView(bounds, instant) {
    currentBounds = bounds;
    var to = boundsToViewBox(bounds);
    cancelAnimationFrame(raf);
    if (instant || reduced.matches) { viewBox = to; applyViewBox(); return; }
    var from = viewBox.slice(), t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / 800);
      k = 1 - Math.pow(1 - k, 4);
      viewBox = from.map(function (v, i) { return v + (to[i] - v) * k; });
      applyViewBox();
      if (k < 1) raf = requestAnimationFrame(step);
    })(t0);
  }
  new ResizeObserver(function () { setView(currentBounds, true); }).observe(stage);

  function countryBounds(name) {
    var c = D.countries[name];
    if (c && c.bounds) return c.bounds;
    var pts = citiesOf(members.filter(function (m) { return m.country === name; }))
      .map(function (city) { return D.cities[city]; }).filter(validCoord);
    if (!pts.length) return D.allBounds;
    var lats = pts.map(function (p) { return p[0]; }), lngs = pts.map(function (p) { return p[1]; });
    var cx = (Math.min.apply(null, lngs) + Math.max.apply(null, lngs)) / 2;
    var cy = (Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2;
    var w = Math.max(10, Math.max.apply(null, lngs) - Math.min.apply(null, lngs) + 4);
    var h = Math.max(7, Math.max.apply(null, lats) - Math.min.apply(null, lats) + 3);
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  }

  /* ---------- markers ---------- */
  var markers = [], markerEls = new Map();

  function buildMarkers(base) {
    var data = [];
    if (state.country === 'All') {
      uniq(base.map(function (m) { return m.country; })).forEach(function (c) {
        var list = base.filter(function (m) { return m.country === c; });
        data.push({
          key: 'country:' + c, label: c, count: list.length, xy: countryPoint(c),
          country: c, pressed: false,
          aria: c + ': ' + plural(list.length, 'institution') + '. Zoom in to ' + c
        });
      });
    } else {
      var list = base.filter(function (m) { return m.country === state.country; });
      citiesOf(list).forEach(function (city) {
        if (!validCoord(D.cities[city])) return;
        var here = list.filter(function (m) { return locationsOf(m).indexOf(city) !== -1; });
        data.push({
          key: 'city:' + city, label: city, count: here.length,
          xy: project(D.cities[city][0], D.cities[city][1]),
          country: state.country, city: city, pressed: state.city === city,
          aria: city + ': ' + plural(here.length, 'institution') + '. ' +
            (state.city === city ? 'Selected, press to show all of ' + state.country : 'Show institutions in ' + city)
        });
      });
    }
    markers = data.filter(function (d) { return d.xy; });

    var keep = {};
    markers.forEach(function (m) { keep[m.key] = true; });
    markerEls.forEach(function (el, key) { if (!keep[key]) { el.remove(); markerEls.delete(key); } });

    markers.forEach(function (m) {
      var el = markerEls.get(m.key);
      if (!el) {
        el = document.createElement('button');
        el.className = 'nx-marker';
        el.type = 'button';
        el.innerHTML = '<span class="nx-marker-dot"></span><span class="nx-marker-label" aria-hidden="true"></span>';
        el.addEventListener('click', function () {
          var d = el._data;
          if (d.city) selectCity(d.city === state.city ? null : d.city);
          else selectCountry(d.country);
        });
        el.addEventListener('mouseenter', function () { highlight(el._data, true); });
        el.addEventListener('mouseleave', function () { highlight(el._data, false); });
        overlay.appendChild(el);
        markerEls.set(m.key, el);
      }
      el._data = m;
      el.querySelector('.nx-marker-dot').textContent = m.count;
      el.querySelector('.nx-marker-label').textContent = m.label;
      el.setAttribute('aria-label', m.aria);
      el.setAttribute('aria-pressed', String(!!m.pressed));
    });
    placeMarkers();
  }

  /* labels are laid out around the fixed geographic dots so they never cover each other */
  function placeMarkers() {
    var W = stage.clientWidth, H = stage.clientHeight;
    if (!W || !H) return;
    var scale = Math.min(W / viewBox[2], H / viewBox[3]);
    var offX = (W - viewBox[2] * scale) / 2, offY = (H - viewBox[3] * scale) / 2;
    var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
    var pad = 8, placed = [], lines = '';

    var points = markers.map(function (m) {
      return { m: m, x: offX + (m.xy[0] - viewBox[0]) * scale, y: offY + (m.xy[1] - viewBox[1]) * scale };
    }).sort(function (a, b) { return a.y - b.y || a.x - b.x; });

    leaders.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    points.forEach(function (p) {
      var el = markerEls.get(p.m.key);
      if (!el) return;
      var inView = p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H;
      el.hidden = !inView;
      if (!inView) return;

      var rect = el.getBoundingClientRect();
      var width = Math.min(W - 2 * pad, rect.width || 190), height = rect.height || 34;
      var best = null;

      [false, true].forEach(function (left) {
        var minX = left ? pad + width - 17 : pad + 17;
        var maxX = left ? W - pad - 17 : W - pad - width + 17;
        var xs = [p.x + (left ? -14 : 14), minX, maxX];
        var ys = [clamp(p.y, pad + height / 2, H - pad - height / 2)];
        for (var y = pad + height / 2; y <= H - pad - height / 2; y += height + 8) ys.push(y);
        xs.forEach(function (rawX) {
          ys.forEach(function (y) {
            var x = clamp(rawX, minX, maxX);
            var box = { x: left ? x - width + 17 : x - 17, y: y - height / 2, w: width, h: height };
            var overlap = 0;
            placed.forEach(function (b) {
              overlap += Math.max(0, Math.min(box.x + box.w + 6, b.x + b.w + 6) - Math.max(box.x, b.x)) *
                         Math.max(0, Math.min(box.y + box.h + 6, b.y + b.h + 6) - Math.max(box.y, b.y));
            });
            var score = overlap * 10000 + Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2);
            if (!best || score < best.score) best = { x: x, y: y, left: left, box: box, score: score };
          });
        });
      });

      placed.push(best.box);
      el.style.left = best.x + 'px';
      el.style.top = best.y + 'px';
      el.classList.toggle('is-left', best.left);

      lines += '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + best.x + '" y2="' + best.y + '"/>';
      lines += '<circle data-nx-key="' + esc(p.m.key) + '" cx="' + p.x + '" cy="' + p.y + '" r="4.5">' +
               '<title>' + esc(p.m.label) + '</title></circle>';
    });

    leaders.innerHTML = lines;
  }

  function highlight(d, on) {
    var sel = d.city ? '[data-city="' + CSS.escape(d.city) + '"]' : '[data-country="' + CSS.escape(d.country) + '"]';
    [].forEach.call(document.querySelectorAll('#nx-locs button' + sel), function (b) {
      b.classList.toggle('is-highlighted', on);
    });
  }

  /* ---------- filtering ---------- */
  function matchesQuery(m) {
    if (!state.query) return true;
    var hay = [m.name, m.short, m.country, m.type].concat(locationsOf(m)).join(' ').toLocaleLowerCase();
    return hay.indexOf(state.query) !== -1;
  }
  function inRegion(m) { return state.region === 'All' || regionOf(m) === state.region; }
  function inType(m) { return state.type === 'All' || typesOf(m).indexOf(state.type) !== -1; }
  function baseList() { return members.filter(function (m) { return inRegion(m) && inType(m) && matchesQuery(m); }); }
  function visibleList(base) {
    return base.filter(function (m) {
      return (state.country === 'All' || m.country === state.country) &&
             (!state.city || locationsOf(m).indexOf(state.city) !== -1);
    });
  }

  function selectRegion(r) { state.region = r; state.country = 'All'; state.city = null; render(true); }
  function selectCountry(c) {
    state.country = c; state.city = null;
    if (state.region !== 'All' && regionOf({ country: c }) !== state.region) state.region = 'All';
    render(true);
  }
  function selectCity(city) { state.city = city; render(false); }
  function selectType(t) { state.type = t; render(true); }
  function resetAll() {
    state.region = 'All'; state.country = 'All'; state.city = null; state.type = 'All'; state.query = '';
    $('nx-search').value = '';
    render(true);
  }
  function resetView() { state.region = 'All'; state.country = 'All'; state.city = null; render(true); }

  /* ---------- deep links: the current view can be shared ---------- */
  function writeHash() {
    var parts = [];
    if (state.region !== 'All') parts.push('region=' + encodeURIComponent(state.region));
    if (state.country !== 'All') parts.push('country=' + encodeURIComponent(state.country));
    if (state.city) parts.push('city=' + encodeURIComponent(state.city));
    if (state.type !== 'All') parts.push('type=' + encodeURIComponent(state.type));
    if (state.query) parts.push('q=' + encodeURIComponent(state.query));
    var ours = /(^|&|#)(region|country|city|type|q)=/.test(location.hash);
    if (!parts.length && !ours) return;   /* leave a plain anchor such as #network alone */
    history.replaceState(null, '', location.pathname + location.search +
      (parts.length ? '#' + parts.join('&') : ''));
  }
  function readHash() {
    var hash = location.hash.replace(/^#/, '');
    if (!hash) return;
    hash.split('&').forEach(function (pair) {
      var bits = pair.split('='), key = bits[0], value = decodeURIComponent(bits[1] || '');
      if (key === 'region' && D.regions[value]) state.region = value;
      if (key === 'country' && D.countries[value]) state.country = value;
      if (key === 'city' && D.cities[value]) state.city = value;
      if (key === 'type' && D.categoryColors[value]) state.type = value;
      if (key === 'q' && value) { state.query = value.toLocaleLowerCase(); $('nx-search').value = value; }
    });
  }

  /* ---------- render ---------- */
  var regionButtons = ['All'].concat(regionNames).map(function (r) {
    var b = document.createElement('button');
    b.type = 'button';
    b.dataset.region = r;
    b.addEventListener('click', function () { selectRegion(r); });
    $('nx-regions').appendChild(b);
    return b;
  });

  typeNames.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nx-chip';
    b.dataset.type = t;
    b.style.setProperty('--cat', catColour(t));
    b.addEventListener('click', function () { selectType(state.type === t ? 'All' : t); });
    $('nx-types').appendChild(b);
  });

  function render(moveView) {
    var base = baseList(), list = visibleList(base);

    /* region segmented control */
    regionButtons.forEach(function (b) {
      var r = b.dataset.region;
      var total = members.filter(function (m) {
        return inType(m) && matchesQuery(m) && (r === 'All' || regionOf(m) === r);
      }).length;
      b.innerHTML = (r === 'All' ? 'All regions' : esc(r)) + '<small>' + total + '</small>';
      b.setAttribute('aria-pressed', String(state.region === r));
      b.setAttribute('aria-label', (r === 'All' ? 'All regions' : r) + ', ' + plural(total, 'institution'));
    });

    /* type chips */
    [].forEach.call($('nx-types').children, function (b) {
      var t = b.dataset.type;
      var total = members.filter(function (m) {
        return inRegion(m) && matchesQuery(m) && typesOf(m).indexOf(t) !== -1;
      }).length;
      b.innerHTML = '<span class="nx-chip-dot"></span>' + esc(t) + '<small>' + total + '</small>';
      b.setAttribute('aria-pressed', String(state.type === t));
      b.disabled = total === 0 && state.type !== t;
      b.style.opacity = b.disabled ? '.45' : '';
    });

    /* map */
    stage.classList.toggle('is-zoomed', state.country !== 'All');
    buildMarkers(base);
    Object.keys(countryPaths).forEach(function (c) {
      var p = countryPaths[c];
      var inView = state.region === 'All' || D.countries[c].region === state.region;
      var hasAny = base.some(function (m) { return m.country === c; });
      p.classList.toggle('is-member', inView && hasAny);
      p.classList.toggle('is-active', state.country === c);
      p.classList.toggle('is-dim', state.country !== 'All' && state.country !== c);
    });
    $('nx-arcs').classList.toggle('is-off', state.country !== 'All' || base.length === 0);
    if (moveView) {
      setView(state.country !== 'All' ? countryBounds(state.country)
        : state.region !== 'All' ? D.regions[state.region].bounds
        : D.allBounds);
    }
    $('nx-zoom-out').hidden = state.region === 'All' && state.country === 'All';
    $('nx-stage-note').hidden = !markers.length;
    $('nx-stage-note').textContent = state.city
      ? 'Showing ' + state.city + '. Press the marker again, or Escape, to see all of ' + state.country + '.'
      : state.country !== 'All'
        ? 'Select a city to filter the directory below.'
        : 'Select a country to zoom in, then a city to filter the directory.';

    var regionEmpty = state.region !== 'All' && !members.some(function (m) { return regionOf(m) === state.region; });
    $('nx-stage-empty').hidden = list.length > 0;
    $('nx-stage-empty-title').textContent = regionEmpty ? state.region + ': no institutions yet' : 'No matching institutions';
    $('nx-stage-empty-text').textContent = regionEmpty
      ? 'There are no institutions listed in ' + state.region + ' yet.'
      : 'Try another search, or clear the filters.';

    /* breadcrumbs */
    var crumbs = [['All regions', resetView]];
    if (state.region !== 'All') crumbs.push([state.region, function () { selectRegion(state.region); }]);
    if (state.country !== 'All') crumbs.push([state.country, function () { selectCountry(state.country); }]);
    if (state.city) crumbs.push([state.city, null]);
    var crumbEl = $('nx-crumbs');
    crumbEl.innerHTML = '';
    crumbs.forEach(function (c, i) {
      if (i) {
        var sep = document.createElement('i');
        sep.textContent = '›';
        sep.setAttribute('aria-hidden', 'true');
        crumbEl.appendChild(sep);
      }
      var last = i === crumbs.length - 1;
      var el = document.createElement(last ? 'span' : 'button');
      el.textContent = c[0];
      if (last) el.setAttribute('aria-current', 'location');
      else { el.type = 'button'; el.addEventListener('click', c[1]); }
      crumbEl.appendChild(el);
    });

    /* spotlight */
    var countriesIn = uniq(list.map(function (m) { return m.country; }));
    $('nx-spot-title').textContent = state.city ||
      (state.country !== 'All' ? state.country : state.region !== 'All' ? state.region : 'Across borders');
    $('nx-spot-desc').textContent = regionEmpty
      ? 'No institutions are listed in ' + state.region + ' yet.'
      : state.city ? state.city + ', ' + state.country
      : state.country !== 'All' ? (citiesOf(list).join(' · ') || 'No institutions match the current filters.')
      : list.length ? countriesIn.join(', ') + ', connected through practical learning.'
      : 'No institutions match the current filters.';
    $('nx-fig-inst').textContent = confirmedOnly(list).length;
    $('nx-fig-city').textContent = citiesOf(list).length;
    $('nx-fig-ctry').textContent = countriesIn.length;

    var locBase = state.country === 'All' ? base : base.filter(function (m) { return m.country === state.country; });
    var locKeys = state.country === 'All'
      ? uniq(locBase.map(function (m) { return m.country; }))
      : citiesOf(locBase);
    $('nx-locs-title').textContent = state.country === 'All' ? 'Countries in view' : 'Cities in ' + state.country;
    $('nx-locs').innerHTML = locKeys.length ? locKeys.map(function (k) {
      var n = locBase.filter(function (m) {
        return state.country === 'All' ? m.country === k : locationsOf(m).indexOf(k) !== -1;
      }).length;
      var attrs = state.country === 'All'
        ? 'data-country="' + esc(k) + '"'
        : 'data-city="' + esc(k) + '" aria-pressed="' + (state.city === k) + '"';
      var code = state.country === 'All' ? '<span class="nx-code" aria-hidden="true">' + esc(codeOf(k)) + '</span>' : '';
      return '<li><button type="button" ' + attrs + ' aria-label="' + esc(k) + ', ' + plural(n, 'institution') + '">' +
        '<span>' + code + esc(k) + '</span><b aria-hidden="true">' + n + '</b></button></li>';
    }).join('') : '<li class="nx-locs-empty">' +
      (regionEmpty ? 'Locations appear here once institutions are listed.' : 'No locations match.') + '</li>';

    /* country chips */
    var countryList = uniq(members.filter(inRegion).map(function (m) { return m.country; }));
    $('nx-countries').innerHTML = ['All'].concat(countryList).map(function (c) {
      var n = c === 'All' ? base.length : base.filter(function (m) { return m.country === c; }).length;
      return '<button type="button" class="nx-chip" data-country="' + esc(c) + '" aria-pressed="' +
        (state.country === c) + '">' + (c === 'All' ? 'All countries' : esc(c)) + '<small>' + n + '</small></button>';
    }).join('');

    var cityChip = $('nx-city-chip');
    cityChip.hidden = !state.city;
    if (state.city) {
      cityChip.innerHTML = esc(state.city) + ' <span aria-hidden="true">✕</span>';
      cityChip.setAttribute('aria-label', 'Remove city filter: ' + state.city);
    }
    $('nx-clear').hidden = state.region === 'All' && state.country === 'All' && !state.city &&
      state.type === 'All' && !state.query;

    /* results line */
    var scope = state.city ? ' in ' + state.city
      : state.country !== 'All' ? ' in ' + state.country
      : state.region !== 'All' ? ' in ' + state.region
      : ' in the network';
    var pendingInView = list.length - confirmedOnly(list).length;
    $('nx-results').innerHTML = 'Showing <strong>' + plural(confirmedOnly(list).length, 'institution') + '</strong>' + esc(scope) +
      (pendingInView ? ' &middot; ' + pendingInView + ' to be confirmed' : '') +
      (state.type !== 'All' ? ' · ' + esc(state.type) : '') +
      (state.query ? ' · matching “' + esc(state.query) + '”' : '') +
      ' · ' + plural(citiesOf(list).length, 'city') + ' · ' + plural(countriesIn.length, 'country');

    /* cards */
    $('nx-cards').innerHTML = list.map(function (m, i) {
      var type = typesOf(m)[0];
      var short = (m.short || m.name).replace(/[^A-Za-zÀ-ÿ ]/g, '').trim();
      var initials = (short.indexOf(' ') === -1 && short.length <= 3 ? short
        : short.split(/\s+/).map(function (w) { return w.charAt(0); }).join('')).slice(0, 3).toUpperCase();
      return '<li class="nx-card' + (m.pending ? ' is-pending' : '') + '" style="--cat:' + catColour(type) + '" data-city="' + esc(m.city) +
        '" data-country="' + esc(m.country) + '">' +
        '<span class="nx-logo">' +
          (m.logo ? '<img src="' + esc(m.logo) + '" alt="" loading="lazy" decoding="async" ' +
            'onerror="this.closest(\'.nx-logo\').innerHTML=\'<span class=&quot;nx-logo-fallback&quot;>' + esc(initials) + '</span>\'">'
            : '<span class="nx-logo-fallback">' + esc(initials) + '</span>') +
        '</span>' +
        '<h3>' + esc(m.name) + '</h3>' +
        '<p class="nx-where">' + esc(m.city) + ', ' + esc(m.country) + '</p>' +
        '<div class="nx-card-foot">' +
          '<span class="nx-cat">' + esc(m.type) + '</span>' +
          (m.pending ? '<p class="nx-pending-note">Listed because the country is part of the network. ' +
            'The institution, city and programme are still to be confirmed.</p>' : '') +
          '<div class="nx-actions">' +
            (m.url
              ? '<a href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer">Visit website <span aria-hidden="true">↗</span>' +
                '<span class="sr-only"> of ' + esc(m.name) + ' (opens in a new tab)</span></a>'
              : '<span class="nx-member-note">Network member</span>') +
            '<button type="button" data-locate="' + i + '">Show on map<span class="sr-only">: ' + esc(m.name) + '</span></button>' +
          '</div>' +
        '</div></li>';
    }).join('');
    $('nx-cards')._list = list;
    $('nx-cards').hidden = !list.length;

    $('nx-empty').hidden = !!list.length;
    $('nx-empty-title').textContent = regionEmpty ? 'No institutions in ' + state.region + ' yet' : 'No institutions in this view';
    $('nx-empty-text').textContent = regionEmpty
      ? 'There are no institutions listed in ' + state.region + ' yet. Interested in bringing PVL.ONE to your classroom? Talk to the team.'
      : 'Nothing matches the current filters' + (state.query ? ' for “' + state.query + '”' : '') + '. Try another search, or view the whole network.';

    writeHash();
  }

  /* ---------- events ---------- */
  leaders.addEventListener('click', function (e) {
    var dot = e.target.closest('[data-nx-key]');
    if (!dot) return;
    var m = markers.filter(function (x) { return x.key === dot.getAttribute('data-nx-key'); })[0];
    if (!m) return;
    if (m.city) selectCity(m.city === state.city ? null : m.city);
    else selectCountry(m.country);
  });

  $('nx-zoom-out').addEventListener('click', resetView);

  $('nx-locs').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.city) selectCity(state.city === b.dataset.city ? null : b.dataset.city);
    else selectCountry(b.dataset.country);
  });
  $('nx-locs').addEventListener('mouseover', function (e) {
    var b = e.target.closest('button');
    markerEls.forEach(function (el) {
      var d = el._data;
      el.classList.toggle('is-highlighted', !!b && (d.city ? d.city === b.dataset.city : d.country === b.dataset.country));
    });
  });
  $('nx-locs').addEventListener('mouseleave', function () {
    markerEls.forEach(function (el) { el.classList.remove('is-highlighted'); });
  });

  $('nx-countries').addEventListener('click', function (e) {
    var b = e.target.closest('[data-country]');
    if (!b) return;
    if (b.dataset.country === 'All') { state.country = 'All'; state.city = null; render(true); }
    else selectCountry(b.dataset.country);
  });
  $('nx-city-chip').addEventListener('click', function () { selectCity(null); });
  $('nx-clear').addEventListener('click', resetAll);
  $('nx-empty-reset').addEventListener('click', resetAll);

  var queryTimer;
  $('nx-search').addEventListener('input', function (e) {
    clearTimeout(queryTimer);
    var value = e.target.value;
    queryTimer = setTimeout(function () {
      state.query = value.trim().toLocaleLowerCase();
      state.city = null;
      render(false);
    }, 120);
  });

  $('nx-cards').addEventListener('click', function (e) {
    var b = e.target.closest('[data-locate]');
    if (!b) return;
    var m = $('nx-cards')._list[+b.dataset.locate];
    state.country = m.country;
    state.city = locationsOf(m)[0];
    render(true);
    var anchor = $('network') || $('explore') || stage;
    var top = anchor.getBoundingClientRect().top + scrollY - 92;
    scrollTo({ top: top, behavior: reduced.matches ? 'auto' : 'smooth' });
    setTimeout(function () {
      var el = markerEls.get('city:' + locationsOf(m)[0]);
      if (el) el.focus({ preventScroll: true });
    }, reduced.matches ? 0 : 520);
  });

  function cardHover(on) {
    return function (e) {
      var card = e.target.closest('.nx-card');
      markerEls.forEach(function (el) {
        var d = el._data;
        var match = card && (d.city
          ? d.city === card.dataset.city && d.country === card.dataset.country
          : d.country === card.dataset.country);
        el.classList.toggle('is-highlighted', !!(on && match));
      });
    };
  }
  $('nx-cards').addEventListener('mouseover', cardHover(true));
  $('nx-cards').addEventListener('mouseleave', cardHover(false));

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (stage.contains(document.activeElement) || (document.activeElement.closest && document.activeElement.closest('.nx-spot'))) {
      if (state.city) selectCity(null);
      else if (state.country !== 'All' || state.region !== 'All') resetView();
      $('nx-spot-title').focus();
    }
  });

  readHash();
  render(false);
  setView(state.country !== 'All' ? countryBounds(state.country)
    : state.region !== 'All' ? D.regions[state.region].bounds
    : D.allBounds, true);
})();
