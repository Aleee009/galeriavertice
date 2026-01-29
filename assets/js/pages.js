let categorias = [];
let artistas = [];
let obras = [];

let mostrarSoloFavoritos = false;

/* ================================
   CARGA DE DATOS
================================ */

async function cargarDatos() {
  const categoriasData = await loadJSON("categorias.json");
  const artistasData = await loadJSON("artistas.json");
  const obrasData = await loadJSON("obras.json");

  categorias = categoriasData.categorias;
  artistas = artistasData.artistas;
  obras = obrasData;
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
  if (page === "artistas") initArtistas();
}

/* =====================================================
   ARTISTAS PAGE
===================================================== */

async function initArtistas() {
  await cargarDatos();

  const artistasActivos = artistas.filter(a => a.activo);
  if (!artistasActivos.length) return;

  renderFeaturedArtist(artistasActivos[0]);
  renderArtistsGrid(artistasActivos);

  renderArtistFilters(); // 👈 ESTA ERA LA PIEZA QUE FALTABA

  initSearch(artistasActivos);
  initOrder(artistasActivos);
}

/* =====================================================
   ARTISTA DESTACADO
===================================================== */

function renderFeaturedArtist(artista) {
  document.getElementById("featuredImage").innerHTML = `
    <img src="../assets/img/artistas/${artista.avatar}" alt="${artista.nombre}">
  `;

  document.getElementById("featuredName").textContent = artista.nombre;
  document.getElementById("featuredCity").textContent = artista.ciudad;
}


/* =====================================================
   TAGS DE CATEGORÍAS (ARTISTAS)
===================================================== */

function renderArtistTags(containerId, estilosIds) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  estilosIds.forEach(id => {
    const categoria = categorias.find(c => c.id === id);
    if (!categoria) return;

    container.insertAdjacentHTML(
      "beforeend",
      `<span class="artist-tag">${categoria.nombre}</span>`
    );
  });
}

/* =====================================================
   FILTROS DE ARTISTAS (DESDE CATEGORÍAS)
===================================================== */

function renderArtistFilters() {
  const container = document.getElementById("artistFilters");
  if (!container || !Array.isArray(categorias)) return;

  container.innerHTML = "";

  // Orden editorial (nombres tal como quieres mostrarlos)
  const ordenVisible = [
    "Pintura",
    "Fotografía",
    "Escultura",
    "Retrato",
    "Abstracto",
    "Blanco y Negro"
  ];

  // Normaliza para evitar problemas con acentos / mayúsculas
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Mapa rápido por nombre normalizado
  const mapCategorias = new Map(
    categorias.map(c => [normalize(c.nombre), c])
  );

  ordenVisible.forEach((nombre, index) => {
    const categoria = mapCategorias.get(normalize(nombre));
    if (!categoria) return;

    const btn = document.createElement("button");
    btn.className = "filter-pill" + (index === 0 ? " active" : "");
    btn.textContent = categoria.nombre;
    btn.dataset.id = categoria.id;

    container.appendChild(btn);
  });
}

/* =====================================================
   GRID DE ARTISTAS
===================================================== */

function renderArtistsGrid(artistas) {
  const grid = document.getElementById("artistsGrid");
  grid.innerHTML = "";

  artistas.forEach(artista => {
    grid.insertAdjacentHTML("beforeend", `
      <article class="artist-card">
        <div class="artist-image">
          <img src="../assets/img/artistas/${artista.avatar}" alt="${artista.nombre}">
        </div>

        <div class="artist-info">
          <h3>${artista.nombre}</h3>
          <p class="artist-city">${artista.ciudad}</p>

          <a href="perfil-artista.html?slug=${artista.slug}" class="btn btn-outline">
            Ver perfil
          </a>
        </div>
      </article>
    `);
  });
}

/* =====================================================
   BUSCADOR
===================================================== */

function initSearch(allArtists) {
  const input = document.getElementById("artistSearch");

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();

    const filtered = allArtists.filter(a =>
      a.nombre.toLowerCase().includes(value) ||
      a.ciudad.toLowerCase().includes(value)
    );

    renderArtistsGrid(filtered);
  });
}

/* =====================================================
   ORDEN
===================================================== */

function initOrder(allArtists) {
  const select = document.getElementById("artistOrder");

  select.addEventListener("change", () => {
    const sorted = [...allArtists].sort((a, b) => {
      return select.value === "az"
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre);
    });

    renderArtistsGrid(sorted);
  });
}
