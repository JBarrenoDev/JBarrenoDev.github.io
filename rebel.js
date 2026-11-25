/* =========================================================
   MODO REBELDE
   1. Mira de francotirador  2. Disparo: el cristal se agrieta
   3. El cristal estalla      4. La bala atraviesa el menú nuevo
   El contenido se lee de la web normal, así solo se edita en un sitio.
   ========================================================= */
(() => {
  const btn = document.getElementById("rebelBtn");
  if (!btn) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // textos traducibles (ver i18n.js); si faltara, se usa la clave tal cual
  const T = (k) => (window.i18n ? window.i18n.t(k) : k);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  let busy = false;

  /* ---------------- Sonido (sintetizado, sin archivos) ---------------- */
  let ac;
  const audio = () => (ac ||= new (window.AudioContext || window.webkitAudioContext)());
  function noise(dur) {
    const ctx = audio(), buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; return src;
  }
  function env(node, t, peak, dur) {
    const g = audio().createGain();
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    node.connect(g); g.connect(audio().destination); return g;
  }
  const sfx = {
    shot() {
      const ctx = audio(), t = ctx.currentTime;
      const n = noise(0.5), f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.3);
      n.connect(f); env(f, t, 0.9, 0.45); n.start(t);
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      env(o, t, 0.8, 0.3); o.start(t); o.stop(t + 0.3);
    },
    glass() {
      const ctx = audio(), t = ctx.currentTime;
      const n = noise(1), f = ctx.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = 3500;
      n.connect(f); env(f, t, 0.35, 0.9); n.start(t);
      for (let i = 0; i < 14; i++) {
        const o = ctx.createOscillator(), tt = t + rand(0.02, 0.9);
        o.type = "triangle"; o.frequency.value = rand(2500, 7000);
        env(o, tt, rand(0.03, 0.08), rand(0.05, 0.15)); o.start(tt); o.stop(tt + 0.2);
      }
    },
    move() { blip(660, 0.05, "square", 0.06); },
    ok() { blip(880, 0.06, "square", 0.07); setTimeout(() => blip(1320, 0.08, "square", 0.07), 60); },
    back() { blip(440, 0.08, "sawtooth", 0.05); },
  };
  function blip(freq, dur, type, vol) {
    try {
      const ctx = audio(), t = ctx.currentTime, o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq; env(o, t, vol, dur); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* sin audio, no pasa nada */ }
  }
  const play = (name) => { try { sfx[name](); } catch (e) {} };

  /* ---------------- Contenido sacado de la web normal ---------------- */
  function readContent() {
    const txt = (s, r) => ($(s, r)?.textContent || "").trim();
    return {
      quote: txt(".about__big"),
      paras: $$(".about__text p:not(.about__big)").map((p) => p.innerHTML),
      timeline: $$(".timeline__item").map((li) => ({ when: txt(".timeline__when", li), what: txt("strong", li), where: txt(".timeline__where", li) })),
      stack: $$(".tech").map((li) => ({ name: txt(".tech__name", li), lvl: txt(".tech__lvl", li), n: +($(".meter", li)?.dataset.level || 0), red: li.classList.contains("tech--red") })),
      extra: txt(".stack__extra"),
      projects: $$(".project").map((li) => ({ title: txt(".project__title", li), desc: txt(".project__desc", li), tech: txt(".project__tech", li), href: $("a", li)?.href })),
      games: $$(".game").map((g) => ({ name: txt(".game__name", g), desc: txt(".game__body p", g), tags: $(".game__tags", g)?.innerHTML || "", href: $(".btn--red", g)?.getAttribute("href") || "#", media: $(".game__media video, .game__media img", g)?.outerHTML || "" })),
      mail: $(".contact__mail")?.textContent.trim(),
      github: "https://github.com/JBarrenoDev",
      cv: window.i18n ? window.i18n.cv() : "assets/cv/CV_Julian_Barreno_Lopez_ES.pdf",
    };
  }

  // el texto de cada opción está en i18n.js como rb.<id> y rb.<id>.sub
  const MENU = ["about", "stack", "projects", "games", "contact", "cv", "exit"].map((id) => ({ id }));
  const ROT = [-3, 2, -5, 1, -2, 3, -4];
  const OFF = [0, -40, 10, -60, -20, 20, -10];

  function screenHTML(id, c) {
    const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
    switch (id) {
      case "about":
        return `<p class="rb-x rb__quote">${esc(c.quote)}</p>
          ${c.paras.map((p) => `<p class="rb-x">${p}</p>`).join("")}
          ${c.timeline.map((t) => `<div class="rb-x rb-card"><small>${esc(t.when)}</small><strong>${esc(t.what)}</strong>${esc(t.where)}</div>`).join("")}`;
      case "stack":
        return c.stack.map((s) => `<div class="rb-x rb-stat${s.red ? " rb-stat--red" : ""}">
            <strong>${esc(s.name)}</strong><span>${esc(s.lvl)}</span>
            <span class="rb-bar">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= s.n ? "on" : ""}"></i>`).join("")}</span></div>`).join("")
          + `<p class="rb-x" style="margin-top:24px">${esc(c.extra)}</p>`;
      case "projects":
        return c.projects.map((p) => `<a class="rb-x rb-row" href="${esc(p.href)}" target="_blank" rel="noopener">
            <strong>${esc(p.title)}</strong><span>${esc(p.desc)} ${esc(p.tech)}.</span></a>`).join("");
      case "games":
        return c.games.map((g) => `<article class="rb-x rb-game">
            <div class="rb-game__media">${g.media || esc(T("game.video"))}</div>
            <h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p><p>${g.tags}</p>
            <a class="rb-play" href="${esc(g.href)}" target="_blank" rel="noopener">${esc(T("game.play"))}</a></article>`).join("");
      case "contact":
        return `<p class="rb-x">${esc(T("contact.lead"))}</p>
          <p class="rb-x"><a class="rb-mail" href="mailto:${esc(c.mail)}">${esc(c.mail)}</a></p>
          <p class="rb-x"><a class="rb-play" href="${c.github}" target="_blank" rel="noopener">${esc(T("contact.github"))}</a></p>`;
    }
    return "";
  }

  /* ---------------- Muñeco de prueba ----------------
     Un esqueleto sencillo dibujado en SVG. Cada apartado tiene su pose y
     el muñeco se mueve de una a otra.
     PARA USAR TUS FOTOS: guarda un PNG recortado (fondo transparente) por pose
     y apúntalo en FOTOS. La pantalla que tenga foto la usa en vez del muñeco. */
  const FOTOS = {
    // menu: "assets/rebelde/menu.png",
    // about: "assets/rebelde/about.png",
    // stack: "assets/rebelde/stack.png",
    // projects: "assets/rebelde/projects.png",
    // games: "assets/rebelde/games.png",
    // contact: "assets/rebelde/contact.png",
  };
  const POSES = {
    // ángulos en grados: 0 = hacia abajo, positivo = hacia la derecha, 180 = hacia arriba
    menu:     { x: 200, y: 440, torso: -5, head: 8,   laU: -30,  laL: 38,   raU: 12,  raL: 4,    ltU: -12, ltL: -4, rtU: 14, rtL: 6 },
    about:    { x: 200, y: 440, torso: 4,  head: -8,  laU: -10,  laL: -4,   raU: 150, raL: 205,  ltU: -8,  ltL: -2, rtU: 10, rtL: 4 },
    stack:    { x: 200, y: 440, torso: 0,  head: 0,   laU: -100, laL: -190, raU: 100, raL: 190,  ltU: -18, ltL: -6, rtU: 18, rtL: 6 },
    projects: { x: 190, y: 440, torso: 9,  head: 12,  laU: -26,  laL: 34,   raU: 96,  raL: 86,   ltU: -16, ltL: -2, rtU: 20, rtL: 10 },
    games:    { x: 200, y: 400, torso: -8, head: -6,  laU: -140, laL: -165, raU: 128, raL: 160,  ltU: -36, ltL: 42, rtU: 52, rtL: -28 },
    contact:  { x: 200, y: 440, torso: 3,  head: 12,  laU: -14,  laL: 20,   raU: 72,  raL: -165, ltU: -6,  ltL: 0,  rtU: 6,  rtL: -14 },
  };
  const BONES = { torso: 175, neck: 22, head: 44, armU: 98, armL: 92, thigh: 128, shin: 128, sh: 60, hip: 30 };
  const figImgs = {};
  let figEl, figSvg, figImg, figBurst, pose = { ...POSES.menu }, poseAnim = 0;

  function drawFig(p) {
    const rad = (d) => (d * Math.PI) / 180;
    const go = ([x, y], a, len) => [x + Math.sin(rad(a)) * len, y + Math.cos(rad(a)) * len];
    const up = (pt, a, len) => [pt[0] + Math.sin(rad(a)) * len, pt[1] - Math.cos(rad(a)) * len];
    const side = (pt, a, len) => [pt[0] + Math.cos(rad(a)) * len, pt[1] + Math.sin(rad(a)) * len];
    const B = BONES, hip = [p.x, p.y], chest = up(hip, p.torso, B.torso);
    const lSh = side(chest, p.torso, -B.sh), rSh = side(chest, p.torso, B.sh);
    const lHip = side(hip, p.torso, -B.hip), rHip = side(hip, p.torso, B.hip);
    const neck = up(chest, p.torso, B.neck), head = up(neck, p.torso + p.head, B.head);
    const lEl = go(lSh, p.laU, B.armU), lHa = go(lEl, p.laL, B.armL);
    const rEl = go(rSh, p.raU, B.armU), rHa = go(rEl, p.raL, B.armL);
    const lKn = go(lHip, p.ltU, B.thigh), lFt = go(lKn, p.ltL, B.shin);
    const rKn = go(rHip, p.rtU, B.thigh), rFt = go(rKn, p.rtL, B.shin);
    const lToe = [lFt[0] - 34, lFt[1] + 6], rToe = [rFt[0] + 34, rFt[1] + 6];
    const pl = (...pts) => pts.map((q) => q.map((n) => n.toFixed(1)).join(",")).join(" ");
    const parts = (extra, color) => `
      <g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="${pl(lHip, lKn, lFt, lToe)}" stroke-width="${44 + extra}"/>
        <polyline points="${pl(rHip, rKn, rFt, rToe)}" stroke-width="${44 + extra}"/>
        <polygon points="${pl(lSh, rSh, rHip, lHip)}" stroke-width="${40 + extra}" fill="${color}"/>
        <polyline points="${pl(chest, neck)}" stroke-width="${26 + extra}"/>
        <polyline points="${pl(lSh, lEl, lHa)}" stroke-width="${32 + extra}"/>
        <polyline points="${pl(rSh, rEl, rHa)}" stroke-width="${32 + extra}"/>
      </g>
      <circle cx="${head[0].toFixed(1)}" cy="${head[1].toFixed(1)}" r="${B.head + extra / 2}" fill="${color}"/>
      <circle cx="${lHa[0].toFixed(1)}" cy="${lHa[1].toFixed(1)}" r="${20 + extra / 2}" fill="${color}"/>
      <circle cx="${rHa[0].toFixed(1)}" cy="${rHa[1].toFixed(1)}" r="${20 + extra / 2}" fill="${color}"/>`;
    // marca de muñeco de pruebas: círculo partido en cuatro
    const mark = ([cx, cy], r) => `
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="var(--fig-mark)"/>
      <path d="M${cx.toFixed(1)},${cy.toFixed(1)} v${-r} a${r},${r} 0 0 1 ${r},${r} z M${cx.toFixed(1)},${cy.toFixed(1)} v${r} a${r},${r} 0 0 1 ${-r},${-r} z" fill="var(--fig)" transform="rotate(${p.torso + 20} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="none" stroke="var(--fig-mark)" stroke-width="4"/>`;
    const chestMark = up(hip, p.torso, B.torso * 0.72);
    figSvg.innerHTML = parts(18, "var(--fig-line)") + parts(0, "var(--fig)") + mark(head, 20) + mark(chestMark, 22);
  }

  function setPose(id, instant) {
    const target = POSES[id] || POSES.menu;
    cancelAnimationFrame(poseAnim);
    const useImg = !!figImgs[id];
    figImg.hidden = !useImg; figSvg.style.display = useImg ? "none" : "";
    if (useImg) figImg.src = figImgs[id];
    if (!reduce) {
      figBurst.animate([
        { transform: "scale(0) rotate(0deg)" }, { transform: "scale(1.15) rotate(50deg)", offset: 0.5 }, { transform: "scale(0) rotate(100deg)" },
      ], { duration: 620, easing: "ease-out", id: "burst" });
    }
    if (instant || reduce) { pose = { ...target }; drawFig(pose); return; }
    const from = { ...pose }, t0 = performance.now(), dur = 520;
    const back = (t) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = back(t);
      for (const k in target) pose[k] = from[k] + (target[k] - from[k]) * e;
      drawFig(pose);
      if (t < 1) poseAnim = requestAnimationFrame(step);
    };
    poseAnim = requestAnimationFrame(step);
  }

  /* ---------------- Construir la pantalla del modo ---------------- */
  let rb, stage, items, cursor, screen, sel = 0, content, current = "menu";
  function build() {
    rb = document.createElement("div");
    rb.className = "rb"; rb.hidden = true;
    rb.setAttribute("role", "dialog"); rb.setAttribute("aria-modal", "true"); rb.setAttribute("aria-label", T("rb.tag"));
    rb.innerHTML = `
      <div class="rb__stage" data-theme="menu">
      <div class="rb__bg" aria-hidden="true">
        <i class="rb__dots"></i><i class="rb__slab"></i>
        <i class="rb__band rb__band--thin"></i><i class="rb__band"></i>
      </div>
      <p class="rb__tag">${T("rb.tag")}</p>
      <div class="rb__fig" aria-hidden="true">
        <i class="rb__fig-burst"></i>
        <svg viewBox="0 0 400 780"></svg>
        <img alt="" hidden>
      </div>
      <div class="rb__name" aria-hidden="true"><span>Julián</span><span>Barreno</span></div>
      <div class="rb__cursor" aria-hidden="true"><i></i><i></i><i></i></div>
      <ul class="rb__menu" role="menu">
        ${MENU.map((m, i) => `<li role="none"><button class="rb__item" role="menuitem" data-i="${i}"
            style="--rot:${ROT[i]}deg;--off:${OFF[i]}px"><span class="rb__label">${T("rb." + m.id)}</span><span class="rb__sub">${T("rb." + m.id + ".sub")}</span></button></li>`).join("")}
      </ul>
      <div class="rb__hints" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd><b data-k="rb.hint.pick">${T("rb.hint.pick")}</b></span><span><kbd>Enter</kbd><b data-k="rb.hint.open">${T("rb.hint.open")}</b></span><span><kbd>Esc</kbd><b data-k="rb.hint.back">${T("rb.hint.back")}</b></span><span><kbd>L</kbd><b data-k="rb.hint.lang">${T("rb.hint.lang")}</b></span>
      </div>
      <section class="rb__screen" hidden>
        <h2 class="rb__title"></h2>
        <button class="rb__close" type="button">${T("rb.close")}</button>
        <div class="rb__body" tabindex="-1"></div>
      </section>
      </div>
      <div class="rb__lang lang-switch" role="group" aria-label="${T("lang.label")}">
        <button type="button" data-set-lang="es" aria-pressed="${window.i18n?.lang === "es"}">ES</button>
        <button type="button" data-set-lang="en" aria-pressed="${window.i18n?.lang === "en"}">EN</button>
      </div>
      <div class="rb__slash" aria-hidden="true" hidden></div>
      <div class="rb__bullet" aria-hidden="true"></div>`;
    document.body.appendChild(rb);
    items = $$(".rb__item", rb);
    cursor = $(".rb__cursor", rb);
    screen = $(".rb__screen", rb);
    stage = $(".rb__stage", rb);
    figEl = $(".rb__fig", rb); figSvg = $("svg", figEl); figImg = $("img", figEl); figBurst = $(".rb__fig-burst", rb);
    drawFig(pose);

    // si existen fotos recortadas, sustituyen al muñeco
    Object.entries(FOTOS).forEach(([id, src]) => {
      const im = new Image();
      im.onload = () => { figImgs[id] = im.src; if (current === id) setPose(id, true); };
      im.src = src;
    });

    items.forEach((b, i) => {
      b.addEventListener("mouseenter", () => select(i));
      b.addEventListener("focus", () => select(i, true));
      b.addEventListener("click", () => activate(i));
    });
    $(".rb__close", rb).addEventListener("click", closeScreen);
    rb.addEventListener("keydown", onKey);
    addEventListener("resize", () => placeCursor());
    if (window.i18n) window.i18n.onChange(relabel);
  }

  /* ---------------- Cambio de idioma en directo ---------------- */
  function relabel() {
    if (!rb) return;
    rb.setAttribute("aria-label", T("rb.tag"));
    $(".rb__tag", rb).textContent = T("rb.tag");
    $(".rb__lang", rb).setAttribute("aria-label", T("lang.label"));
    items.forEach((b, i) => {
      $(".rb__label", b).textContent = T("rb." + MENU[i].id);
      $(".rb__sub", b).textContent = T("rb." + MENU[i].id + ".sub");
    });
    $$(".rb__hints [data-k]", rb).forEach((el) => (el.textContent = T(el.dataset.k)));
    $(".rb__close", rb).textContent = T("rb.close");
    content = readContent();
    if (current !== "menu") {
      $(".rb__title", screen).textContent = T("rb." + current);
      const body = $(".rb__body", screen), top = body.scrollTop;
      body.innerHTML = screenHTML(current, content);
      body.scrollTop = top;
    }
    if (rb.hidden) return;
    play("move");
    if (!reduce) {
      // pequeño tirón de pantalla para que se note el cambio
      stage.animate([{ transform: "none" }, { transform: "skewX(-6deg) translateX(-14px)" }, { transform: "skewX(4deg) translateX(8px)" }, { transform: "none" }],
        { duration: 260, easing: "ease-out" });
      const targets = current === "menu" ? $$(".rb__label", rb) : [$(".rb__title", screen), ...$$(".rb-x", screen)];
      targets.forEach((el, k) => el.animate([{ opacity: 0, translate: "0 -14px" }, { opacity: 1, translate: "0 0" }],
        { duration: 220, delay: k * 25, easing: "ease-out", fill: "backwards" }));
    }
    requestAnimationFrame(placeCursor); setTimeout(placeCursor, 260);
  }

  function placeCursor() {
    if (!rb || rb.hidden || current !== "menu") return;
    const b = items[sel].querySelector(".rb__label").getBoundingClientRect();
    const padX = 26, padY = 10;
    cursor.style.width = b.width + padX * 2 + "px";
    cursor.style.height = b.height + padY * 2 + "px";
    cursor.style.transform = `translate(${b.left - padX}px, ${b.top - padY}px) rotate(${ROT[sel] - 3}deg)`;
  }

  function select(i, fromFocus, force) {
    if (busy && !fromFocus && !force) return;
    if (i === sel && items[i].classList.contains("is-on")) return;
    items.forEach((b, j) => b.classList.toggle("is-on", j === i));
    if (i !== sel) play("move");
    sel = i;
    if (!fromFocus) items[i].focus({ preventScroll: true });
    placeCursor(); setTimeout(placeCursor, 190);
  }

  function onKey(e) {
    if (busy) return;
    if ((e.key === "l" || e.key === "L") && !e.ctrlKey && !e.metaKey && !e.altKey && window.i18n) { e.preventDefault(); window.i18n.toggle(); return; }
    const open = current !== "menu";
    if (e.key === "Escape") { e.preventDefault(); open ? closeScreen() : exitMode(); return; }
    if (open) return;
    if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); select((sel + 1) % items.length); }
    if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); select((sel - 1 + items.length) % items.length); }
  }

  /* ---------------- Transiciones entre pantallas ----------------
     Cada apartado tiene la suya. Se hace una copia de la pantalla vieja,
     se cambia la de verdad por debajo y las dos se mueven como si la
     cámara saltara de sitio, con franjas de color cruzando por el medio.
     El muñeco va dentro de la pantalla, así que viaja con ella. */
  const KIND = { about: "slide", stack: "drop", projects: "spin", games: "zoom", contact: "shutter" };
  const SNAP = "cubic-bezier(.2,1.35,.4,1)", IN = "cubic-bezier(.6,0,.9,.5)";
  const RED = "#e8112d", BLUE = "#1257ff", GREEN = "#1fd35c", YELLOW = "#ffd60a", FUCHSIA = "#e4007c", BLK = "#000", WHT = "#fff";
  // color que cruza la pantalla en la transición hacia cada apartado
  const TINT = { menu: RED, about: BLUE, stack: GREEN, projects: [YELLOW, FUCHSIA], games: GREEN, contact: RED };

  async function transition(kind, d, tintIn, swap) {
    if (reduce) { swap(); return; }
    const [tint, tint2] = [].concat(tintIn, WHT); // color principal y segundo color de las franjas
    const fr = figEl.getBoundingClientRect();
    const figOrigin = `${fr.left + fr.width / 2}px ${fr.top + fr.height * 0.4}px`;
    const ghost = stage.cloneNode(true);
    ghost.classList.add("rb__ghost"); ghost.setAttribute("aria-hidden", "true"); ghost.inert = true;
    rb.appendChild(ghost);
    swap();

    const extras = [], jobs = [];
    const A = (el, kf, opt) => { const a = el.animate(kf, { fill: "both", ...opt }); jobs.push(a.finished); return a; };
    const panel = (color) => { const p = document.createElement("i"); p.className = "rb__flash"; p.style.background = color; rb.appendChild(p); extras.push(p); return p; };
    const figLag = (x, y, delay) => A(figEl, [{ translate: `${x} ${y}` }, { translate: "0 0" }], { duration: 460, delay, easing: SNAP });

    switch (kind) {
      case "slide": { // la cámara se desliza de lado
        A(ghost, [{ transform: "none" }, { transform: `translateX(${-118 * d}%) rotate(${-8 * d}deg)` }], { duration: 380, easing: IN });
        [tint2, tint, BLK].forEach((c, k) => A(panel(c),
          [{ transform: `translateX(${125 * d}%) skewX(${-14 * d}deg)` }, { transform: `translateX(${-135 * d}%) skewX(${-14 * d}deg)` }],
          { duration: 520, delay: 70 + k * 100, easing: "linear" }));
        A(stage, [{ transform: `translateX(${118 * d}%) rotate(${8 * d}deg)` }, { transform: "none" }], { duration: 480, delay: 320, easing: SNAP });
        figLag(`${45 * d}vw`, "0", 360);
        break;
      }
      case "drop": { // la pantalla vieja se cae y la nueva cae desde arriba
        A(ghost, [{ transform: "none" }, { transform: `translateY(${125 * d}%) rotate(${10 * d}deg)` }], { duration: 400, easing: IN });
        [BLK, tint, tint2].forEach((c, k) => A(panel(c),
          [{ transform: `translateY(${-130 * d}%) skewY(7deg)` }, { transform: `translateY(${140 * d}%) skewY(7deg)` }],
          { duration: 520, delay: 80 + k * 100, easing: "linear" }));
        A(stage, [{ transform: `translateY(${-118 * d}%) rotate(${-6 * d}deg)` }, { transform: "none" }], { duration: 520, delay: 330, easing: "cubic-bezier(.3,1.5,.5,1)" });
        figLag("0", `${-50 * d}vh`, 380);
        break;
      }
      case "spin": { // todo gira desde una esquina, como una puerta
        const origin = d > 0 ? "0% 100%" : "100% 100%";
        ghost.style.transformOrigin = stage.style.transformOrigin = origin;
        A(ghost, [{ transform: "none" }, { transform: `rotate(${-115 * d}deg)` }], { duration: 420, easing: IN });
        [tint2, tint, BLK].forEach((c, k) => {
          const p = panel(c); p.style.transformOrigin = origin;
          A(p, [{ transform: `rotate(${115 * d}deg)` }, { transform: `rotate(${-115 * d}deg)` }], { duration: 560, delay: 80 + k * 100, easing: "linear" });
        });
        A(stage, [{ transform: `rotate(${115 * d}deg)` }, { transform: "none" }], { duration: 520, delay: 330, easing: SNAP });
        figLag(`${20 * d}vw`, "-20vh", 400);
        break;
      }
      case "zoom": { // la cámara se mete en el muñeco y sale por el otro lado
        ghost.style.transformOrigin = stage.style.transformOrigin = figOrigin;
        const big = `scale(7) rotate(${24 * d}deg)`, small = `scale(.12) rotate(${-28 * d}deg)`;
        A(ghost, [{ transform: "none", opacity: 1 }, { transform: d > 0 ? big : small, opacity: 1, offset: 0.85 }, { transform: d > 0 ? big : small, opacity: 0 }], { duration: 440, easing: IN });
        A(panel(tint2), [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 420, delay: 240 });
        A(panel(tint), [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 300, delay: 380 });
        A(stage, [{ transform: d > 0 ? small : big }, { transform: "none" }], { duration: 520, delay: 400, easing: SNAP });
        figLag("0", "30vh", 460);
        break;
      }
      case "shutter": { // franjas de colores cierran y abren la pantalla
        const box = document.createElement("div"); box.className = "rb__strips"; rb.appendChild(box); extras.push(box);
        const cols = [tint2, BLK, tint, BLK, tint2, tint, BLK];
        cols.forEach((c, k) => {
          const s = document.createElement("i"); s.style.background = c; box.appendChild(s);
          const side = (k % 2 ? 1 : -1) * d;
          A(s, [{ transform: `translateX(${110 * side}%)` }, { transform: "none", offset: 0.3 }, { transform: "none", offset: 0.72 }, { transform: `translateX(${-110 * side}%)` }],
            { duration: 760, delay: k * 35, easing: "cubic-bezier(.6,0,.4,1)" });
        });
        A(ghost, [{ transform: "none", opacity: 1 }, { transform: `translateY(${-8 * d}%) scale(1.08)`, opacity: 1, offset: 0.99 }, { transform: "none", opacity: 0 }], { duration: 480 });
        A(stage, [{ transform: `translateY(${14 * d}%) scale(1.1)` }, { transform: "none" }], { duration: 480, delay: 480, easing: SNAP });
        figLag(`${-30 * d}vw`, "0", 520);
        break;
      }
    }
    await Promise.all(jobs);
    ghost.remove(); extras.forEach((e) => e.remove());
    stage.getAnimations().forEach((a) => a.cancel());
    figEl.getAnimations().forEach((a) => a.id !== "burst" && a.cancel());
    stage.style.transformOrigin = "";
  }

  async function activate(i) {
    if (busy) return;
    const m = MENU[i];
    if (m.id === "exit") return exitMode();
    if (m.id === "cv") {
      play("ok");
      const a = document.createElement("a"); a.href = content.cv; a.download = ""; a.click();
      return;
    }
    busy = true;
    play("ok");
    setTimeout(() => setPose(m.id), 460);
    await transition(KIND[m.id], 1, TINT[m.id], () => {
      current = m.id;
      stage.dataset.theme = m.id; stage.classList.add("is-screen");
      $(".rb__title", screen).textContent = T("rb." + m.id);
      $(".rb__body", screen).innerHTML = screenHTML(m.id, content);
      $(".rb__body", screen).scrollTop = 0;
      screen.hidden = false;
      if (reduce) return;
      // el contenido entra cuando la pantalla nueva ya está llegando
      const t = 620;
      $(".rb__title", screen).animate(
        [{ transform: "rotate(-30deg) skewX(-8deg) scale(2)", opacity: 0 }, { transform: "rotate(-8deg) skewX(-8deg)", opacity: 1 }],
        { duration: 340, delay: t, easing: "cubic-bezier(.2,1.5,.4,1)", fill: "backwards" });
      $(".rb__close", screen).animate([{ transform: "translateX(240px) skewX(-12deg)" }, { transform: "skewX(-12deg) rotate(2deg)" }],
        { duration: 300, delay: t + 120, easing: SNAP, fill: "backwards" });
      $$(".rb-x", screen).forEach((el, k) => el.animate(
        [{ translate: "90px 0", opacity: 0, rotate: "6deg" }, { translate: "0 0", opacity: 1, rotate: "0deg" }],
        { duration: 300, delay: t + 60 + k * 55, easing: SNAP, fill: "backwards" }));
    });
    $(".rb__close", screen).focus({ preventScroll: true });
    busy = false;
  }

  async function closeScreen() {
    if (busy || current === "menu") return;
    busy = true;
    play("back");
    const kind = KIND[current];
    setTimeout(() => setPose("menu"), 460);
    await transition(kind, -1, TINT.menu, () => {
      current = "menu";
      stage.dataset.theme = "menu"; stage.classList.remove("is-screen");
      screen.hidden = true;
      cursor.style.opacity = "0";
      if (reduce) return;
      items.forEach((b, k) => b.animate([
        { transform: `rotate(${ROT[k] + 20}deg) translateX(70vw) skewX(-30deg)` },
        { transform: `rotate(${ROT[k]}deg) translateX(${OFF[k]}px) skewX(-8deg)` },
      ], { duration: 300, delay: 560 + k * 45, easing: SNAP, fill: "backwards" }));
    });
    if (!reduce) await wait(260);
    items.forEach((b, j) => b.classList.toggle("is-on", j === sel));
    items[sel].focus({ preventScroll: true });
    cursor.style.opacity = "";
    placeCursor(); setTimeout(placeCursor, 200);
    busy = false;
  }

  /* ---------------- 1-3: Mira, disparo y cristal roto ---------------- */
  async function shootGlass() {
    const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    const cx = W * 0.5 + rand(-W * 0.06, W * 0.06), cy = H * 0.46 + rand(-H * 0.05, H * 0.05);
    const shot = document.createElement("div");
    shot.className = "shot";
    shot.innerHTML = `<canvas></canvas><div class="shot__scope"></div><div class="shot__flash"></div>`;
    document.body.appendChild(shot);
    const cv = $("canvas", shot), ctx = cv.getContext("2d");
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    const scope = $(".shot__scope", shot), flash = $(".shot__flash", shot);

    // 1. la mira se cierra sobre el punto de impacto
    scope.style.left = cx + "px"; scope.style.top = cy + "px";
    await scope.animate([
      { transform: `translate(${(W * .3)}px, ${-H * .2}px) scale(2.4)`, opacity: 0 },
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: .7 },
      { transform: "scale(.9)", opacity: 1 },
    ], { duration: 650, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" }).finished;
    await wait(120);

    // 2. ¡disparo!
    play("shot"); play("glass");
    scope.remove();
    flash.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 160 });
    $$("body > header, body > main").forEach((el) => el.animate([
      { transform: "translate(0,0)" }, { transform: "translate(-12px,8px)" }, { transform: "translate(10px,-6px)" },
      { transform: "translate(-6px,4px)" }, { transform: "translate(0,0)" },
    ], { duration: 260 }));

    // geometría de las grietas: rayos desde el impacto y anillos
    const R = Math.hypot(W, H);
    const rings = [14, 40, 85, 150, 240, 370, 540, 780, R * 1.1];
    const N = 15, angles = [];
    for (let i = 0; i < N; i++) angles.push((i / N) * Math.PI * 2 + rand(-0.12, 0.12));
    const P = angles.map((a) => rings.map((r, k) => {
      const aa = a + rand(-0.05, 0.05) * (k > 0 ? 1 : 0), rr = r * rand(0.85, 1.15);
      return [cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr];
    }));
    const ringLinks = angles.map(() => rings.map(() => Math.random() < 0.55));

    const drawCracks = (upto) => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const pass of [{ w: 3.2, c: "rgba(0,0,0,.45)" }, { w: 1.3, c: "rgba(255,255,255,.95)" }]) {
        ctx.strokeStyle = pass.c; ctx.lineWidth = pass.w; ctx.beginPath();
        P.forEach((ray, i) => {
          ctx.moveTo(cx, cy);
          for (let k = 0; k < rings.length && k <= upto; k++) {
            const t = Math.min(1, upto - k + 1);
            const [px, py] = k === 0 ? [cx, cy] : ray[k - 1];
            ctx.lineTo(px + (ray[k][0] - px) * t, py + (ray[k][1] - py) * t);
          }
          for (let k = 1; k < Math.min(rings.length - 1, Math.floor(upto)); k++) {
            if (!ringLinks[i][k]) continue;
            const nx = P[(i + 1) % N][k];
            ctx.moveTo(ray[k][0], ray[k][1]); ctx.lineTo(nx[0], nx[1]);
          }
        });
        ctx.stroke();
      }
      // agujero de bala
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.stroke();
    };

    const t0 = performance.now(), crackDur = 260;
    await new Promise((res) => {
      const step = (now) => {
        const p = Math.min(1, (now - t0) / crackDur);
        drawCracks(p * rings.length);
        p < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    await wait(520);

    // 3. el cristal estalla: cada celda es un trozo que sale volando
    const shards = [];
    for (let i = 0; i < N; i++) for (let k = 0; k < rings.length - 1; k++) {
      const a = k === 0 ? [cx, cy] : P[i][k - 1], b = P[i][k], c2 = P[(i + 1) % N][k], d = k === 0 ? [cx, cy] : P[(i + 1) % N][k - 1];
      const pts = [a, b, c2, d];
      const mx = pts.reduce((s, p) => s + p[0], 0) / 4, my = pts.reduce((s, p) => s + p[1], 0) / 4;
      const dist = Math.hypot(mx - cx, my - cy), dir = Math.atan2(my - cy, mx - cx);
      shards.push({
        pts: pts.map(([x, y]) => [x - mx, y - my]), x: mx, y: my,
        vx: Math.cos(dir) * rand(2, 9) * (1 + 300 / (dist + 80)), vy: Math.sin(dir) * rand(2, 8) - rand(2, 6),
        rot: 0, vr: rand(-0.12, 0.12), s: 1, vs: rand(0.004, 0.02) * (dist < 250 ? 3 : 1),
        delay: dist * 0.35, a: 1, tint: Math.random(),
      });
    }
    openMode();               // el menú ya está debajo del cristal
    flash.animate([{ opacity: 0.7 }, { opacity: 0 }], { duration: 120 });

    shot.style.pointerEvents = "none";
    shot.style.cursor = "";
    const t1 = performance.now();
    let last = t1;
    // los trozos siguen cayendo mientras la bala entra en el menú
    new Promise((res) => {
      const step = (now) => {
        const el = now - t1, f = Math.min(3, (now - last) / 16.7);
        last = now;
        ctx.clearRect(0, 0, W, H);
        let alive = 0;
        for (const s of shards) {
          if (el > s.delay) { s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.55 * f; s.rot += s.vr * f; s.s += s.vs * f; s.a = Math.max(0, s.a - 0.022 * f); }
          if (s.a <= 0 || s.y > H + 300) continue;
          alive++;
          ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(s.s, s.s); ctx.globalAlpha = s.a;
          ctx.beginPath(); s.pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
          const g = ctx.createLinearGradient(-40, -40, 40, 40);
          g.addColorStop(0, "rgba(255,255,255,.55)");
          g.addColorStop(0.5, s.tint < 0.33 ? "rgba(47,91,255,.35)" : s.tint < 0.66 ? "rgba(255,42,61,.3)" : "rgba(20,20,28,.85)");
          g.addColorStop(1, "rgba(0,0,0,.75)");
          ctx.fillStyle = g; ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.2 / s.s; ctx.stroke();
          ctx.restore();
        }
        alive && el < 1800 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    }).then(() => shot.remove());
    await wait(450);
  }

  /* ---------------- 4: La bala atraviesa el menú nuevo ---------------- */
  async function bulletThrough() {
    const W = innerWidth, H = innerHeight;
    const bullet = $(".rb__bullet", rb), slash = $(".rb__slash", rb);
    const ang = -14; // misma inclinación que las bandas del fondo
    const y0 = H * 0.62, y1 = H * 0.62 + Math.tan(ang * Math.PI / 180) * W * 1.4;
    bullet.style.opacity = "1";
    play("shot");
    const fly = bullet.animate([
      { transform: `translate(-200px, ${y0}px) rotate(${ang}deg)` },
      { transform: `translate(${W * 1.2}px, ${y1}px) rotate(${ang}deg)` },
    ], { duration: 260, easing: "linear", fill: "forwards" });
    slash.hidden = false;
    slash.style.top = y0 + "px";
    slash.animate([
      { transform: `rotate(${ang}deg) scaleX(0)`, opacity: 1 },
      { transform: `rotate(${ang}deg) scaleX(1)`, opacity: 1, offset: .5 },
      { transform: `rotate(${ang}deg) scaleX(1) scaleY(.1)`, opacity: 0 },
    ], { duration: 520, easing: "ease-out", fill: "forwards" }).onfinish = () => (slash.hidden = true);
    await fly.finished;
    bullet.style.opacity = "0";
  }


  /* ---------------- Entrada y salida del modo ---------------- */
  const INTRO = ".rb__item, .rb__name, .rb__tag, .rb__band, .rb__hints, .rb__cursor, .rb__fig, .rb__lang";
  function openMode() {
    if (!rb) build();
    content = readContent();
    current = "menu"; stage.dataset.theme = "menu"; stage.classList.remove("is-screen");
    screen.hidden = true;
    rb.hidden = false;
    document.body.classList.add("rb-open");
    btn.setAttribute("aria-expanded", "true");
    setPose("menu", true);
    // todo se esconde hasta que pasa la bala
    if (!reduce) $$(INTRO, rb).forEach((el) => (el.style.opacity = "0"));
  }

  async function revealMenu() {
    const show = (el) => (el.style.opacity = "");
    sel = 0; items.forEach((b) => b.classList.remove("is-on"));
    if (reduce) { $$(INTRO, rb).forEach(show); select(0, false, true); return; }
    await bulletThrough();
    $$(".rb__band", rb).forEach((el, k) => {
      show(el);
      el.animate([{ transform: "rotate(-14deg) scaleY(0)" }, { transform: k ? "rotate(-14deg)" : "rotate(-14deg) translateY(-14px)" }],
        { duration: 260, easing: "cubic-bezier(.2,1.4,.4,1)" });
    });
    show(figEl);
    figEl.animate([{ transform: "translate(-50vw, 20vh) rotate(-40deg)" }, { transform: "rotate(-5deg)" }],
      { duration: 460, delay: 40, easing: "cubic-bezier(.2,1.3,.3,1)", fill: "backwards" });
    const name = $(".rb__name", rb); show(name);
    name.animate([{ transform: "rotate(-14deg) skewX(-10deg) translateX(-60vw)" }, { transform: "rotate(-14deg) skewX(-10deg)" }],
      { duration: 420, delay: 140, easing: "cubic-bezier(.2,1.2,.3,1)", fill: "backwards" });
    const tag = $(".rb__tag", rb); show(tag);
    tag.animate([{ transform: "rotate(-40deg) scale(3)", opacity: 0 }, { transform: "rotate(-6deg)", opacity: 1 }],
      { duration: 300, delay: 160, easing: "cubic-bezier(.2,1.5,.4,1)", fill: "backwards" });
    items.forEach((b, i) => {
      show(b);
      b.animate([
        { transform: `rotate(${ROT[i] + 20}deg) translateX(70vw) skewX(-30deg)` },
        { transform: `rotate(${ROT[i]}deg) translateX(${OFF[i]}px) skewX(-8deg)` },
      ], { duration: 320, delay: 120 + i * 55, easing: "cubic-bezier(.2,1.3,.4,1)", fill: "backwards" });
    });
    await wait(120 + items.length * 55 + 320);
    show($(".rb__hints", rb)); show(cursor); show($(".rb__lang", rb));
    select(0, false, true);
  }

  async function enterMode() {
    if (busy) return; busy = true;
    try {
      if (reduce) openMode(); else await shootGlass();
      await revealMenu();
    } finally { busy = false; }
  }

  async function exitMode() {
    if (busy) return; busy = true;
    play("back");
    const finish = () => {
      rb.hidden = true; document.body.classList.remove("rb-open");
      btn.setAttribute("aria-expanded", "false"); btn.focus({ preventScroll: true });
    };
    if (reduce) { finish(); busy = false; return; }
    const wipe = document.createElement("div");
    wipe.className = "rb-wipe"; wipe.innerHTML = "<i></i><i></i><i></i>";
    document.body.appendChild(wipe);
    const bars = $$("i", wipe);
    await Promise.all(bars.map((b, k) => b.animate(
      [{ transform: `rotate(-14deg) translateX(${k % 2 ? "" : "-"}120%)` }, { transform: "rotate(-14deg) translateX(0)" }],
      { duration: 260, delay: k * 50, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" }).finished));
    finish();
    await Promise.all(bars.map((b, k) => b.animate(
      [{ transform: "rotate(-14deg) translateX(0)" }, { transform: `rotate(-14deg) translateX(${k % 2 ? "-" : ""}120%)` }],
      { duration: 280, delay: k * 50, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" }).finished));
    wipe.remove();
    busy = false;
  }

  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", enterMode);
})();
