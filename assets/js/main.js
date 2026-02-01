document.addEventListener("DOMContentLoaded", async () => {
  // Página actual definida en <body data-page="...">
  const page = document.body.dataset.page;

  /* ===========================
     LAYOUT (HEADER + FOOTER)
     =========================== */

  // Cargar layout solo si NO es login ni register
  if (page !== "login" && page !== "register") {
    await loadLayout();

    // Renderiza usuario en header si existe la función
    if (typeof renderHeaderUser === "function") {
      renderHeaderUser();
    }

    // Aplica rol de usuario si existe la función
    if (typeof applyUserRole === "function") {
      applyUserRole();
    }
  }

  /* ===========================
     ROUTING DE PÁGINAS
     =========================== */

  if (typeof initPages === "function") {
    // Pasamos también la sección por URL (si existe)
    const seccion = getParam("seccion");

    if (
      ["home", "obras", "categorias", "categoria", "artistas", "obra", "artista", "perfil-artista", "perfil-usuario", "moderno", "clasico", "abstracto"].includes(page)
    ) {
      // 🔑 CONTROL DE ACCESO PARA INVITADOS
      const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
      const guestWhitelist = ["home", "moderno", "clasico", "abstracto", "login", "register"];
      
      if (!user && !guestWhitelist.includes(page)) {
        console.warn("Acceso restringido. Redirigiendo a login...");
        const base = getBasePath();
        window.location.href = `${base}/pages/login.html`;
        return;
      }

      initPages(page, seccion);
    }
  }

  /* ===========================
     AUTH
     =========================== */

  if (typeof initAuth === "function") {
    if (page === "login" || page === "register") {
      initAuth(page);
    }
  }
});

/* ===========================
   BASE PATH
=========================== */

function getBasePath() {
  // Si estamos dentro de /pages/, subimos un nivel
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

/* ===========================
   LAYOUT
=========================== */

async function loadLayout() {
  const base = getBasePath();

  // getCurrentUser puede no existir aún
  let user = null;
  if (typeof getCurrentUser === "function") {
    user = getCurrentUser();
  }

  // Header según estado de sesión
  const headerFile = user ? "header.html" : "header_sesion.html";

  // Carga de header y footer
  const header = await fetch(`${base}/partials/${headerFile}`).then(r => r.text());
  const footer = await fetch(`${base}/partials/footer.html`).then(r => r.text());

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  // 🔑 NORMALIZACIÓN DE RUTAS EN PARTIALS
  document.querySelectorAll("header a, footer a").forEach(link => {
    let href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      // Limpiamos ./ y ../ iniciales
      const cleanHref = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
      
      // Lista de archivos que sabemos que están en /pages/ (incluso si no lo dicen en el href)
      const pagesFiles = [
        "artistas.html", "obras.html", "categorias.html", "login.html", 
        "obra-detalle.html", "artista-detalle.html", "categoria-detalle.html",
        "perfil-artista.html", "perfil-usuario.html",
        "moderno.html", "clasico.html", "abstracto.html"
      ];

      const isKnownPage = pagesFiles.some(p => cleanHref.startsWith(p));
      const isPagesDir = cleanHref.includes("pages/");

      if (isKnownPage || isPagesDir) {
        // Aseguramos que tenga el prefijo pages/ si no lo tiene
        const finalPath = isPagesDir ? cleanHref : `pages/${cleanHref}`;
        link.href = `${base}/${finalPath}`;
        console.log(`[Route] Resolved Page: ${href} -> ${link.href}`);
      } else if (cleanHref.includes("assets/")) {
        link.href = `${base}/${cleanHref}`;
      } else if (cleanHref === "index.html" || cleanHref === "" || cleanHref === "./") {
        link.href = `${base}/index.html`;
        console.log(`[Route] Resolved Home: ${href} -> ${link.href}`);
      }
    }
  });

  // 🔑 CLAVE: esperar a que el DOM realmente exista
  requestAnimationFrame(() => {
    if (typeof renderHeaderUser === "function") {
      renderHeaderUser();
    }

    if (typeof applyUserRole === "function") {
      applyUserRole();
    }

    // Si tienes menú desplegable por JS
    if (typeof initHeaderMenu === "function") {
      initHeaderMenu();
    }
  });
}