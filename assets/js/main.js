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

    if (["home", "obras", "categorias", "categoria"].includes(page)) {
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
}
