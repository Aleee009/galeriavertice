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
      renderCategoria("moderno");
    });

  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      renderCategoria(btn.dataset.cat);
    });
  });

  function renderCategoria(seccion) {
    grid.innerHTML = "";

    const seleccion = obras
      .filter((o) => {
        if (seccion === "moderno") {
          return [4, 6, 18].includes(o.categoriaPrincipal);
        }

        if (seccion === "clasico") {
          return [1, 2].includes(o.categoriaPrincipal);
        }

        if (seccion === "abstracto") {
          return o.categoriasSecundarias?.includes(14);
        }

        return false;
      })
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
    resultado = resultado.filter((o) =>
      normalize(o.titulo).includes(texto)
    );
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

  document.getElementById("buscador")?.addEventListener("input", aplicarFiltros);
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
    `
    )
    .join("");
}

async function initCategoriaDetalle() {
  await cargarDatos();

  const id = parseInt(getParam("id"));
  const categoria = categorias.find((c) => c.id === id);
  if (!categoria) return;

  document.getElementById("categoriaTitulo").textContent = categoria.nombre;

  const filtradas = obras.filter(
    (o) =>
      o.categoriaPrincipal === id ||
      o.categoriasSecundarias?.includes(id)
  );

  renderObras(filtradas);
}

/* ================================
   ROUTER
================================ */

function initPages(page) {
  if (page === "home") iniciarHome();
  if (page === "obras") initObras();
  if (page === "categorias") initCategorias();
  if (page === "categoria") initCategoriaDetalle();
  if (page === "artistas") initArtistas();
}

/* =====================================================
   ARTISTAS
===================================================== */

async function initArtistas() {
  await cargarDatos();

  const artistasActivos = artistas.filter((a) => a.activo);
  if (!artistasActivos.length) return;

  renderArtistsGrid(artistasActivos);
  renderArtistFilters();
  initSearch(artistasActivos);
  initOrder(artistasActivos);
}

/* =====================================================
   FILTROS ARTISTAS
===================================================== */

function renderArtistFilters() {
  const container = document.getElementById("artistFilters");
  if (!container || !Array.isArray(categorias)) return;

  container.innerHTML = "";

  const ordenVisible = [
    "Pintura",
    "Fotografía",
    "Retrato",
    "Abstracto",
    "Arte Digital",
  ];

  const normalizeName = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const mapCategorias = new Map(
    categorias.map((c) => [normalizeName(c.nombre), c])
  );

  ordenVisible.forEach((nombre) => {
    const categoria = mapCategorias.get(normalizeName(nombre));
    if (!categoria) return;

    const btn = document.createElement("button");
    btn.className = "filter-pill";
    btn.textContent = categoria.nombre;
    btn.dataset.id = categoria.id;

    container.appendChild(btn);
  });
}

/* =====================================================
   GRID ARTISTAS
===================================================== */

function renderArtistsGrid(lista) {
  const grid = document.getElementById("artistsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  lista.forEach((artista) => {
    grid.insertAdjacentHTML(
      "beforeend",
      `
      <article class="artist-card">
        <div class="artist-image">
          <img src="../assets/img/${artista.avatar}" alt="${artista.nombre}">
        </div>

        <div class="artist-info">
          <h3>${artista.nombre}</h3>
          <p class="artist-city">${artista.ciudad}</p>

          <a href="perfil-artista.html?slug=${artista.slug}" class="btn btn-outline">
            Ver perfil
          </a>
        </div>
      </article>
    `
    );
  });
}

/* =====================================================
   BUSCADOR
===================================================== */

function initSearch(allArtists) {
  const input = document.getElementById("artistSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();

    const filtered = allArtists.filter(
      (a) =>
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
  if (!select) return;

  select.addEventListener("change", () => {
    const sorted = [...allArtists].sort((a, b) =>
      select.value === "az"
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre)
    );

    renderArtistsGrid(sorted);
  });
}

/* =====================================================
   CARRUSEL DE NOTICIAS
===================================================== */

async function initFeaturedNewsCarousel() {
  const track = document.getElementById("newsTrack");
  if (!track) return;

  const [newsRes, artistsRes] = await Promise.all([
    fetch("../data/noticias.json"),
    fetch("../data/artistas.json"),
  ]);

  const newsData = await newsRes.json();
  const artistsData = await artistsRes.json();

  const artistMap = {};
  artistsData.artistas.forEach((a) => {
    artistMap[a.id] = a.nombre;
  });

  const featuredNews = newsData.noticias.filter((n) => n.destacada);
  track.innerHTML = "";

  featuredNews.forEach((noticia) => {
    const slide = document.createElement("article");
    slide.className = "news-slide";

    slide.innerHTML = `
      <div class="news-image">
        <img src="../assets/img/${noticia.imagen}" alt="${noticia.titulo}">
      </div>

      <div class="news-content">
        <span class="news-eyebrow">Última noticia</span>
        <h2 class="news-title">${noticia.titulo}</h2>
        <p class="news-excerpt">${noticia.extracto}</p>

        <div class="news-meta">
          <span class="news-artist">${artistMap[noticia.artistaId] || ""}</span>
          <span class="news-date">${formatNewsDate(noticia.fecha)}</span>
        </div>
      </div>
    `;

    track.appendChild(slide);
  });

  initCarouselControls(track);
}

/* ===============================
   FECHA
=============================== */

function formatNewsDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

document.addEventListener("DOMContentLoaded", initFeaturedNewsCarousel);