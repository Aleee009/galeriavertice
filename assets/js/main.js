document.addEventListener("DOMContentLoaded", async () => {

  const page = document.body.dataset.page;

  // Header y footer en TODAS menos auth
  if (page !== "login" && page !== "register") {
    await loadLayout();
  }

  if (page === "home") {
    iniciarHome();
  }
});


/* ===========================
   BASE PATH
=========================== */

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

/* ===========================
   LAYOUT (HEADER + FOOTER)
=========================== */

async function loadLayout() {
  const base = getBasePath();

  const header = await fetch(`${base}/partials/header_sesion.html`)
    .then(r => r.text());

  const footer = await fetch(`${base}/partials/footer.html`)
    .then(r => r.text());

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
}

/* ===========================
   HOME (FOTOS)
=========================== */

function iniciarHome() {
  const grid = document.querySelector(".home-grid");
  const buttons = document.querySelectorAll(".home-categories span");
  const base = getBasePath();

  if (!grid) return;

  let todasLasObras = [];

  fetch(`${base}/data/obras.json`)
    .then(r => r.json())
    .then(obras => {
      todasLasObras = obras;
      renderCategoria(1); // moderno por defecto
    });

  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      const cat =
        btn.dataset.cat === "moderno" ? 1 :
        btn.dataset.cat === "clasico" ? 2 :
        7;

      renderCategoria(cat);
    });
  });

  function renderCategoria(catId) {
    grid.innerHTML = "";

    const seleccion = todasLasObras
      .filter(o => o.categoriaId === catId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    seleccion.forEach(obra => {
      const div = document.createElement("div");
      div.className = "grid-item";

      const img = document.createElement("img");
      img.src = `${base}/assets/img/${obra.imagen}`;
      img.alt = obra.titulo;

      div.appendChild(img);
      grid.appendChild(div);
    });
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".toggle-password");
  if (!btn) return;

  const input = btn.previousElementSibling;
  const icon = btn.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
    btn.setAttribute("aria-label", "Ocultar contraseña");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
    btn.setAttribute("aria-label", "Mostrar contraseña");
  }
});
