(function () {
  'use strict';

  /* ---------- Data ---------- */
  var FIRST = 19, LAST = 32;
  var SECTIONS = [
    { name: 'Practical 5',  sub: 'TCP/IP configuration',     from: 19, to: 21 },
    { name: 'Practical 6',  sub: 'Traffic analysis',         from: 22, to: 23 },
    { name: 'Practical 7',  sub: 'Folder & printer sharing', from: 24, to: 25 },
    { name: 'Practical 8',  sub: 'Class A, B, C networks',   from: 26, to: 27 },
    { name: 'Practical 9',  sub: 'Subnet planning',          from: 28, to: 29 },
    { name: 'Practical 10', sub: 'Switch, router, Wi-Fi',    from: 30, to: 32 }
  ];
  var pages = [];
  for (var p = FIRST; p <= LAST; p++) pages.push(p);

  function sectionOf(n) {
    for (var i = 0; i < SECTIONS.length; i++)
      if (n >= SECTIONS[i].from && n <= SECTIONS[i].to) return SECTIONS[i];
    return SECTIONS[0];
  }
  function src(n) { return 'images/page_' + n + '.png'; }

  /* ---------- Build gallery ---------- */
  var gallery = document.getElementById('gallery');
  var chips = document.getElementById('chips');

  pages.forEach(function (n, idx) {
    var card = document.createElement('section');
    card.className = 'card';
    card.id = 'page-' + n;

    var head = document.createElement('header');
    head.innerHTML = '<b>' + sectionOf(n).name + '</b><span>Page ' + n + '</span>';

    var btn = document.createElement('button');
    btn.className = 'pg';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open page ' + n + ' in zoom viewer');

    var img = document.createElement('img');
    img.src = src(n);
    img.alt = 'Manual page ' + n;
    img.loading = idx < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.width = 1191; img.height = 1684;

    btn.appendChild(img);
    btn.addEventListener('click', function () { openViewer(idx); });
    card.appendChild(head);
    card.appendChild(btn);
    gallery.appendChild(card);
  });

  SECTIONS.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.name;
    b.title = s.sub;
    b.addEventListener('click', function () {
      document.getElementById('page-' + s.from).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    chips.appendChild(b);
  });

  /* ---------- Viewer ---------- */
  var viewer = document.getElementById('viewer');
  var stage  = document.getElementById('stage');
  var vImg   = document.getElementById('vImg');
  var vCount = document.getElementById('vCount');
  var vPrev  = document.getElementById('vPrev');
  var vNext  = document.getElementById('vNext');

  var MIN = 1, MAX = 6;
  var cur = 0, scale = 1, tx = 0, ty = 0, fitW = 0, fitH = 0;
  var pointers = new Map();
  var pinch = null, drag = null, lastTap = 0, lastTapX = 0, lastTapY = 0;
  var downInfo = null;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function stageSize() {
    var r = stage.getBoundingClientRect();
    return { w: r.width, h: r.height, left: r.left, top: r.top };
  }

  function computeFit() {
    var s = stageSize();
    var ratio = (vImg.naturalWidth || 1191) / (vImg.naturalHeight || 1684);
    var w = s.w, h = w / ratio;
    if (h > s.h) { h = s.h; w = h * ratio; }
    fitW = w; fitH = h;
    vImg.style.width = w + 'px';
    vImg.style.height = h + 'px';
    vImg.style.left = ((s.w - w) / 2) + 'px';
    vImg.style.top = ((s.h - h) / 2) + 'px';
  }

  function limitPan() {
    var s = stageSize();
    var maxX = Math.max(0, (fitW * scale - s.w) / 2);
    var maxY = Math.max(0, (fitH * scale - s.h) / 2);
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);
  }

  function apply() {
    limitPan();
    vImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
  }

  // Zoom while keeping the point (cx, cy) in client coords fixed on screen.
  function zoomAt(newScale, cx, cy) {
    newScale = clamp(newScale, MIN, MAX);
    var s = stageSize();
    var px = cx - (s.left + s.w / 2);
    var py = cy - (s.top + s.h / 2);
    var k = newScale / scale;
    tx = px - (px - tx) * k;
    ty = py - (py - ty) * k;
    scale = newScale;
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }

  function resetZoom() { scale = 1; tx = 0; ty = 0; apply(); }

  function show(i) {
    cur = clamp(i, 0, pages.length - 1);
    vCount.textContent = (cur + 1) + ' / ' + pages.length + ' · Page ' + pages[cur];
    vPrev.disabled = cur === 0;
    vNext.disabled = cur === pages.length - 1;
    scale = 1; tx = 0; ty = 0;
    vImg.alt = 'Manual page ' + pages[cur];
    vImg.onload = function () { computeFit(); apply(); };
    vImg.src = src(pages[cur]);
    if (vImg.complete && vImg.naturalWidth) { computeFit(); apply(); }
    [cur - 1, cur + 1].forEach(function (j) {
      if (j >= 0 && j < pages.length) { var im = new Image(); im.src = src(pages[j]); }
    });
  }

  function openViewer(i) {
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    show(i);
    requestAnimationFrame(function () { computeFit(); apply(); });
  }

  function closeViewer() {
    viewer.hidden = true;
    document.body.style.overflow = '';
    var el = document.getElementById('page-' + pages[cur]);
    if (el) el.scrollIntoView({ block: 'start' });
  }

  /* Buttons */
  document.getElementById('vClose').addEventListener('click', closeViewer);
  document.getElementById('vReset').addEventListener('click', resetZoom);
  document.getElementById('vIn').addEventListener('click', function () {
    var s = stageSize(); zoomAt(scale * 1.5, s.left + s.w / 2, s.top + s.h / 2);
  });
  document.getElementById('vOut').addEventListener('click', function () {
    var s = stageSize(); zoomAt(scale / 1.5, s.left + s.w / 2, s.top + s.h / 2);
  });
  vPrev.addEventListener('click', function () { show(cur - 1); });
  vNext.addEventListener('click', function () { show(cur + 1); });

  /* Keyboard */
  document.addEventListener('keydown', function (e) {
    if (viewer.hidden) return;
    if (e.key === 'Escape') closeViewer();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === '+' || e.key === '=') document.getElementById('vIn').click();
    else if (e.key === '-') document.getElementById('vOut').click();
    else if (e.key === '0') resetZoom();
  });

  /* Mouse wheel / trackpad pinch */
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
    zoomAt(scale * f, e.clientX, e.clientY);
  }, { passive: false });

  /* Pointer gestures: pinch, pan, double-tap, swipe */
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

  stage.addEventListener('pointerdown', function (e) {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      downInfo = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
    } else if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch = { d: dist(pts[0], pts[1]), scale: scale };
      drag = null;
      if (downInfo) downInfo.moved = true;
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2 && pinch) {
      var pts = Array.from(pointers.values());
      var c = mid(pts[0], pts[1]);
      var d = dist(pts[0], pts[1]);
      zoomAt(pinch.scale * (d / pinch.d), c.x, c.y);
      return;
    }
    if (drag && pointers.size === 1) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (downInfo && Math.hypot(dx, dy) > 6) downInfo.moved = true;
      if (scale > 1) {
        tx = drag.tx + dx;
        ty = drag.ty + dy;
        apply();
      }
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    var wasSingle = pointers.size === 1;
    pointers.delete(e.pointerId);

    if (pointers.size < 2) pinch = null;

    if (pointers.size === 1) {
      var rest = Array.from(pointers.values())[0];
      drag = { x: rest.x, y: rest.y, tx: tx, ty: ty };
    } else if (pointers.size === 0) {
      drag = null;
      if (wasSingle && downInfo) {
        var dx = e.clientX - downInfo.x, dy = e.clientY - downInfo.y;
        var dt = Date.now() - downInfo.t;

        if (scale === 1 && dt < 500 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          show(cur + (dx < 0 ? 1 : -1));            // swipe
        } else if (!downInfo.moved && dt < 300) {    // double-tap
          var now = Date.now();
          if (now - lastTap < 320 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 30) {
            if (scale > 1.05) resetZoom(); else zoomAt(2.5, e.clientX, e.clientY);
            lastTap = 0;
          } else {
            lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
          }
        }
      }
      downInfo = null;
    }
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  window.addEventListener('resize', function () {
    if (!viewer.hidden) { computeFit(); apply(); }
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(function () { if (!viewer.hidden) { computeFit(); apply(); } }, 250);
  });
})();
