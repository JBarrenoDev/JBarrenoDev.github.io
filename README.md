# Web personal de Julián Barreno

Mi web personal y portafolio: quién soy, con qué trabajo, mis proyectos, mis juegos de Roblox y mi CV para descargar. Está en español y en inglés.

Tiene además un **modo rebelde**: un botón que dispara contra la pantalla, rompe el cristal y abre la web en formato de menú de videojuego, con una transición distinta para cada apartado.

## Cómo verla

No necesita instalar nada. Descarga el repositorio y abre `index.html` en el navegador. Necesitas conexión a internet para que carguen las tipografías.

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Todo el contenido de la web. Los textos en español se editan aquí. |
| `styles.css` | Estilos de la web normal. |
| `main.js` | Animación de la portada y menú que marca la sección visible. |
| `i18n.js` | Textos en inglés y botón de idioma. El idioma elegido se guarda en el navegador. |
| `rebel.css`, `rebel.js` | El modo rebelde: disparo, cristal roto, menú, transiciones y muñeco. |
| `assets/cv/` | CV en PDF, en español e inglés. |

## Cambiar contenido

- **Un texto**: cámbialo en `index.html`. Si el texto lleva `data-i18n="clave"`, cambia también su versión en inglés en `i18n.js`. El modo rebelde coge los textos de la web normal, así que no hay que tocarlo.
- **Un juego de Roblox**: en la sección `#juegos` de `index.html`, cambia el nombre, la descripción y el enlace del botón, y pon un vídeo en `assets/juegos/` con `<video src="assets/juegos/juego1.mp4" autoplay muted loop playsinline></video>`.
- **Tus fotos en el modo rebelde**: guarda un PNG recortado por pose en `assets/rebelde/` y apúntalo en el objeto `FOTOS` de `rebel.js`.

## Hecha con

HTML, CSS y JavaScript, sin frameworks.
