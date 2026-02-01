document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  
  // 🔑 LOGICA DE ACCESO GLOBAL (GUEST CONTROL)
  const guestWhitelist = ["home", "moderno", "clasico", "abstracto", "login", "register"];
  const isWhitelisted = guestWhitelist.includes(page);
  
  console.log(`[Vértice Security] Page: "${page}" | User: ${!!user} | Whitelisted: ${isWhitelisted}`);

  // Si es un acceso directo a una página prohibida
  if (!user && !isWhitelisted) {
    console.warn(`[Vértice Security] Acceso denegado a "${page}". Redirigiendo...`);
    saveIntendedDestination();
    const base = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/').replace(/\/pages$/, '');
    window.location.href = `${base}/pages/login.html`;
    return;
  }

  /* ===========================
     LAYOUT (HEADER + FOOTER)
     =========================== */

  if (page !== "login" && page !== "register") {
    await loadLayout();
    
    // Inyectar Premium Gate Markup (siempre por si acaso)
    injectPremiumGate();

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
    const seccion = getParam("seccion");
    const initWhitelist = ["home", "obras", "categorias", "categoria", "artistas", "obra", "artista", "perfil-artista", "perfil-usuario", "moderno", "clasico", "abstracto"];
    if (initWhitelist.includes(page)) {
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

  // 🖱️ INTERCEPTOR DE CLICKS PARA INVITADOS
  if (!user) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;

      // Determinamos si el destino es una página protegida
      const guestWhitelist = ["home", "moderno", "clasico", "abstracto", "login", "register"];
      const cleanHref = href.split('/').pop().replace('.html', '');
      const isWhitelisted = guestWhitelist.includes(cleanHref);
      
      const isProtected = ["artistas.html", "obras.html", "categorias.html", "perfil"].some(p => href.includes(p));
      
      console.log(`[Interceptor] Destination: ${href} | Protected: ${isProtected} | Whitelisted: ${isWhitelisted}`);

      if (isProtected && !isWhitelisted) {
        e.preventDefault();
        saveIntendedDestination(href);
        showPremiumGate();
      }
    });
  }
});

/* ===========================
   PREMIUM GATE LOGIC
=========================== */

function injectPremiumGate() {
  if (document.getElementById("premium-gate")) return;
  
  const html = `
    <div id="premium-gate" class="premium-gate">
      <div class="premium-gate-content">
        <h2>Experiencia Exclusiva</h2>
        <p>Estás a punto de entrar en la zona curatorial privada. Únete a nuestra comunidad para descubrir obras y artistas exclusivos.</p>
        <div class="gate-actions">
          <a href="login.html?mode=register" class="btn">Crear cuenta privada</a>
          <a href="login.html" class="btn btn-outline">Iniciar sesión</a>
        </div>
        <button class="close-gate" onclick="hidePremiumGate()">Seguir explorando como invitado</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function showPremiumGate() {
  const gate = document.getElementById("premium-gate");
  if (gate) gate.classList.add("active");
}

function hidePremiumGate() {
  const gate = document.getElementById("premium-gate");
  if (gate) gate.classList.remove("active");
}

function saveIntendedDestination(href = window.location.href) {
  localStorage.setItem("intended_destination", href);
}

/* ===========================
   BASE PATH HELPER
=========================== */

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

/* ===========================
   LAYOUT INJECTION
=========================== */

async function loadLayout() {
  const base = getBasePath();
  let user = null;
  if (typeof getCurrentUser === "function") {
    user = getCurrentUser();
  }

  const headerFile = user ? "header.html" : "header_sesion.html";
  const header = await fetch(`${base}/partials/${headerFile}`).then(r => r.text());
  const footer = await fetch(`${base}/partials/footer.html`).then(r => r.text());

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  // Normalización de rutas
  document.querySelectorAll("header a, footer a").forEach(link => {
    let href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      const cleanHref = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
      const pagesFiles = [
        "artistas.html", "obras.html", "categorias.html", "login.html", 
        "obra-detalle.html", "artista-detalle.html", "categoria-detalle.html",
        "perfil-artista.html", "perfil-usuario.html",
        "moderno.html", "clasico.html", "abstracto.html"
      ];

      const isKnownPage = pagesFiles.some(p => cleanHref.startsWith(p));
      const isPagesDir = cleanHref.includes("pages/");

      if (isKnownPage || isPagesDir) {
        const finalPath = isPagesDir ? cleanHref : `pages/${cleanHref}`;
        link.href = `${base}/${finalPath}`;
      } else if (cleanHref.includes("assets/")) {
        link.href = `${base}/${cleanHref}`;
      } else if (cleanHref === "index.html" || cleanHref === "" || cleanHref === "./") {
        link.href = `${base}/index.html`;
      }
    }
  });

  requestAnimationFrame(() => {
    if (typeof renderHeaderUser === "function") renderHeaderUser();
    if (typeof applyUserRole === "function") applyUserRole();
    if (typeof initHeaderMenu === "function") initHeaderMenu();
  });
}