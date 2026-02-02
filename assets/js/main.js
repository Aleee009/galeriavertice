document.addEventListener("DOMContentLoaded", async () => {
  // 🔥 Registro de Service Worker para caché extremo
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[SW] Registrado con éxito', reg.scope))
        .catch(err => console.error('[SW] Error al registrar', err));
    });
  }

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
    const base = getBasePath();
    window.location.href = `${base}/pages/login.html`;
    return;
  }

  /* ===========================
     EXECUCCIÓN PARALELA (LAYOUT + PÁGINA)
     =========================== */
  const initTasks = [];

  if (page !== "login" && page !== "register") {
    initTasks.push(loadLayout().then(() => {
      injectPremiumGate();
      if (typeof applyUserRole === "function") applyUserRole();
    }));
  }

  if (typeof initPages === "function") {
    const seccion = getParam("seccion");
    const initWhitelist = ["home", "obras", "categorias", "categoria", "artistas", "obra", "artista", "perfil-artista", "perfil-usuario", "moderno", "clasico", "abstracto"];
    if (initWhitelist.includes(page)) {
      initTasks.push(initPages(page, seccion));
    }
  }

  // Esperar a que todo lo crítico termine
  await Promise.all(initTasks);

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
          <a href="${getPageRoute('login.html')}?mode=register" class="btn">Crear cuenta privada</a>
          <a href="${getPageRoute('login.html')}" class="btn btn-outline">Iniciar sesión</a>
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
  // Convertimos a URL absoluta interna para que sea robusta ante cambios de nivel
  const absoluteUrl = new URL(href, window.location.origin + window.location.pathname).href;
  localStorage.setItem("intended_destination", absoluteUrl);
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
  
  // 🔥 Optimización: Carga paralela de header y footer
  const [headerHtml, footerHtml] = await Promise.all([
    fetch(`${base}/partials/${headerFile}`).then(r => r.text()),
    fetch(`${base}/partials/footer.html`).then(r => r.text())
  ]);

  document.body.insertAdjacentHTML("afterbegin", headerHtml);
  document.body.insertAdjacentHTML("beforeend", footerHtml);

  // Renderizar nombre de usuario inmediatamente si existe
  if (user && typeof renderUserName === "function") {
    renderUserName();
  }

  // Normalización de rutas para navegación dinámica
  document.querySelectorAll("header a, footer a, .premium-gate a, .v-card-link").forEach(link => {
    let href = link.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("#")) {
      // Extraemos solo el nombre del archivo y sus parámetros
      const urlMatch = href.match(/([^/]+\.html)(\?.*)?$/);
      if (urlMatch) {
        const pageName = urlMatch[1];
        const params = urlMatch[2] || "";
        link.href = getPageRoute(pageName) + params;
      } else if (href === "index.html" || href === "./" || href === "") {
        link.href = `${getBasePath()}/index.html`;
      }
    }
  });

  requestAnimationFrame(() => {
    if (typeof applyUserRole === "function") applyUserRole();
    if (typeof initHeaderMenu === "function") initHeaderMenu();
  });
}