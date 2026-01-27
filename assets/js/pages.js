let categorias = [];
let artistas = [];
let obras = [];

let mostrarSoloFavoritos = false;

/* ================================
   CARGA DE DATOS
================================ */

async function cargarDatos() {
  categorias = await loadJSON("categorias.json");
  artistas = await loadJSON("artistas.json");
  obras = await loadJSON("obras.json");
}

const SECCIONES = {
  moderno: [4, 6, 9, 17, 18, 23],
  clasico: [1, 3, 12, 13],
  abstracto: [7, 14, 15, 18, 20],
};

/* ================================
   HOME
================================ */

function iniciarHome() {
  const grid = document.querySelector(".home-grid");
  const buttons = document.querySelectorAll(".home-categories span");
  const base = getBasePath();

  if (!grid) return;

  fetch(`${base}/data/obras.json`)
    .then((r) => r.json())
    .then((data) => {
      obras = data;
      renderCategoria("moderno"); // moderno por defecto
      console.log("SECCION:", seccion);
      console.log("CATEGORIAS:", SECCIONES[seccion]);
      console.log("OBRAS:", seleccion.length);
    });

  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      renderCategoria(btn.dataset.cat);
    });
  });

  function renderCategoria(seccion) {
    grid.innerHTML = "";

    const categoriasSeccion = SECCIONES[seccion];

    const seleccion = obras
      .filter((o) =>
        o.categorias.some((cat) => categoriasSeccion.includes(cat)),
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    seleccion.forEach((obra) => {
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

/* ================================
   OBRAS
================================ */

function renderObras(lista) {
  const grid = document.getElementById("obrasGrid");
  if (!grid) return;

  grid.innerHTML = lista
    .map((obra) => {
      const artista = artistas.find((a) => a.id === obra.artistaId);
      const favorito = isFavorite(obra.id);

      return `
      <article class="card-obra">
        <img src="../assets/img/${obra.imagen}">
        <h3>${obra.titulo}</h3>
        <p>${artista?.nombre || ""}</p>
        <button class="favorite" onclick="handleFavorite(${obra.id})">
          ${favorito ? "❤️" : "🤍"}
        </button>
      </article>
    `;
    })
    .join("");
}

function handleFavorite(id) {
  const user = getCurrentUser();
  if (!user) {
    goTo("login.html");
    return;
  }

  toggleFavorite(id);
  aplicarFiltros();
}

/* ================================
   FILTROS
================================ */

function aplicarFiltros() {
  let resultado = [...obras];

  const artistaId = document.getElementById("filtroArtista")?.value;
  const texto = normalize(document.getElementById("buscador")?.value || "");

  if (artistaId) {
    resultado = resultado.filter((o) => o.artistaId === parseInt(artistaId));
  }

  if (texto) {
    resultado = resultado.filter((o) => normalize(o.titulo).includes(texto));
  }

  if (mostrarSoloFavoritos) {
    resultado = resultado.filter((o) => isFavorite(o.id));
  }

  renderObras(resultado);
}

/* ================================
   INIT OBRAS
================================ */

async function initObras() {
  await cargarDatos();

  const select = document.getElementById("filtroArtista");
  if (select) {
    artistas.forEach((a) => {
      const option = document.createElement("option");
      option.value = a.id;
      option.textContent = a.nombre;
      select.appendChild(option);
    });

    select.addEventListener("change", aplicarFiltros);
  }

  document
    .getElementById("buscador")
    ?.addEventListener("input", aplicarFiltros);
  document.getElementById("filtroFavoritos")?.addEventListener("click", () => {
    mostrarSoloFavoritos = !mostrarSoloFavoritos;
    aplicarFiltros();
  });

  aplicarFiltros();
}

/* ================================
   CATEGORÍAS
================================ */

async function initCategorias() {
  await cargarDatos();

  const grid = document.getElementById("categoriasGrid");
  if (!grid) return;

  grid.innerHTML = categorias
    .map(
      (c) => `
    <div class="card-obra" onclick="goTo('categoria-detalle.html', { id: ${c.id} })">
      <h3>${c.nombre}</h3>
    </div>
  `,
    )
    .join("");
}

async function initCategoriaDetalle() {
  await cargarDatos();

  const id = parseInt(getParam("id"));
  const categoria = categorias.find((c) => c.id === id);
  if (!categoria) return;

  document.getElementById("categoriaTitulo").textContent = categoria.nombre;

  const filtradas = obras.filter((o) => o.categorias.includes(id));

  renderObras(filtradas);
}

/* ================================
   ROUTER DE PÁGINAS
================================ */

function initPages(page) {
  if (page === "home") iniciarHome();
  if (page === "obras") initObras();
  if (page === "categorias") initCategorias();
  if (page === "categoria") initCategoriaDetalle();
}
