/* PVL.ONE — Container Stacker
   A small doodle-style game: the crane swings a container left and right,
   you drop it, and whatever hangs over the edge is cut off. Pure canvas,
   no dependencies, keyboard and pointer, respects prefers-reduced-motion. */
(function () {
  'use strict';

  var canvas = document.getElementById('stacker');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = 680, H = 520;              // logical size
  var GROUND = H - 46;               // quay level
  var BLOCK_H = 30;                  // container height
  var COLORS = ['#164194', '#009FE3', '#F9B233', '#E84E1B', '#0B2D63', '#007EB6'];

  var scoreEl = document.querySelector('[data-score]');
  var bestEl = document.querySelector('[data-best]');
  var stateEl = document.querySelector('[data-state]');
  var startBtn = document.querySelector('[data-start]');

  var state, stack, current, falling, score, best, speed, running, raf, shake, spawnAt;

  function readBest() {
    try { return parseInt(localStorage.getItem('pvl.stacker.best') || '0', 10) || 0; }
    catch (e) { return 0; }
  }
  function writeBest(v) {
    try { localStorage.setItem('pvl.stacker.best', String(v)); } catch (e) { /* private mode */ }
  }

  best = readBest();

  function reset() {
    stack = [{ x: W / 2 - 110, w: 220, color: COLORS[0] }];
    score = 0;
    speed = 2.4;
    falling = [];
    shake = 0;
    spawn();
    // the crane swings from the start, so the first drop is a real drop
    state = 'playing';
    running = true;
    render();
    update();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function spawn() {
    var top = stack[stack.length - 1];
    var fromLeft = Math.random() < 0.5;
    current = {
      x: fromLeft ? 10 : W - 10 - top.w,   // always inside the quay, never off-screen
      w: top.w,
      dir: fromLeft ? 1 : -1,
      color: COLORS[(stack.length) % COLORS.length]
    };
    spawnAt = now();
  }

  function now() {
    return (window.performance && performance.now()) || Date.now();
  }

  function update() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (bestEl) bestEl.textContent = String(best);
    if (stateEl) {
      stateEl.textContent =
        state === 'playing' ? (score === 0 ? 'Press Space or tap to drop' : 'Stacked ' + score + (score === 1 ? ' container' : ' containers') + '. Keep going.') :
        'Overboard! Press Space to try again';
    }
    if (startBtn) startBtn.textContent = state === 'over' ? 'Play again' : 'Drop';
  }

  function drop() {
    if (state === 'over') { reset(); return; }
    if (now() - spawnAt < 280) return;   // the crane needs a moment to reposition

    var top = stack[stack.length - 1];
    var left = Math.max(current.x, top.x);
    var right = Math.min(current.x + current.w, top.x + top.w);
    var overlap = right - left;

    if (overlap <= 4) {            // missed the stack entirely
      falling.push({ x: current.x, y: blockY(stack.length), w: current.w, color: current.color, vy: 0, vx: current.dir * 1.2, rot: 0 });
      state = 'over';
      running = false;
      if (score > best) { best = score; writeBest(best); }
      update();
      return;
    }

    var perfect = Math.abs(current.x - top.x) < 5;
    if (perfect) {
      // snap and keep the full width as a reward
      current.x = top.x;
      overlap = top.w;
      shake = 6;
    } else {
      // the overhang falls into the water
      if (current.x < left) {
        falling.push({ x: current.x, y: blockY(stack.length), w: left - current.x, color: current.color, vy: 0, vx: -1.4, rot: 0 });
      }
      if (current.x + current.w > right) {
        falling.push({ x: right, y: blockY(stack.length), w: current.x + current.w - right, color: current.color, vy: 0, vx: 1.4, rot: 0 });
      }
    }

    stack.push({ x: left, w: overlap, color: current.color, perfect: perfect });
    score += perfect ? 2 : 1;
    speed = Math.min(6.5, speed + 0.12);
    spawn();
    update();
  }

  function blockY(index) {          // y of the block at stack position index
    return GROUND - (index + 1) * BLOCK_H;
  }

  function cameraOffset() {
    var h = stack.length * BLOCK_H;
    var visible = GROUND - 150;
    return h > visible ? h - visible : 0;
  }

  function step() {
    if (state === 'playing') {
      current.x += current.dir * speed;
      if (current.x + current.w > W - 10) { current.x = W - 10 - current.w; current.dir = -1; }
      if (current.x < 10) { current.x = 10; current.dir = 1; }
    }
    for (var i = falling.length - 1; i >= 0; i--) {
      var f = falling[i];
      f.vy += 0.55;
      f.y += f.vy;
      f.x += f.vx;
      f.rot += f.vx * 0.02;
      if (f.y > H + 80) falling.splice(i, 1);
    }
    if (shake > 0) shake -= 0.6;
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawContainer(x, y, w, color, glow) {
    if (w < 2) return;
    ctx.save();
    if (glow) { ctx.shadowColor = 'rgba(249,178,51,.75)'; ctx.shadowBlur = 18; }
    ctx.fillStyle = color;
    roundRect(x, y, w, BLOCK_H - 3, 5);
    ctx.fill();
    ctx.restore();
    // corrugation lines
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 1;
    for (var lx = x + 8; lx < x + w - 6; lx += 11) {
      ctx.beginPath();
      ctx.moveTo(lx, y + 5);
      ctx.lineTo(lx, y + BLOCK_H - 9);
      ctx.stroke();
    }
    // top highlight
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.fillRect(x + 3, y + 3, Math.max(0, w - 6), 2);
  }

  function render() {
    var off = cameraOffset();
    var sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(sx, 0);

    // sky
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#071E45');
    sky.addColorStop(0.55, '#0B2D63');
    sky.addColorStop(1, '#164194');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // glow
    var glow = ctx.createRadialGradient(W * 0.72, H * 0.3, 10, W * 0.72, H * 0.3, 320);
    glow.addColorStop(0, 'rgba(0,159,227,.35)');
    glow.addColorStop(1, 'rgba(0,159,227,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // water
    ctx.fillStyle = '#061937';
    ctx.fillRect(0, GROUND + 14, W, H - GROUND - 14);
    ctx.strokeStyle = 'rgba(127,212,245,.22)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (var i = 0; i < 5; i++) {
      var wy = GROUND + 30 + i * 14;
      ctx.beginPath();
      ctx.moveTo(40 + i * 90, wy);
      ctx.lineTo(120 + i * 90, wy);
      ctx.stroke();
    }

    // quay
    ctx.fillStyle = '#0A2757';
    ctx.fillRect(0, GROUND, W, 16);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(0, GROUND, W, 2);

    // crane rail and hook
    if (state !== 'over' && current) {
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 42); ctx.lineTo(W, 42); ctx.stroke();
      var cx = current.x + current.w / 2;
      var cy = blockY(stack.length) + off;
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, 42); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = '#F9B233';
      roundRect(cx - 16, 34, 32, 16, 4); ctx.fill();
    }

    // stack
    for (var s = 0; s < stack.length; s++) {
      var b = stack[s];
      drawContainer(b.x, blockY(s) + off, b.w, b.color, b.perfect && s === stack.length - 1);
    }

    // current swinging container
    if (state !== 'over' && current) {
      drawContainer(current.x, blockY(stack.length) + off, current.w, current.color, false);
    }

    // falling pieces
    for (var f = 0; f < falling.length; f++) {
      var p = falling[f];
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + off + BLOCK_H / 2);
      ctx.rotate(p.rot);
      drawContainer(-p.w / 2, -BLOCK_H / 2, p.w, p.color, false);
      ctx.restore();
    }

    ctx.restore();
  }

  function loop() {
    step();
    render();
    if (running) raf = requestAnimationFrame(loop);
  }

  function handleDrop(e) {
    if (e) e.preventDefault();
    drop();
    if (!running && state !== 'over') { running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  }

  canvas.addEventListener('pointerdown', handleDrop);
  if (startBtn) startBtn.addEventListener('click', handleDrop);
  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') handleDrop(e);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body) handleDrop(e);
  });

  // pause when the tab is hidden, so nothing runs in the background
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (state === 'playing') { running = true; loop(); }
  });

  reset();
})();
