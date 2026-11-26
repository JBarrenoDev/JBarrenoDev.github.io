/* =========================================================
   IDIOMA (español / inglés)
   - En index.html, cada texto traducible lleva data-i18n="clave"
     (o data-i18n-html si lleva etiquetas dentro).
   - El español se lee del propio HTML; aquí solo está el inglés.
   - La elección se guarda en el navegador y se usa al volver.
   - El modo rebelde usa window.i18n.t() y se entera de los cambios
     con window.i18n.onChange().
   ========================================================= */
(() => {
  const EN = {
    // ---- general ----
    "meta.title": "Julián Barreno · Web developer",
    "meta.desc": "Julián Barreno López, junior web developer from Antequera, Spain. Java, JavaScript, PHP and React. I also make Roblox games.",
    "skip": "Skip to content",
    "nav.home": "Home",
    "nav.main": "Main",
    "nav.about": "About",
    "nav.stack": "Stack",
    "nav.projects": "Projects",
    "nav.games": "Games",
    "nav.contact": "Contact",
    "nav.cv": "Download CV",
    "rebel.btn": "Rebel mode",
    "lang.label": "Language",

    // ---- portada ----
    "hero.status": "Looking for an internship or my first developer job",
    "hero.lead": "Junior web developer. I’m finishing a Higher Diploma in Web Development in Antequera, Spain. I code in Java, JavaScript and PHP, and in my free time I build games in Roblox.",
    "hero.cvMain": "Download CV in English",
    "hero.cvAlt": "Descargar CV en español",

    // ---- sobre mí ----
    "about.title": "About me",
    "about.big": "I like building things people actually use, from the database to the very last button.",
    "about.p1": "I’m finishing the Higher Technician Diploma in Web Application Development at IES Pedro Espinosa. I work with Java, JavaScript and PHP, use Git every day, and in class we work as a team with Scrum.",
    "about.p2": "I combine my studies with a customer-facing job, which has taught me to stay organised and to communicate clearly. <span class=\"todo\">[Add something of your own: what hooks you on coding, what you’re looking for, what you enjoy away from the computer.]</span>",
    "about.timeline": "Timeline",
    "tl.1.when": "Now",
    "tl.1.what": "Higher Diploma in Web Development",
    "tl.1.where": "IES Pedro Espinosa, Antequera",
    "tl.2.when": "Since May 2025",
    "tl.2.what": "Delivery driver at Telepizza",
    "tl.2.where": "Customer service and supporting the team at peak hours",
    "tl.3.when": "March 2025",
    "tl.3.what": "Internship at GrupoDabo Consulting",
    "tl.3.where": "Maintaining the corporate website and the course platform, 105 hours",

    // ---- stack ----
    "stack.title": "What I work with",
    "lvl.mid": "Intermediate",
    "lvl.daily": "I use it every day",
    "lvl.basic": "Basic",
    "lvl.luau": "Which level?",
    "tech.git": "Git and GitHub",
    "tech.luau": "Luau, for Roblox",
    "stack.extra": "Also: English B2, teamwork with Scrum and direct customer contact.",

    // ---- proyectos ----
    "projects.title": "Projects",
    "projects.lead": "What I’ve built during my studies. The code is on my GitHub.",
    "project.name": "Project name",
    "project.desc": "What problem it solves and which part you built.",

    // ---- juegos ----
    "games.title": "My Roblox games",
    "games.lead": "I made these myself in Roblox Studio. Watch a clip and, if you like it, jump in and play.",
    "game.video": "A short clip of the game goes here",
    "game.name": "Game name",
    "game.desc": "What it is, what makes it fun and what you programmed.",
    "game.tags": "<span class=\"todo\">Genre</span>, made with Luau",
    "game.play": "Play on Roblox",

    // ---- contacto ----
    "contact.title": "Let’s talk",
    "contact.lead": "If you have a job, an internship or a project, write to me and I’ll get back to you quickly.",
    "contact.github": "See my GitHub",
    "contact.linkedin": "See my LinkedIn",
    "contact.cv": "Download CV",

    // ---- pie ----
    "footer.made": "Handmade with HTML, CSS and JavaScript",

    // ---- modo rebelde ----
    "rb.tag": "Rebel mode",
    "rb.about": "About me", "rb.about.sub": "Who I am",
    "rb.stack": "Stack", "rb.stack.sub": "My skills",
    "rb.projects": "Projects", "rb.projects.sub": "What I’ve built",
    "rb.games": "Games", "rb.games.sub": "My Roblox games",
    "rb.contact": "Contact", "rb.contact.sub": "Write to me",
    "rb.cv": "My CV", "rb.cv.sub": "Download as PDF",
    "rb.exit": "Back", "rb.exit.sub": "To the normal site",
    "rb.hint.pick": "Choose", "rb.hint.open": "Open", "rb.hint.back": "Back", "rb.hint.lang": "Language",
    "rb.close": "Back to menu",
  };

  // Textos del modo rebelde en español (no están en el HTML)
  const ES_EXTRA = {
    "rb.tag": "Modo rebelde",
    "rb.about": "Sobre mí", "rb.about.sub": "Quién soy",
    "rb.stack": "Stack", "rb.stack.sub": "Mis habilidades",
    "rb.projects": "Proyectos", "rb.projects.sub": "Lo que he construido",
    "rb.games": "Juegos", "rb.games.sub": "Mis juegos de Roblox",
    "rb.contact": "Contacto", "rb.contact.sub": "Escríbeme",
    "rb.cv": "Mi CV", "rb.cv.sub": "Descargar en PDF",
    "rb.exit": "Volver", "rb.exit.sub": "A la web normal",
    "rb.hint.pick": "Elegir", "rb.hint.open": "Abrir", "rb.hint.back": "Volver", "rb.hint.lang": "Idioma",
    "rb.close": "Volver al menú",
  };

  const CV = { es: "assets/cv/CV_Julian_Barreno_Lopez_ES.pdf", en: "assets/cv/CV_Julian_Barreno_Lopez_EN.pdf" };
  const KEY = "jb-lang";
  const ES = { ...ES_EXTRA };
  const listeners = [];

  // Guarda el español original que hay en el HTML
  document.querySelectorAll("[data-i18n]").forEach((el) => (ES[el.dataset.i18n] = el.textContent));
  document.querySelectorAll("[data-i18n-html]").forEach((el) => (ES[el.dataset.i18nHtml] = el.innerHTML));
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => (ES[el.dataset.i18nAria] = el.getAttribute("aria-label")));
  ES["meta.title"] = document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  ES["meta.desc"] = metaDesc?.content || "";

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento, no pasa nada */ } };

  let lang = read();
  if (lang !== "es" && lang !== "en") lang = (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en";

  const t = (k) => (lang === "en" ? EN[k] : ES[k]) ?? ES[k] ?? k;

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.title = t("meta.title");
    if (metaDesc) metaDesc.content = t("meta.desc");
    // enlaces de CV: el principal va al CV del idioma elegido, el alternativo al otro
    const other = lang === "es" ? "en" : "es";
    document.querySelectorAll("[data-cv]").forEach((a) => (a.href = a.dataset.cv === "alt" ? CV[other] : CV[lang]));
    document.querySelectorAll(".lang-switch").forEach((sw) => {
      sw.dataset.lang = lang;
      sw.querySelectorAll("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    });
  }

  function set(next) {
    if (next !== "es" && next !== "en") return;
    if (next === lang) return;
    lang = next; save(lang); apply();
    listeners.forEach((fn) => { try { fn(lang); } catch (e) { console.error(e); } });
  }

  // Cualquier botón con data-set-lang (en la web o en el modo rebelde) cambia el idioma
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-set-lang]");
    if (b) set(b.dataset.setLang);
  });

  window.i18n = {
    get lang() { return lang; },
    t, set,
    toggle: () => set(lang === "es" ? "en" : "es"),
    cv: () => CV[lang],
    onChange: (fn) => listeners.push(fn),
  };

  apply();
})();
