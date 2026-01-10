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

  const header = await fetch(`${base}/partials/header.html`).then((r) =>
    r.text()
  );
  const footer = await fetch(`${base}/partials/footer.html`).then((r) =>
    r.text()
  );

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

  const SIZE = 200;
  const GAP = 14;      // separación mínima real entre bordes
  const MAX = 36;

  const MARGIN = 40;
  const VIEW_W = window.innerWidth;
  const VIEW_H = window.innerHeight * 1.4;

  const AREA_W = VIEW_W - MARGIN * 2;
  const AREA_H = VIEW_H - MARGIN * 2;
  const ORIGIN_X = MARGIN;
  const ORIGIN_Y = MARGIN;

  // Zona central libre
  const CENTER_W = 520;
  const CENTER_H = 220;
  const CX = ORIGIN_X + AREA_W / 2;
  const CY = ORIGIN_Y + AREA_H / 2;

  const pool = obras.sort(() => 0.5 - Math.random());

  container.innerHTML = "";
  const placed = [];

  function boxesOverlap(a, b) {
    return !(
      a.x + a.w + GAP <= b.x ||
      b.x + b.w + GAP <= a.x ||
      a.y + a.h + GAP <= b.y ||
      b.y + b.h + GAP <= a.y
    );
  }

  function inCenter(box) {
    return !(
      box.x + box.w <= CX - CENTER_W / 2 ||
      box.x >= CX + CENTER_W / 2 ||
      box.y + box.h <= CY - CENTER_H / 2 ||
      box.y >= CY + CENTER_H / 2
    );
  }

  function valid(box) {
    // dentro del main
    if (box.x < ORIGIN_X || box.y < ORIGIN_Y) return false;
    if (box.x + box.w > ORIGIN_X + AREA_W) return false;
    if (box.y + box.h > ORIGIN_Y + AREA_H) return false;

    // no invadir centro
    if (inCenter(box)) return false;

    // separación estricta
    for (let p of placed) {
      if (boxesOverlap(box, p)) return false;
    }

    return true;
  }

  let tries = 0;
  while (placed.length < MAX && tries < 20000) {
    const box = {
      x: ORIGIN_X + Math.random() * (AREA_W - SIZE),
      y: ORIGIN_Y + Math.random() * (AREA_H - SIZE),
      w: SIZE,
      h: SIZE
    };

    if (valid(box)) {
      placed.push(box);
    }

    tries++;
  }

  let maxBottom = 0;

  placed.forEach((p, i) => {
    const obra = pool[i % pool.length];

    container.innerHTML += `
      <div class="home-image square"
           style="left:${p.x}px; top:${p.y}px;
                  width:${p.w}px; height:${p.h}px;">
        <img src="${base}/assets/img/${obra.imagen}" alt="${obra.titulo}">
      </div>
    `;

    maxBottom = Math.max(maxBottom, p.y + p.h);
  });

  container.style.height = (maxBottom + MARGIN) + "px";
}
