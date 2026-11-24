(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LINES = [
    "Şu ana kadar yaptığınız her şey...",
    "Öğrettiğiniz her bilgi...",
    "Gösterdiğiniz her bir merhamet damlası...",
    "Bize inandığınız her an...",
    "Sabırla yeniden anlattığınız her konu...",
    "Küçük başarılarımızı bile kutlamanız...",
    "Hatalarımızı öğrenme fırsatına çevirmeniz...",
    "Bizi dinlemek için ayırdığınız zaman...",
    "Düştüğümüzde bizi yeniden cesaretlendirmeniz...",
    "Her birimize ayrı ayrı değer vermeniz...",
    "Sadece dersleri değil, hayatı da öğretmeniz...",
    "Gülümsemenizle sınıfı güzelleştirmeniz...",
    "Yorulduğunuzda bile gösterdiğiniz emek...",
    "Bize kazandırdığınız özgüven...",
    "Bitmek bilmeyen sorularımıza gösterdiğiniz sabır...",
    "Bizi olduğumuz gibi kabul etmeniz...",
    "Doğruyu bulmamız için yol göstermeniz...",
    "En küçük ilerlememizi bile fark etmeniz...",
    "Geleceğimize bıraktığınız güzel izler...",
    "Kalbimizde bıraktığınız unutulmaz izler..."
  ];

  const TITLE = "Öğretmenler Gününüz Kutlu Olsun!!!";
  const FINAL = "Her biri için ayrı ayrı teşekkür ederim, Canım Öğretmenim...";

  const candle = document.getElementById("candle");
  const smoke = document.getElementById("smoke");
  const cells = document.getElementById("cells");
  const cellGrid = document.getElementById("cell-grid");
  const cellVeil = document.getElementById("cell-veil");
  const sheet = document.getElementById("sheet");
  const sheetPath = document.getElementById("sheet-path");
  const sheetEdge = document.getElementById("sheet-edge");
  const sheetLabel = document.getElementById("sheet-label");
  const sparks = document.getElementById("sparks");

  const hello = document.getElementById("hello");
  const scene1 = document.querySelector(".scene-1");
  const btnStart = document.getElementById("btn-start");
  const btnNext2 = document.getElementById("btn-next-2");
  const btnGor = document.getElementById("btn-gor");
  const btnNext3 = document.getElementById("btn-next-3");
  const patience = document.getElementById("patience");
  const fold = document.getElementById("fold");
  const btnSecret = document.getElementById("btn-secret");
  const askWrap = document.getElementById("ask-wrap");
  const letterLayout = document.getElementById("letter-layout");
  const letterStack = document.getElementById("letter-stack");
  const envelope = document.getElementById("envelope");
  const flap = document.getElementById("flap");
  const btnEee = document.getElementById("btn-eee");
  const finaleTitle = document.getElementById("finale-title");
  const finaleList = document.getElementById("finale-list");
  const finaleEnd = document.getElementById("finale-end");

  let busy = true;
  let patienceOpen = false;
  let finaleStarted = false;
  let cellState = null;
  let sheetGeom = null;
  let leading = "top";
  let caret = null;

  function wait(ms) {
    if (prefersReduced || ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    function sampleX(t) {
      return ((ax * t + bx) * t + cx) * t;
    }
    function sampleY(t) {
      return ((ay * t + by) * t + cy) * t;
    }
    function sampleDX(t) {
      return (3 * ax * t + 2 * bx) * t + cx;
    }
    return function (t) {
      let x = t;
      for (let i = 0; i < 6; i++) {
        const dx = sampleX(x) - t;
        const d = sampleDX(x);
        if (Math.abs(dx) < 1e-4 || Math.abs(d) < 1e-5) break;
        x = clamp(x - dx / d, 0, 1);
      }
      return sampleY(x);
    };
  }

  const easeCell = cubicBezier(0.76, 0, 0.24, 1);
  const easeOut = cubicBezier(0.22, 1, 0.36, 1);
  const easeInOut = cubicBezier(0.45, 0, 0.2, 1);
  const easeIn = cubicBezier(0.5, 0, 0.85, 0.2);

  function tween({ from, to, duration, ease, onUpdate }) {
    if (prefersReduced || duration <= 0) {
      onUpdate(Object.assign({}, from, to));
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const keys = Object.keys(to);
      const start = performance.now();
      function frame(now) {
        const p = clamp((now - start) / duration, 0, 1);
        const e = ease(p);
        const cur = Object.assign({}, from);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          cur[k] = from[k] + (to[k] - from[k]) * e;
        }
        onUpdate(cur);
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function showScene(n) {
    document.querySelectorAll(".scene").forEach((scene) => {
      const on = scene.dataset.scene === String(n);
      scene.classList.toggle("is-active", on);
      scene.classList.remove("is-under");
      if (on) {
        scene.removeAttribute("inert");
        scene.setAttribute("aria-hidden", "false");
      } else {
        scene.setAttribute("inert", "");
        scene.setAttribute("aria-hidden", "true");
      }
    });
    const active = document.querySelector(".scene.is-active");
    const head = active && active.querySelector("h1");
    if (head) {
      head.setAttribute("tabindex", "-1");
      head.focus({ preventScroll: true });
    }
  }

  function placeUnder(n) {
    const scene = document.querySelector('.scene[data-scene="' + n + '"]');
    scene.classList.add("is-under");
    scene.removeAttribute("inert");
  }

  function paintCandle(r, soft, ox) {
    if (r < 2) {
      candle.style.background = "#14110e";
      return;
    }
    const x = window.innerWidth / 2 + (ox || 0);
    const y = window.innerHeight * 0.44;
    const a = Math.max(0, r * 0.5);
    const b = Math.max(a + 1, r);
    const c = b + soft * 0.5;
    const d = c + soft;
    const e = d + soft * 0.8 + 30;
    candle.style.background =
      "radial-gradient(circle at " + x + "px " + y + "px," +
      "rgba(255,246,226,0) " + a + "px," +
      "rgba(255,214,150,0.32) " + b + "px," +
      "rgba(120,68,32,0.38) " + c + "px," +
      "rgba(20,16,12,0.94) " + d + "px," +
      "#14110e " + e + "px)";
  }

  async function playCandle() {
    if (prefersReduced) {
      candle.style.display = "none";
      smoke.style.display = "none";
      hello.classList.add("is-lit");
      scene1.classList.add("is-ready");
      btnStart.disabled = false;
      hello.setAttribute("tabindex", "-1");
      hello.focus({ preventScroll: true });
      return;
    }

    const st = { r: 0, soft: 12, ox: 0 };
    paintCandle(0, 12, 0);
    const flickers = [
      { r: 24, ox: -4, d: 160 },
      { r: 12, ox: 6, d: 120 },
      { r: 32, ox: -2, d: 150 },
      { r: 14, ox: 5, d: 110 },
      { r: 22, ox: -6, d: 140 },
      { r: 8, ox: 2, d: 130 },
      { r: 4, ox: 0, d: 180 }
    ];

    for (let i = 0; i < flickers.length; i++) {
      const step = flickers[i];
      await tween({
        from: { r: st.r, soft: st.soft, ox: st.ox },
        to: { r: step.r, soft: 12, ox: step.ox },
        duration: step.d,
        ease: function (t) { return t; },
        onUpdate: function (v) {
          st.r = v.r;
          st.soft = v.soft;
          st.ox = v.ox;
          paintCandle(st.r, st.soft, st.ox);
        }
      });
    }

    smoke.animate(
      [
        { opacity: 0.75, transform: "translate(-50%, 10px)" },
        { opacity: 0, transform: "translate(-50%, -100px)" }
      ],
      { duration: 980, easing: "ease-out", fill: "forwards" }
    );

    await wait(620);
    hello.classList.add("is-lit");

    const far = Math.hypot(window.innerWidth, window.innerHeight);
    await tween({
      from: { r: 10, soft: 16, ox: 0 },
      to: { r: far * 0.78, soft: 110, ox: 0 },
      duration: 1280,
      ease: easeCell,
      onUpdate: function (v) {
        paintCandle(v.r, v.soft, 0);
      }
    });

    scene1.classList.add("is-ready");
    btnStart.disabled = false;

    await tween({
      from: { r: far * 0.78, soft: 110 },
      to: { r: far * 1.45, soft: 180 },
      duration: 640,
      ease: easeOut,
      onUpdate: function (v) {
        paintCandle(v.r, v.soft, 0);
      }
    });

    candle.style.display = "none";
    smoke.style.display = "none";
  }

  function buildCells() {
    const narrow = window.innerWidth < 720;
    const cols = narrow ? 8 : 16;
    const rows = narrow ? 7 : 10;
    cellGrid.style.setProperty("--cols", cols);
    cellGrid.style.setProperty("--rows", rows);
    cellGrid.replaceChildren();
    const frag = document.createDocumentFragment();
    const list = [];
    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      frag.appendChild(cell);
      list.push(cell);
    }
    cellGrid.appendChild(frag);
    return { cols: cols, rows: rows, cells: list };
  }

  function runCells(opening) {
    const cols = cellState.cols;
    const rows = cellState.rows;
    const list = cellState.cells;
    const each = prefersReduced ? 0 : 28;
    const dur = prefersReduced ? 1 : 420;
    const maxWait = Math.hypot(cols - 1, rows - 1) * each + dur;
    list.forEach(function (cell, i) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const dist = Math.hypot(c - (cols - 1), r - (rows - 1));
      cell.animate(
        [
          { transform: opening ? "scaleX(1)" : "scaleX(0)" },
          { transform: opening ? "scaleX(0)" : "scaleX(1)" }
        ],
        {
          duration: dur,
          delay: dist * each,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          fill: "forwards"
        }
      );
    });
    cellVeil.animate(
      opening
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: prefersReduced ? 1 : 900,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards"
      }
    );
    return wait(maxWait + 30);
  }

  async function closeCells() {
    cellState = buildCells();
    cells.classList.add("is-on");
    cells.removeAttribute("aria-hidden");
    await runCells(false);
  }

  async function openCells() {
    await runCells(true);
    cells.classList.remove("is-on");
    cells.setAttribute("aria-hidden", "true");
    cellGrid.replaceChildren();
    cellState = null;
  }

  function drawSheet(g) {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    sheet.setAttribute("viewBox", "0 0 " + w + " " + h);
    const maxB = w * 0.42;
    const topY = g.top * h;
    const botY = g.bot * h;
    const up = clamp(g.topBulge * h, -maxB, maxB);
    const down = clamp(g.botBulge * h, -maxB, maxB);
    const cTop = topY - up * 2;
    const cBot = botY + down * 2;
    sheetPath.setAttribute(
      "d",
      "M 0 " + topY + " Q " + (w / 2) + " " + cTop + " " + w + " " + topY +
      " L " + w + " " + botY + " Q " + (w / 2) + " " + cBot + " 0 " + botY + " Z"
    );
    if (leading === "top") {
      sheetEdge.setAttribute("d", "M 0 " + topY + " Q " + (w / 2) + " " + cTop + " " + w + " " + topY);
    } else {
      sheetEdge.setAttribute("d", "M 0 " + botY + " Q " + (w / 2) + " " + cBot + " " + w + " " + botY);
    }
    sheetGeom = {
      top: g.top,
      bot: g.bot,
      topBulge: g.topBulge,
      botBulge: g.botBulge
    };
  }

  window.addEventListener("resize", function () {
    if (sheetGeom && sheet.style.visibility === "visible") drawSheet(sheetGeom);
  });

  async function coverSheet() {
    leading = "top";
    sheetPath.setAttribute("fill", "#1a2823");
    sheet.style.visibility = "visible";
    const g = { top: 1.12, bot: 1.9, topBulge: 0.02, botBulge: 0 };
    drawSheet(g);
    await tween({
      from: Object.assign({}, g),
      to: { top: -0.02, bot: 1.06, topBulge: 0.2, botBulge: 0 },
      duration: 820,
      ease: easeOut,
      onUpdate: drawSheet
    });
    await tween({
      from: Object.assign({}, sheetGeom),
      to: { topBulge: -0.02 },
      duration: 200,
      ease: easeOut,
      onUpdate: drawSheet
    });
    await tween({
      from: Object.assign({}, sheetGeom),
      to: { topBulge: 0 },
      duration: 180,
      ease: easeInOut,
      onUpdate: drawSheet
    });
    if (!prefersReduced) {
      sheetLabel.textContent = "Bir sır";
      sheetLabel.animate(
        [
          { opacity: 0, transform: "scaleX(1.14)" },
          { opacity: 1, transform: "scaleX(1)" }
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      );
      await wait(680);
      await sheetLabel.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-28px)" }
        ],
        { duration: 360, easing: "ease-in", fill: "forwards" }
      ).finished;
    }
  }

  async function revealSheet() {
    leading = "bottom";
    await tween({
      from: Object.assign({}, sheetGeom),
      to: { top: -0.62, bot: -0.02, topBulge: 0, botBulge: 0.22 },
      duration: 760,
      ease: easeInOut,
      onUpdate: drawSheet
    });
    await tween({
      from: Object.assign({}, sheetGeom),
      to: { bot: -0.42, botBulge: 0 },
      duration: 380,
      ease: easeIn,
      onUpdate: drawSheet
    });
    sheet.style.visibility = "hidden";
    sheetPath.setAttribute("d", "");
    sheetEdge.setAttribute("d", "");
    sheetGeom = null;
    sheetLabel.textContent = "";
  }

  async function fallCurtain() {
    leading = "bottom";
    sheetPath.setAttribute("fill", "#0c0b0a");
    sheet.style.visibility = "visible";
    const g = { top: -0.72, bot: 0.0, topBulge: 0, botBulge: 0.24 };
    drawSheet(g);
    await tween({
      from: Object.assign({}, g),
      to: { top: -0.15, bot: 1.16, topBulge: 0, botBulge: 0.16 },
      duration: 1000,
      ease: cubicBezier(0.62, 0.02, 0.28, 1),
      onUpdate: drawSheet
    });
    await tween({
      from: Object.assign({}, sheetGeom),
      to: { botBulge: 0, top: -0.25 },
      duration: 320,
      ease: easeOut,
      onUpdate: drawSheet
    });
  }

  function burst(rect, options) {
    const count = options.count || 8;
    const colors = options.colors;
    const gravity = options.gravity == null ? 420 : options.gravity;
    const speed = options.speed || 150;
    const life = options.life || 0.72;
    if (prefersReduced) return Promise.resolve();

    const pieces = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("i");
      el.className = "spark";
      const w = 6 + Math.random() * (options.big ? 12 : 8);
      const h = 6 + Math.random() * (options.big ? 9 : 7);
      el.style.width = w + "px";
      el.style.height = h + "px";
      el.style.borderRadius = i % 3 === 0 ? "2px" : "99px";
      el.style.background = colors[i % colors.length];
      sparks.appendChild(el);
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.55 + Math.random() * 0.7);
      pieces.push({
        el: el,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - (options.lift || 30),
        rot: Math.random() * 40,
        vr: (Math.random() - 0.5) * 160,
        age: 0,
        max: life * (0.85 + Math.random() * 0.3)
      });
    }

    return new Promise(function (resolve) {
      let last = performance.now();
      function frame(now) {
        const dt = Math.min(0.034, (now - last) / 1000);
        last = now;
        let alive = false;
        for (let i = 0; i < pieces.length; i++) {
          const p = pieces[i];
          p.age += dt;
          if (p.age >= p.max) {
            p.el.style.opacity = "0";
            continue;
          }
          alive = true;
          p.vy += gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          const k = p.age / p.max;
          p.el.style.opacity = String(1 - k);
          p.el.style.transform = "translate(" + p.x + "px," + p.y + "px) rotate(" + p.rot + "deg)";
        }
        if (alive) requestAnimationFrame(frame);
        else {
          pieces.forEach(function (p) { p.el.remove(); });
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function moveCaret(el) {
    if (!caret) {
      caret = document.createElement("span");
      caret.className = "caret";
      caret.setAttribute("aria-hidden", "true");
    }
    el.appendChild(caret);
  }

  function typeInto(el, text, base) {
    if (prefersReduced) {
      el.textContent = text;
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      let i = 0;
      function step() {
        i += 1;
        el.textContent = text.slice(0, i);
        moveCaret(el);
        if (i >= text.length) {
          resolve();
          return;
        }
        const ch = text.charAt(i - 1);
        let delay = base;
        if (ch === " ") delay = base * 0.62;
        else if (",.!?:;".indexOf(ch) !== -1) delay = base * 2.3;
        setTimeout(step, delay);
      }
      step();
    });
  }

  async function startFinale() {
    if (finaleStarted) return;
    finaleStarted = true;
    finaleTitle.textContent = "";
    finaleEnd.textContent = "";
    finaleList.replaceChildren();

    await typeInto(finaleTitle, TITLE, 92);
    await wait(420);

    for (let i = 0; i < LINES.length; i++) {
      const p = document.createElement("p");
      finaleList.appendChild(p);
      await typeInto(p, LINES[i], 44);
      finaleList.scrollTop = finaleList.scrollHeight;
      await wait(260);
    }

    if (caret && caret.parentNode) caret.remove();
    await wait(480);
    finaleEnd.classList.add("is-on");
    await typeInto(finaleEnd, FINAL, 98);
    if (caret && caret.parentNode) caret.remove();
    finaleEnd.scrollIntoView({ block: "nearest", behavior: prefersReduced ? "auto" : "smooth" });
  }

  async function openEnvelope() {
    letterLayout.hidden = false;
    if (prefersReduced) {
      envelope.classList.add("is-open");
      letterStack.classList.add("is-open");
    } else {
      await flap.animate(
        [
          { transform: "rotateX(0deg)" },
          { transform: "rotateX(-188deg)" },
          { transform: "rotateX(-172deg)" }
        ],
        { duration: 880, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      ).finished;
      envelope.classList.add("is-open");
      letterStack.classList.add("is-open");
      await wait(1180);
    }
    btnEee.hidden = false;
    btnEee.focus();
  }

  btnStart.addEventListener("click", async function () {
    if (busy) return;
    busy = true;
    btnStart.disabled = true;
    try {
      await closeCells();
      showScene(2);
      await openCells();
    } finally {
      busy = false;
    }
  });

  btnNext2.addEventListener("click", async function () {
    if (busy) return;
    busy = true;
    btnNext2.disabled = true;
    const rect = btnNext2.getBoundingClientRect();
    btnNext2.style.visibility = "hidden";
    try {
      placeUnder(3);
      const fly = burst(rect, {
        count: 8,
        big: true,
        gravity: 520,
        speed: 170,
        lift: 40,
        life: 0.78,
        colors: ["#f4f7e8", "#d7efe4", "#f6e7a4", "#8fcfc4", "#2f6a60", "#fffaf1"]
      });
      await wait(160);
      const scene2 = document.querySelector(".scene-2");
      if (!prefersReduced) {
        await scene2.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 420, easing: "ease", fill: "forwards" }
        ).finished;
      }
      showScene(3);
      scene2.style.opacity = "";
      await fly;
    } finally {
      busy = false;
    }
  });

  btnGor.addEventListener("click", function () {
    if (busy || patienceOpen) return;
    patienceOpen = true;
    patience.classList.add("is-open");
    btnGor.disabled = true;
    fold.removeAttribute("aria-hidden");
    btnNext3.disabled = false;
  });

  btnNext3.addEventListener("click", async function () {
    if (busy || !patienceOpen) return;
    busy = true;
    btnNext3.disabled = true;
    try {
      await coverSheet();
      showScene(4);
      await revealSheet();
    } finally {
      busy = false;
    }
  });

  btnSecret.addEventListener("click", async function () {
    if (busy) return;
    busy = true;
    btnSecret.disabled = true;
    const rect = btnSecret.getBoundingClientRect();
    try {
      const fly = burst(rect, {
        count: 9,
        gravity: 180,
        speed: 110,
        lift: 90,
        life: 0.7,
        colors: ["#f3e7c2", "#d5efe8", "#fffaf3", "#8ec9bf", "#e7d7a4"]
      });
      if (!prefersReduced) {
        askWrap.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 360, easing: "ease", fill: "forwards" }
        );
      }
      await wait(prefersReduced ? 0 : 260);
      askWrap.hidden = true;
      await openEnvelope();
      await fly;
    } finally {
      busy = false;
    }
  });

  btnEee.addEventListener("click", async function () {
    if (busy || finaleStarted) return;
    busy = true;
    btnEee.disabled = true;
    try {
      await fallCurtain();
      showScene(5);
      sheet.style.visibility = "hidden";
      sheetPath.setAttribute("d", "");
      sheetGeom = null;
      startFinale();
    } finally {
      busy = false;
    }
  });

  playCandle().then(function () {
    busy = false;
    btnStart.disabled = false;
  });
})();
