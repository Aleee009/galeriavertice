let categorias = [];
let artistas = [];
let obras = [];
let favoritos = JSON.parse(localStorage.getItem("favorites")) || [];

let obrasFiltradasActuales = [];
let mostrarSoloFavoritos = false;

/* ================================
   UTILIDADES
================================ */
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function guardarFavoritos() {
  localStorage.setItem("favorites", JSON.stringify(favoritos));
}

function toggleFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }
  guardarFavoritos();
  aplicarFiltros();
}

/* ================================
   CARGA DE DATOS
================================ */
async function cargarDatos() {
  const [catRes, artRes, obraRes] = await Promise.all([
    fetch("../data/categorias.json"),
    fetch("../data/artistas.json"),
    fetch("../data/obras.json")
  ]);

  categorias = await catRes.json();
  artistas = await artRes.json();
  obras = await obraRes.json();
}

/* ================================
   FILTROS
================================ */
function aplicarFiltros() {
  let resultado = [...obras];

  const artistaId = document.getElementById("filtroArtista")?.value;
  const texto = document.getElementById("buscador")?.value.toLowerCase();

  if (artistaId) {
    resultado = resultado.filter(o => o.artistaId === parseInt(artistaId));
  }

  if (texto) {
    resultado = resultado.filter(o =>
      o.titulo.toLowerCase().includes(texto) ||
      o.descripcion.toLowerCase().includes(texto)
    );
  }

  if (mostrarSoloFavoritos) {
    resultado = resultado.filter(o => favoritos.includes(o.id));
  }

  renderObras(resultado);
}

/* ================================
   RENDER
================================ */
function renderObras(lista) {
  obrasFiltradasActuales = lista;

  const grid = document.getElementById("obrasGrid");
  if (!grid) return;

  grid.innerHTML = lista.map(obra => {
    const artista = artistas.find(a => a.id === obra.artistaId);
    const esFavorito = favoritos.includes(obra.id);

    return `
      <article class="card-obra">
        <img src="../assets/img/${obra.imagen}">
        <h3>${obra.titulo}</h3>
        <p>${artista.nombre}</p>
        <button class="favorite" onclick="toggleFavorito(${obra.id})">
          ${esFavorito ? "❤️" : "🤍"}
        </button>
      </article>
    `;
  }).join("");
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
   ROUTER
================================ */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "obras") {
    initObras();
  }
});
