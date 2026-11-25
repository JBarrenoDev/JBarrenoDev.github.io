// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Portada: el rojo y el azul llegan desde los lados y se juntan =====
const hero = document.querySelector(".hero");
const ana = document.querySelector(".ana");

if (!reduceMotion) {
  hero.classList.add("is-loading");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hero.classList.add("is-entering");
    hero.classList.remove("is-loading");
  }));

  // Con el ratón, las capas se separan un poco, como mirar con gafas 3D
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ana.style.setProperty("--dx", `${x * 18}px`);
    ana.style.setProperty("--dy", `${y * 10}px`);
  });
  hero.addEventListener("pointerleave", () => {
    ana.style.setProperty("--dx", "0px");
    ana.style.setProperty("--dy", "0px");
  });
}

// ===== Menú: marca la sección que se está viendo =====
const links = document.querySelectorAll(".nav__links a");
const navObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  }),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main > section[id]").forEach((s) => navObs.observe(s));
