document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;

  /* ===========================
     LAYOUT (HEADER + FOOTER)
     =========================== */

  // Header y footer SOLO si NO es login ni register
  if (page !== "login" && page !== "register") {
    await loadLayout();

    // Estas funciones SOLO se llaman si existen
    if (typeof renderHeaderUser === "function") {
      renderHeaderUser();
    }

    if (typeof applyUserRole === "function") {
      applyUserRole();
    }
  }

  /* ===========================
     ROUTING DE PÁGINAS
     =========================== */

  if (typeof initPages === "function") {
    if (["home", "obras", "categorias", "categoria"].includes(page)) {
      initPages(page);
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
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

/* ===========================
   LAYOUT
=========================== */

async function loadLayout() {
  const base = getBasePath();

  // ⚠️ getCurrentUser puede NO existir todavía
  let user = null;
  if (typeof getCurrentUser === "function") {
    user = getCurrentUser();
  }

  const headerFile = user ? "header.html" : "header_sesion.html";

  const header = await fetch(`${base}/partials/${headerFile}`).then(r => r.text());
  const footer = await fetch(`${base}/partials/footer.html`).then(r => r.text());

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
}
