document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout();
  controlarSesion();

  if (document.body.dataset.page === "home") {
    cargarHome();
  }
});

/* ================================
   LAYOUT (HEADER + FOOTER)
================================ */

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

let layoutLoaded = false;

async function loadLayout() {
  if (layoutLoaded) return;
  layoutLoaded = true;

  const base = getBasePath();

  const header = await fetch(`${base}/partials/header.html`).then(r => r.text());
  const footer = await fetch(`${base}/partials/footer.html`).then(r => r.text());

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  configurarHeader();
}

/* ================================
   CONTROL DE SESIÓN
================================ */

function controlarSesion() {
  const userType = localStorage.getItem("userType");
  const page = document.body.dataset.page;

  const protegidas = ["perfil-artista", "perfil-usuario"];

  if (protegidas.includes(page) && !userType) {
    window.location.href = getBasePath() + "/pages/login.html";
  }
}

/* ================================
   CONFIGURAR HEADER
================================ */

function configurarHeader() {
  const userType = localStorage.getItem("userType");
  const actions = document.querySelector(".user-actions");
  if (!actions) return;

  const base = getBasePath();

  if (userType) {
    const perfil =
      userType === "artista"
        ? `${base}/pages/perfil-artista.html`
        : `${base}/pages/perfil-usuario.html`;

    actions.innerHTML = `
      <a href="${perfil}" class="user-icon">
        <span class="material-symbols-outlined">person</span>
      </a>
      <button id="logoutBtn" class="user-icon">
        <span class="material-symbols-outlined">logout</span>
      </button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.clear();
      window.location.href = `${base}/index.html`;
    });
  }
}

/* ================================
   HOME FLOATING GALLERY
================================ */

async function cargarHome() {
  const container = document.getElementById("home-images");
  if (!container) return;

  const base = getBasePath();
  const obras = await fetch(`${base}/data/obras.json`).then(r => r.json());
  const seleccion = obras.sort(() => 0.5 - Math.random()).slice(0, 18);

  const width = window.innerWidth;
const height = window.innerHeight;

  const padding = 60;
  const placed = [];

  const shapes = [
    { cls: "square", w: 260, h: 260 },
    { cls: "rect", w: 360, h: 240 },
    { cls: "tall", w: 240, h: 360 }
  ];

  function overlaps(x, y, w, h) {
    return placed.some(p =>
      x < p.x + p.w + padding &&
      x + w + padding > p.x &&
      y < p.y + p.h + padding &&
      y + h + padding > p.y
    );
  }

  container.innerHTML = "";

  for (let obra of seleccion) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    let x, y, tries = 0;

    do {
      x = Math.random() * (width - shape.w);
      y = Math.random() * (height - shape.h);
      tries++;
    } while (overlaps(x, y, shape.w, shape.h) && tries < 80);

    placed.push({ x, y, w: shape.w, h: shape.h });

    container.innerHTML += `
      <div class="home-image ${shape.cls}" style="left:${x}px; top:${y}px;">
        <img src="${base}/assets/img/${obra.imagen}" alt="${obra.titulo}">
      </div>
    `;
  }

  // Ajustar altura real del hero
  const maxBottom = Math.max(...placed.map(p => p.y + p.h));
}
