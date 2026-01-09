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

/* ================================
   RENDER DE OBRAS
================================ */
function renderObras(lista) {
  const grid = document.getElementById("obrasGrid");
  if (!grid) return;

  grid.innerHTML = lista.map(obra => {
    const artista = artistas.find(a => a.id === obra.artistaId);
    const favorito = isFavorite(obra.id);

    return `
      <article class="card-obra">
        <img src="../assets/img/${obra.imagen}">
        <h3>${obra.titulo}</h3>
        <p>${artista.nombre}</p>
        <button class="favorite" onclick="handleFavorite(${obra.id})">
          ${favorito ? "❤️" : "🤍"}
        </button>
      </article>
    `;
  }).join("");
}

function handleFavorite(id) {
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
    resultado = resultado.filter(o => o.artistaId === parseInt(artistaId));
  }

  if (texto) {
    resultado = resultado.filter(o =>
      normalize(o.titulo).includes(texto) ||
      normalize(o.descripcion).includes(texto)
    );
  }

  if (mostrarSoloFavoritos) {
    resultado = resultado.filter(o => isFavorite(o.id));
  }

  renderObras(resultado);
}

/* ================================
   INIT OBRAS
================================ */
async function initObras() {
  await cargarDatos();

  const select = document.getElementById("filtroArtista");
  artistas.forEach(a => {
    const option = document.createElement("option");
    option.value = a.id;
    option.textContent = a.nombre;
    select.appendChild(option);
  });

  document.getElementById("filtroArtista").addEventListener("change", aplicarFiltros);
  document.getElementById("buscador").addEventListener("input", aplicarFiltros);
  document.getElementById("filtroFavoritos").addEventListener("click", () => {
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
  grid.innerHTML = categorias.map(c => `
    <div class="card-obra" onclick="goTo('categoria-detalle.html', { id: ${c.id} })">
      <h3>${c.nombre}</h3>
    </div>
  `).join("");
}

async function initCategoriaDetalle() {
  await cargarDatos();

  const id = parseInt(getParam("id"));
  const categoria = categorias.find(c => c.id === id);

  document.getElementById("categoriaTitulo").textContent = categoria.nombre;

  const filtradas = obras.filter(o => o.categoriaId === id);
  renderObras(filtradas);
}

/* ================================
   ROUTER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "obras") initObras();
  if (page === "categorias") initCategorias();
  if (page === "categoria") initCategoriaDetalle();
});
