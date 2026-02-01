let categorias = [];
let artistas = [];
let obras = [];

let mostrarSoloFavoritos = false;
let artistasFiltrados = [];
let categoriaActiva = null;

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

/* ================================
   HOME
================================ */

async function iniciarHome() {
  const grid = document.querySelector(".home-grid");
  const buttons = document.querySelectorAll(".home-categories span");
  const base = getBasePath();

  if (!grid) return;

  // Cargar datos primero
  await cargarDatos();

  // Renderizar categoría por defecto
  renderCategoria("moderno");

  // Añadir eventos a las categorías
  buttons.forEach((btn) => {
    // 1. Vista previa al pasar el ratón
    btn.addEventListener("mouseenter", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCategoria(btn.dataset.cat);
    });

    // 2. Navegación al hacer clic
    btn.addEventListener("click", () => {
      const seccion = btn.dataset.cat;
      if (!seccion) return;
      
      // Desde el root (index.html), entramos en pages/seccion.html
      const destino = `pages/${seccion}.html`;
      console.log(`[Navigation] Navigating from Home to: ${destino}`);
      window.location.href = destino;
    });
  });

  function renderCategoria(seccion) {
    grid.innerHTML = "";
    
    // Usar la función de filtrado de utils.js
    const filtradas = filtrarPorSeccion(obras, seccion);
    
    // Mezclar y tomar 5
    const seleccion = [...filtradas]
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

  const base = getBasePath();

  grid.innerHTML = lista
    .map((obra) => {
      const artista = artistas.find((a) => a.id === obra.artistaId);
      const favorito = isFavorite(obra.id);
      const imgPath = obra.imagen;

      return `
        <article class="card-obra">
          <img src="${base}/assets/img/${imgPath}" alt="${obra.titulo}">
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
   FILTROS OBRAS
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
  document
    .getElementById("filtroFavoritos")
    ?.addEventListener("click", () => {
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
      <div class="card-obra category-card-rich" onclick="goTo('categoria-detalle.html', { id: ${c.id} })">
        <div class="category-info-content">
          <h3>${c.nombre}</h3>
          <p class="category-short-desc">${c.descripcion_larga || "Explora nuestra selección curada de esta disciplina artística."}</p>
          <span class="btn btn-outline small">Explorar Catálogo</span>
        </div>
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

  const filtradas = obras.filter((o) =>
    [o.categoriaPrincipal, ...(o.categoriasSecundarias || [])].includes(id)
  );

  renderObras(filtradas);
}

async function initObraDetalle() {
  await cargarDatos();
  const id = parseInt(getParam("id"));
  const obra = obras.find(o => o.id === id);
  if (!obra) return;

  const artista = artistas.find(a => a.id === obra.artistaId);
  const base = getBasePath();

  // Título y Artista
  document.querySelector(".obra-texto h1").textContent = obra.titulo;
  const artistLink = document.createElement("a");
  artistLink.href = `perfil-artista.html?slug=${artista?.slug}`;
  artistLink.className = "obra-artist-link";
  artistLink.textContent = artista?.nombre || "Artista Independiente";
  
  const h1 = document.querySelector(".obra-texto h1");
  h1.after(artistLink);

  // Cuerpo de descripción rico
  const descContainer = document.querySelector(".obra-texto p:nth-child(2)");
  if (descContainer) {
    descContainer.innerHTML = `
      <div class="obra-curatorial-block">
        <p class="obra-short-desc">${obra.descripcion || ""}</p>
        
        ${obra.descripcion_detallada ? `
          <div class="obra-long-desc">
            <h3>Análisis del Conservador</h3>
            <p>${obra.descripcion_detallada}</p>
          </div>
        ` : ""}

        <div class="obra-spec-grid">
          <div class="spec-item"><strong>Técnica:</strong> ${obra.tecnica || "No especificada"}</div>
          <div class="spec-item"><strong>Año:</strong> ${obra.año || "S.F."}</div>
          <div class="spec-item"><strong>Dimensiones:</strong> ${obra.dimensiones || "Variables"}</div>
        </div>

        ${obra.procedencia ? `
          <div class="obra-history-block">
            <h3>Procedencia</h3>
            <p>${obra.procedencia}</p>
          </div>
        ` : ""}

        ${obra.historial_exposiciones ? `
          <div class="obra-history-block">
            <h3>Historial de Exposiciones</h3>
            <ul>${obra.historial_exposiciones.map(e => `<li>${e}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </div>
    `;
    
    // Limpiar el antiguo "Artista: ..."
    const oldArtistP = document.querySelector(".obra-texto p:nth-child(3)");
    if (oldArtistP) oldArtistP.remove();
  }
  
  const imgContainer = document.querySelector(".obra-imagen");
  if (imgContainer) {
    imgContainer.innerHTML = `<img src="${base}/assets/img/${obra.metadata?.archivo || obra.imagen}" alt="${obra.titulo}">`;
  }
}


async function initArtistaDetalle() {
  await cargarDatos();
  const slug = getParam("slug");
  const artista = artistas.find(a => a.slug === slug);
  if (!artista) return;

  const base = getBasePath();

  document.getElementById("artistaNombre").textContent = artista.nombre;
  
  // Enriquecer Biografía
  if (document.getElementById("artistaBio")) {
    document.getElementById("artistaBio").innerHTML = `
      <div class="artist-full-header">
        <p class="artist-location">${artista.ciudad}, ${artista.pais}</p>
        <div class="artist-main-bio">${artista.bio}</div>
      </div>
      
      ${artista.trayectoria ? `
        <div class="artist-achievements">
          <h3>Trayectoria y Reconocimientos</h3>
          <ul>${artista.trayectoria.map(t => `<li>${t}</li>`).join("")}</ul>
        </div>
      ` : ""}

      ${artista.tecnicas ? `
        <div class="artist-skills">
          <h3>Técnicas y Especialidades</h3>
          <div class="skills-grid">${artista.tecnicas.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
        </div>
      ` : ""}
    `;
  }

  const obrasArtista = obras.filter(o => o.artistaId === artista.id);
  renderObras(obrasArtista);
}


async function initPerfilArtista() {
  const user = getCurrentUser();
  if (!user || user.role !== "artista") {
    goTo("../index.html");
    return;
  }
  await cargarDatos();
  const obrasArtista = obras.filter(o => o.artistaId === user.id);
  renderObras(obrasArtista);
}

async function initPerfilUsuario() {
  const user = getCurrentUser();
  if (!user) {
    goTo("login.html");
    return;
  }
  await cargarDatos();
  const favoritos = obras.filter(o => isFavorite(o.id));
  renderObras(favoritos);
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
  if (page === "obra") initObraDetalle();
  if (page === "artista") initArtistaDetalle();
  if (page === "perfil-artista") initPerfilArtista();
  if (page === "perfil-usuario") initPerfilUsuario();
  if (["moderno", "clasico", "abstracto"].includes(page)) initSeccionDetalle(page);
}

/* =====================================================
   ARTISTAS
===================================================== */

async function initArtistas() {
  await cargarDatos();

  artistasFiltrados = artistas.filter((a) => a.activo);

  renderArtistFilters();
  renderArtistsGrid(artistasFiltrados);
  initSearch();
  initOrder();
}

/* =====================================================
   FILTROS ARTISTAS (PILLS FUNCIONALES)
===================================================== */

function renderArtistFilters() {
  const container = document.getElementById("artistFilters");
  if (!container) return;

  container.innerHTML = "";

  const categoriasUsadas = new Set();

  obras.forEach((o) => {
    categoriasUsadas.add(o.categoriaPrincipal);
    (o.categoriasSecundarias || []).forEach((c) => categoriasUsadas.add(c));
  });

  categorias
    .filter((c) => categoriasUsadas.has(c.id))
    .forEach((categoria) => {
      const btn = document.createElement("button");
      btn.className = "filter-pill";
      btn.textContent = categoria.nombre;

      btn.addEventListener("click", () => {
        categoriaActiva =
          categoriaActiva === categoria.id ? null : categoria.id;

        document
          .querySelectorAll(".filter-pill")
          .forEach((b) => b.classList.remove("active"));

        if (categoriaActiva) btn.classList.add("active");

        filtrarArtistasPorCategoria();
      });

      container.appendChild(btn);
    });
}

function filtrarArtistasPorCategoria() {
  if (!categoriaActiva) {
    artistasFiltrados = artistas.filter((a) => a.activo);
  } else {
    const artistasConCategoria = new Set(
      obras
        .filter((o) =>
          [o.categoriaPrincipal, ...(o.categoriasSecundarias || [])].includes(
            categoriaActiva
          )
        )
        .map((o) => o.artistaId)
    );

    artistasFiltrados = artistas.filter(
      (a) => a.activo && artistasConCategoria.has(a.id)
    );
  }

  renderArtistsGrid(artistasFiltrados);
}

/* =====================================================
   GRID ARTISTAS
===================================================== */

function renderArtistsGrid(lista) {
  const grid = document.getElementById("artistsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  lista.forEach((artista) => {
    const base = getBasePath();
    grid.insertAdjacentHTML(
      "beforeend",
      `
      <article class="artist-card">
        <div class="artist-image">
          <img src="${base}/assets/img/${artista.avatar}" alt="${artista.nombre}">
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
   BUSCADOR ARTISTAS
===================================================== */

function initSearch() {
  const input = document.getElementById("artistSearch");
  if (!input) return;

  input.addEventListener("input", () => {
    const value = normalize(input.value);

    const filtered = artistasFiltrados.filter(
      (a) =>
        normalize(a.nombre).includes(value) ||
        normalize(a.ciudad).includes(value)
    );

    renderArtistsGrid(filtered);
  });
}

/* =====================================================
   ORDEN ARTISTAS
===================================================== */

function initOrder() {
  const select = document.getElementById("artistOrder");
  if (!select) return;

  select.addEventListener("change", () => {
    const sorted = [...artistasFiltrados].sort((a, b) =>
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
    const base = getBasePath();
    const slide = document.createElement("article");
    slide.className = "news-slide";

    slide.innerHTML = `
      <div class="news-image">
        <img src="${base}/assets/img/${noticia.imagen}" alt="${noticia.titulo}">
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

document.addEventListener("DOMContentLoaded", initFeaturedNewsCarousel);

/**
 * Inicializador compartido para las 3 secciones temáticas (Moderno, Clásico, Abstracto)
 * Implementa el layout editorial "Low Profile"
 */
async function initSeccionDetalle(seccion) {
  // Aseguramos que los datos estén cargados
  await cargarDatos();
  
  // En las páginas temáticas ya tenemos .editorial-grid en el HTML
  const grid = document.querySelector(".editorial-grid");
  const base = getBasePath();

  if (!grid) return;

  // Filtrar usando la lógica de utils.js
  const filtradas = filtrarPorSeccion(obras, seccion);
  
  if (filtradas.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 4rem;'>No hay obras disponibles para esta categoría en este momento.</p>";
    return;
  }

  // Renderizar las obras encontradas
  grid.innerHTML = "";
  
  // Link de regreso institucional (Superior Izquierda)
  const backBtn = document.createElement("a");
  backBtn.href = `${base}/index.html`;
  backBtn.className = "editorial-back-link";
  backBtn.innerHTML = `<span class="material-symbols-outlined">west</span> Volver a la Colección`;
  grid.before(backBtn);

  // Spans predefinidos para un look asimétrico que imita el wirefare (rítmico)
  const spans = ["span-4", "span-4", "span-4", "span-6", "span-6", "span-4", "span-4", "span-4"];

  filtradas.forEach((obra, index) => {
    const artista = artistas.find(a => a.id === obra.artistaId);
    const spanClass = spans[index % spans.length];

    const article = document.createElement("article");
    article.className = `editorial-item ${spanClass}`;

    // Datos técnicos opcionales para look profesional
    const metaHtml = obra.tecnica ? `
      <div class="editorial-metadata">
        <span>${obra.tecnica}</span>
        <span>${obra.año || ""} ${obra.dimensiones ? `· ${obra.dimensiones}` : ""}</span>
      </div>
    ` : "";

    article.innerHTML = `
      <div class="editorial-count">${(index + 1).toString().padStart(2, '0')}</div>
      <div class="editorial-image-wrap">
        <img src="${base}/assets/img/${obra.imagen}" alt="${obra.titulo}" loading="lazy">
      </div>
      <div class="editorial-caption">
        <div class="editorial-header-info">
          <span class="editorial-title">${obra.titulo}</span>
          <span class="editorial-artist">${artista ? artista.nombre : "Artista Independiente"}</span>
        </div>
        ${metaHtml}
      </div>
    `;

    grid.appendChild(article);
  });
}

