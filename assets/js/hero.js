/* ============================================================
 *  hero.js — #welcome 首屏 HERO 的交互层
 *
 *  移植自 discord-hero/index.html 的内联脚本，并针对宿主站做了三处适配：
 *   1. 粒子画布挂在 HERO 内部（原为全屏 fixed），指针坐标随之换算为
 *      HERO 局部坐标，粒子被 .hero overflow 裁剪在首屏内；
 *   2. 视差/分层退场的滚动容器由 window 改为宿主站消息区 .scroller；
 *   3. mount / unmount 生命周期：由 app.js 在进入/离开 welcome 频道时调用，
 *      全部监听器经 AbortController 统一销毁，切换频道零泄漏。
 *
 *  依赖：宿主站需保持以下结构（见 app.js VIEWS.welcome）
 *    #hero  #heroInner  .hero__grid  .glow  .hero__veil  #cue  #fx
 *  滚动引导（cue）不再由本模块接管：它是指向 #/portfolio 的锚点，
 *  点击后经宿主站 hashchange → go() 统一滚动，地址栏与激活态一并同步。
 * ============================================================ */
window.HERO = (function () {
  "use strict";

  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = mq.matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var mqHandler = null;

  var mounted = false;
  var ac = null;                 // AbortController：统一销毁所有监听
  var raf = 0;                   // 粒子帧循环
  var bgRaf = 0;                 // 背景弹性回中循环
  var io = null, riseIo = null, ro = null;

  var heroEl = null, innerEl = null, glowEl = null, gridEl = null, veilEl = null;
  var cueEl = null, scrollerEl = null, cvs = null, ctx = null;
  var W = 0, H = 0, dpr = 1, heroH = 0;

  var parts = [], amb = [], ambOn = false, heroVisible = false;
  var MAX = 240;
  var prev = 0, running = false;
  var lastSpawn = 0, lastX = -999, lastY = -999;
  var px = -9999, py = -9999, pActive = false, attract = false;

  var magnets = [], lastSheen = null, curEl = null;
  var scrollY = 0;
  var bgX = 0, bgY = 0, bgTX = 0, bgTY = 0, drag0 = null;

  /* ============================================================
   *  粒子精灵（预渲染为径向渐变位图，混加合成时逐点绘制代价高）
   * ============================================================ */
  var PALETTE = [[138, 146, 255], [88, 101, 242], [255, 255, 255], [0, 168, 252], [235, 69, 158]];
  var SPRITES = PALETTE.map(function (c) {
    var s = document.createElement("canvas");
    s.width = s.height = 64;
    var g = s.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",1)");
    grd.addColorStop(0.32, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.6)");
    grd.addColorStop(1, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return s;
  });

  /* ============================================================
   *  工具
   * ============================================================ */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function heroRect() { return heroEl.getBoundingClientRect(); }
  /** 视口坐标 → HERO 局部坐标；inside 表示指针是否落在 HERO 范围内 */
  function localPoint(e) {
    var r = heroRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    };
  }
  function clearCanvas() { if (ctx) ctx.clearRect(0, 0, W, H); }

  function resize() {
    if (!heroEl || !cvs) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);   /* 常驻粒子每帧全屏重绘，DPR 上限收到 1.5 */
    W = Math.max(1, heroEl.clientWidth);
    H = Math.max(1, heroEl.clientHeight);
    cvs.width = Math.round(W * dpr);
    cvs.height = Math.round(H * dpr);
    cvs.style.width = W + "px";
    cvs.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts.length = 0;                                     /* 位图被重置，旧坐标已失效 */
    initAmb();
    heroH = heroEl.offsetHeight || H;
  }

  /* ============================================================
   *  粒子系统（与原始实现一致：常驻力场 + 拖尾 + 点击凝聚）
   * ============================================================ */
  function initAmb() {
    amb.length = 0;
    var n = Math.round(Math.min(100, Math.max(30, (W * H) / 13000)));
    for (var i = 0; i < n; i++) {
      var bx = (Math.random() - 0.5) * 22, by = (Math.random() - 0.5) * 22;
      amb.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: bx, vy: by, bvx: bx, bvy: by,
        r: 0.55 + Math.random() * 0.9, a: 0.2 + Math.random() * 0.3,
        s: (Math.random() * SPRITES.length) | 0
      });
    }
  }

  function spawn(x, y, n, power) {
    if (reduce || !ctx) return;
    power = power || 1;
    for (var i = 0; i < n; i++) {
      if (parts.length >= MAX) return;
      var a = Math.random() * Math.PI * 2;
      var sp = (34 + Math.random() * 104) * power;
      var life = 380 + Math.random() * 340;
      parts.push({
        x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 22 * power,
        r: 1.5 + Math.random() * 2.6, life: life, max: life,
        s: (Math.random() * SPRITES.length) | 0
      });
    }
  }

  function tick(now) {
    if (!mounted || !ctx) { running = false; return; }
    var dt = prev ? Math.min(now - prev, 40) : 16;
    prev = now;
    var f = dt / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    /* 常驻粒子场：悬停推开、按下凝聚、拖拽带出尾迹 */
    if (ambOn) {
      for (var a = 0; a < amb.length; a++) {
        var q = amb[a];
        if (pActive) {
          var ox = q.x - px, oy = q.y - py, d2 = ox * ox + oy * oy;
          var R = attract ? 300 : 165;
          if (d2 < R * R && d2 > 4) {
            var d = Math.sqrt(d2), k = (1 - d / R) * (attract ? -115 : 195);
            q.vx += (ox / d) * k * f;
            q.vy += (oy / d) * k * f;
          }
        }
        q.vx += (q.bvx - q.vx) * 0.035;
        q.vy += (q.bvy - q.vy) * 0.035;
        var sp = Math.sqrt(q.vx * q.vx + q.vy * q.vy);
        if (sp > 115) { q.vx = q.vx / sp * 115; q.vy = q.vy / sp * 115; }
        q.x += q.vx * f;
        q.y += q.vy * f;
        if (q.x < -24) q.x = W + 24; else if (q.x > W + 24) q.x = -24;
        if (q.y < -24) q.y = H + 24; else if (q.y > H + 24) q.y = -24;
        ctx.globalAlpha = q.a;
        var as = q.r * 8;
        ctx.drawImage(SPRITES[q.s], q.x - as / 2, q.y - as / 2, as, as);
      }
    }

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.vy += 54 * f;
      p.vx *= 0.94;
      p.vy *= 0.94;
      var t = p.life / p.max;
      ctx.globalAlpha = t * t;
      var size = p.r * (1.15 + t * 0.95) * 4.1;
      ctx.drawImage(SPRITES[p.s], p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (parts.length || ambOn) raf = requestAnimationFrame(tick);
    else { running = false; prev = 0; clearCanvas(); }
  }
  function kick() {
    if (reduce || running || !mounted) return;
    running = true;
    prev = 0;
    raf = requestAnimationFrame(tick);
  }

  /* ============================================================
   *  指针事件
   * ============================================================ */
  function onPointerMove(e) {
    if (e.pointerType === "touch") return;
    var lp = localPoint(e);
    if (lp.inside) { px = lp.x; py = lp.y; pActive = true; }
    else { pActive = false; }

    /* 自定义光标跟随 + 命中态 */
    if (curEl) {
      curEl.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0) translate(-50%,-50%)";
      var hot = e.target && e.target.closest ? e.target.closest("a,button,input,[data-spark]") : null;
      curEl.classList.toggle("is-hot", !!hot);
    }

    /* 玻璃光源跟随（只认 HERO 内的玻璃元素） */
    var g = e.target && e.target.closest ? e.target.closest(".pill,.board,.btn--ghost") : null;
    if (g && !heroEl.contains(g)) g = null;
    if (g) {
      var gr = g.getBoundingClientRect();
      g.style.setProperty("--gx", (e.clientX - gr.left).toFixed(0) + "px");
      g.style.setProperty("--gy", (e.clientY - gr.top).toFixed(0) + "px");
      if (lastSheen && lastSheen !== g) {
        lastSheen.style.removeProperty("--gx");
        lastSheen.style.removeProperty("--gy");
      }
      lastSheen = g;
    } else if (lastSheen) {
      lastSheen.style.removeProperty("--gx");
      lastSheen.style.removeProperty("--gy");
      lastSheen = null;
    }

    /* 拖尾粒子：节流 + 最小移动距离，避免密集喷洒 */
    if (reduce || !lp.inside) return;
    var now = performance.now();
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (now - lastSpawn < 42) return;
    if (dx * dx + dy * dy < 196) return;
    lastSpawn = now;
    lastX = e.clientX;
    lastY = e.clientY;
    spawn(lp.x, lp.y, 3, 0.85);
    kick();
  }

  function onPointerDown(e) {
    if (reduce) return;
    var lp = localPoint(e);
    if (e.pointerType === "touch") {           /* 移动端：粒子不生效，改用涟漪反馈 */
      if (!lp.inside) return;
      var rp = document.createElement("span");
      rp.className = "ripple";
      rp.style.left = e.clientX + "px";
      rp.style.top = e.clientY + "px";
      document.body.appendChild(rp);
      rp.addEventListener("animationend", function () { rp.remove(); });
      return;
    }
    if (curEl) curEl.classList.add("is-down");
    if (!lp.inside) return;
    attract = true;                            /* 按下凝聚，松手散开 */
    spawn(lp.x, lp.y, 30, 1.6);
    kick();
  }

  function onPointerUp() {
    attract = false;
    if (curEl) curEl.classList.remove("is-down");
  }

  function onPointerOver(e) {
    if (reduce || !heroEl) return;
    var el = e.target && e.target.closest ? e.target.closest("[data-spark]") : null;
    if (!el || !heroEl.contains(el)) return;
    var lp = localPoint(e);
    if (!lp.inside) return;
    spawn(lp.x, lp.y, 18, 1.15);
    kick();
  }

  /* ============================================================
   *  滚动视差 / 分层退场（滚动容器 = 宿主消息区 .scroller）
   * ============================================================ */
  function measure() { if (heroEl) heroH = heroEl.offsetHeight || W; }

  /* 背景三层各自反向位移 → 纵深；拖拽偏移叠加在同一条 transform 上 */
  function applyBg() {
    if (glowEl) glowEl.style.transform = "translate3d(" + (bgX * 0.55).toFixed(1) + "px," + (bgY * 0.55 + scrollY * 0.08).toFixed(1) + "px,0)";
    if (gridEl) gridEl.style.transform = "translate3d(" + (bgX * 0.3).toFixed(1) + "px," + (bgY * 0.3 + scrollY * 0.05).toFixed(1) + "px,0)";
    if (veilEl) veilEl.style.transform = "translate3d(" + (bgX * 0.18).toFixed(1) + "px," + (bgY * 0.18 + scrollY * 0.025).toFixed(1) + "px,0)";
  }
  function bgLoop() {
    bgX += (bgTX - bgX) * 0.16;
    bgY += (bgTY - bgY) * 0.16;
    applyBg();
    if (Math.abs(bgTX - bgX) > 0.4 || Math.abs(bgTY - bgY) > 0.4) bgRaf = requestAnimationFrame(bgLoop);
    else { bgX = bgTX; bgY = bgTY; applyBg(); bgRaf = 0; }
  }
  function bgKick() { if (!bgRaf && mounted) bgRaf = requestAnimationFrame(bgLoop); }

  function onFrame() {
    if (!mounted || !heroEl) return;
    if (!heroH) measure();
    var y = scrollerEl ? scrollerEl.scrollTop : 0;
    scrollY = y;
    /* p 到 1 正好是 hero 离场：内容不再提前消失 */
    var p = Math.min(1, Math.max(0, y / (heroH || 1)));
    /* pe = 缓动后的进度（两端导数 0）：所有「派生视觉量」走 pe，进出才不带
       拐点；而 --sy 的位移补偿必须严格线性跟随滚动，否则首屏会与页面位移
       脱钩，出现「追不上 / 抢跑」的漂浮感。 */
    var pe = p * p * (3 - 2 * p);
    /* 内容淡出走二次曲线的缓动版：前段几乎不掉，首屏是「被第二屏盖住」
       而不是提前消失，末尾才退干净，避免两层同时半透明糊成一团 */
    if (innerEl) innerEl.style.opacity = String(Math.max(0, 1 - Math.pow(pe, 1.45) * 1.02));
    if (!reduce) {
      heroEl.style.setProperty("--p", p.toFixed(4));
      heroEl.style.setProperty("--pe", pe.toFixed(4));
      /* 磁吸翻页档：首屏**不做**位移补偿（--sy 恒 0），整屏刚性跟随滚动，
         与第二屏无缝拼接 —— 「翻页感」交给 scroll-snap 的落位，而不是靠
         首屏钉住 + 第二屏覆盖（那样看着像浮层在飘，没有「页」的实体感）。
         这里只保留镜头语言：内容淡出、整屏渐暗、内层轻微上飘。
         两个量刻意归零：
           --sy 反向补偿会让首屏底边盖住第二屏顶边，两屏交界出现错位；
           --ss 整层缩放会让首屏边缘内缩，露出底下的背景缝。
         两者在「钉住」档下都看不见（首屏始终在视口内且被覆盖），
         改成刚性拼接后就都会露馅。 */
      heroEl.style.setProperty("--sy", "0px");
      heroEl.style.setProperty("--ss", "1");
      if (innerEl) {
        /* 整层已钉住，内层只留一点点自身上飘做纵深（原本的 -104px 会把
           补偿抵消掉一半，首屏又开始「滑走」，因此大幅压低） */
        innerEl.style.setProperty("--py", (-pe * 22).toFixed(1) + "px");
        innerEl.style.setProperty("--ps", (1 - pe * 0.055).toFixed(4));
      }
      applyBg();
    }
    if (cvs) cvs.style.opacity = (1 - pe * 0.62).toFixed(3);   /* 粒子属于首屏氛围，滚动后压暗 */
    if (cueEl) cueEl.classList.toggle("is-hidden", p > 0.05);
  }
  /* 直接执行而非包 requestAnimationFrame：无头 / 后台标签页的 rAF 会被节流，
     滚动反馈可能长时间不更新（测试与低功耗场景均可见）；Chrome 的滚动事件
     本身按帧合并，直接应用等价于逐帧更新且永不迟到。 */
  function onScroll() {
    if (!mounted) return;
    onFrame();
  }

  /* ============================================================
   *  3D 倾斜 + 磁吸 CTA + 背景拖拽
   * ============================================================ */
  function heroLeave() {
    if (reduce || !innerEl) return;
    innerEl.style.setProperty("--rx", "0deg");
    innerEl.style.setProperty("--ry", "0deg");
    magnets.forEach(function (el) {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  }

  function onHeroPointerMove(e) {
    if (reduce || e.pointerType === "touch" || !innerEl) return;
    var hr = heroRect();
    var nx = clamp((e.clientX - (hr.left + hr.width / 2)) / (hr.width / 2), -1, 1);
    var ny = clamp((e.clientY - (hr.top + hr.height / 2)) / (hr.height / 2), -1, 1);
    innerEl.style.setProperty("--ry", (nx * 1.5).toFixed(2) + "deg");
    innerEl.style.setProperty("--rx", (-ny * 1.3).toFixed(2) + "deg");
    for (var i = 0; i < magnets.length; i++) {
      var el = magnets[i], r = el.getBoundingClientRect();
      /* 减掉已施加的偏移：否则"按钮靠近指针 → 距离变近 → 吸得更狠"会正反馈 */
      var ox = parseFloat(el.style.getPropertyValue("--mx")) || 0;
      var oy = parseFloat(el.style.getPropertyValue("--my")) || 0;
      var dx = e.clientX - (r.left + r.width / 2 - ox);
      var dy = e.clientY - (r.top + r.height / 2 - oy);
      var dist = Math.sqrt(dx * dx + dy * dy);
      var R = Math.max(r.width, r.height) / 2 + 90;
      if (dist > 0.5 && dist < R) {
        var k = (1 - dist / R) * 9;
        el.style.setProperty("--mx", (dx / dist * k).toFixed(2) + "px");
        el.style.setProperty("--my", (dy / dist * k).toFixed(2) + "px");
      } else {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      }
    }
  }

  /* 拖拽背景：抓住空间，松手弹性回中（不拦截链接/按钮上的按下） */
  function onHeroPointerDown(e) {
    if (reduce || e.pointerType !== "mouse") return;
    if (e.target && e.target.closest && e.target.closest("a,button,input")) return;
    drag0 = { x: e.clientX, y: e.clientY };
    heroEl.classList.add("is-dragging");
  }
  function onWinPointerMove(e) {
    if (!drag0) return;
    bgTX = (e.clientX - drag0.x) * 0.75;
    bgTY = (e.clientY - drag0.y) * 0.75;
    bgKick();
  }
  function endDrag() {
    if (!drag0) return;
    drag0 = null;
    bgTX = 0;
    bgTY = 0;
    bgKick();
    if (heroEl) heroEl.classList.remove("is-dragging");
  }

  /* ============================================================
   *  光标 / 涟漪容器 / rise 重放 / 可见性
   * ============================================================ */
  function ensureCursor() {
    if (!curEl) {
      curEl = document.createElement("div");
      curEl.className = "cursor";
      curEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(curEl);
    }
    if (fine && !reduce) document.documentElement.classList.add("has-cursor");
  }
  function teardownCursor() {
    document.documentElement.classList.remove("has-cursor");
    if (curEl) {
      curEl.classList.remove("is-on", "is-hot", "is-down");
      curEl.style.transform = "";
    }
  }

  function initRiseReplay() {
    var riseEls = [].slice.call(heroEl.querySelectorAll(".hero__inner .rise"));
    riseEls.forEach(function (el) {
      el.addEventListener("animationend", function (ev) {
        if (ev.target === el) el.classList.remove("rise");   /* 交还给 CSS，分层退场的 transform 才生效 */
      });
    });
    if (!("IntersectionObserver" in window)) return;
    var hasLeft = false;
    riseIo = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.intersectionRatio > 0.6) {
          if (hasLeft && !reduce) {
            riseEls.forEach(function (el) { el.classList.remove("rise"); });
            void heroEl.offsetHeight;
            riseEls.forEach(function (el) { el.classList.add("rise"); });
          }
          hasLeft = false;
        } else if (en.intersectionRatio < 0.25) {
          hasLeft = true;
        }
      });
    }, { threshold: [0, 0.25, 0.6, 1] });
    riseIo.observe(heroEl);
  }

  function onVisibility() {
    if (document.hidden) {
      parts.length = 0;
      clearCanvas();
      ambOn = false;
    } else if (mounted) {
      ambOn = !reduce && heroVisible && !document.hidden;
      if (ambOn) kick();
    }
  }

  /* ============================================================
   *  mount / unmount
   * ============================================================ */
  function mount() {
    if (mounted) unmount();
    heroEl = document.getElementById("hero");
    if (!heroEl) return;
    innerEl = document.getElementById("heroInner");
    glowEl = heroEl.querySelector(".glow");
    gridEl = heroEl.querySelector(".hero__grid");
    veilEl = heroEl.querySelector(".hero__veil");
    cueEl = document.getElementById("cue");
    scrollerEl = document.getElementById("scroller");
    cvs = document.getElementById("fx");
    if (!cvs) return;
    ctx = cvs.getContext("2d");
    if (!ctx) return;

    mounted = true;
    ac = new AbortController();
    var sig = ac.signal;

    magnets = [].slice.call(heroEl.querySelectorAll("[data-magnet]"));
    parts = [];
    amb = [];
    ambOn = false;
    attract = false;
    pActive = false;
    running = false;
    prev = 0;
    bgX = bgY = bgTX = bgTY = 0;
    drag0 = null;
    lastSheen = null;

    ensureCursor();
    resize();
    measure();
    onFrame();

    if (curEl && heroEl.matches && heroEl.matches(":hover")) curEl.classList.add("is-on");

    window.addEventListener("resize", resize, { signal: sig });
    window.addEventListener("resize", function () { measure(); onFrame(); }, { signal: sig });
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { resize(); });
      ro.observe(heroEl);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true, signal: sig });
    document.addEventListener("pointerdown", onPointerDown, { passive: true, signal: sig });
    document.addEventListener("pointerover", onPointerOver, { passive: true, signal: sig });
    document.addEventListener("pointerleave", function () { pActive = false; }, { signal: sig });
    window.addEventListener("pointerup", onPointerUp, { passive: true, signal: sig });
    window.addEventListener("pointerup", endDrag, { signal: sig });
    window.addEventListener("pointercancel", endDrag, { signal: sig });

    heroEl.addEventListener("pointerdown", onHeroPointerDown, { signal: sig });
    heroEl.addEventListener("pointermove", onHeroPointerMove, { passive: true, signal: sig });
    heroEl.addEventListener("pointerenter", function () { if (curEl) curEl.classList.add("is-on"); }, { signal: sig });
    heroEl.addEventListener("pointerleave", function () {
      if (curEl) curEl.classList.remove("is-on");
      heroLeave();
    }, { signal: sig });
    window.addEventListener("pointermove", onWinPointerMove, { passive: true, signal: sig });

    if (scrollerEl) scrollerEl.addEventListener("scroll", onScroll, { passive: true, signal: sig });
    document.addEventListener("visibilitychange", onVisibility, { signal: sig });

    mqHandler = function (e) {
      reduce = e.matches;
      if (reduce) {
        parts.length = 0;
        clearCanvas();
        ambOn = false;
        teardownCursor();
        heroLeave();
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", mqHandler);
    else if (mq.addListener) mq.addListener(mqHandler);

    /* 常驻粒子场只在 HERO 可见时运行：滚到"速览"后停止全屏重绘 */
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          heroVisible = en.isIntersecting;
          ambOn = !reduce && heroVisible && !document.hidden;
          if (ambOn) kick();
        });
      }, { threshold: 0 });
      io.observe(heroEl);
    } else {
      heroVisible = true;
      ambOn = !reduce;
      kick();
    }

    initRiseReplay();
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    if (ac) { ac.abort(); ac = null; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (bgRaf) { cancelAnimationFrame(bgRaf); bgRaf = 0; }
    if (io) { io.disconnect(); io = null; }
    if (riseIo) { riseIo.disconnect(); riseIo = null; }
    if (ro) { ro.disconnect(); ro = null; }
    if (mqHandler) {
      if (mq.removeEventListener) mq.removeEventListener("change", mqHandler);
      else if (mq.removeListener) mq.removeListener(mqHandler);
      mqHandler = null;
    }
    parts = [];
    amb = [];
    ambOn = false;
    running = false;
    prev = 0;
    heroVisible = false;
    clearCanvas();
    if (heroEl) heroEl.classList.remove("is-dragging");
    teardownCursor();
    heroEl = innerEl = glowEl = gridEl = veilEl = cueEl = null;
    cvs = ctx = null;
    scrollerEl = null;
    magnets = [];
    lastSheen = null;
  }

  return { mount: mount, unmount: unmount };
})();
