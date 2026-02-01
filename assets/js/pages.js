/* =====================================================
   GALLERIA ENGINE · Vértice Premium
   Simplificado, Rápido y sin Curry/Bloat.
   ===================================================== */

const Galleria = {
  obras: [],
  artistas: [],
  categorias: [],

  async load() {
    if (this.obras.length > 0) return;
    const [cat, art, obr] = await preloadGlobals();
    this.categorias = cat?.categorias || [];
    this.artistas = art?.artistas || [];
    this.obras = obr || [];
  },

  render(containerId, items, type = 'obra') {
    const grid = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
    if (!grid) return;

    grid.innerHTML = "";
    if (items.length === 0) {
      grid.innerHTML = "<p class='v-empty'>No hay elementos en esta selección.</p>";
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement("article");
      const priority = index < 6;

      if (type === 'obra') {
        const artista = this.artistas.find(a => a.id === item.artistaId);
        card.className = "card-obra v-card";
        const imgWrap = document.createElement("div");
        renderOptimizedImage(imgWrap, item.imagen, item.titulo, priority, "4/5");
        card.appendChild(imgWrap);
        card.insertAdjacentHTML("beforeend", `
          <div class="v-card-info">
            <h3>${item.titulo}</h3>
            <p>${artista?.nombre || "Vértice"}</p>
            <a href="obra-detalle.html?id=${item.id}" class="v-card-link"></a>
            <button class="favorite ${isFavorite(item.id) ? 'active' : ''}" onclick="Handle.favorite(event, ${item.id})">
              <span class="material-symbols-outlined">${isFavorite(item.id) ? 'favorite' : 'favorite_border'}</span>
            </button>
          </div>
        `);
      } 
      else if (type === 'artista') {
        card.className = "card-artista v-card";
        const imgWrap = document.createElement("div");
        renderOptimizedImage(imgWrap, item.avatar, item.nombre, priority, "1/1");
        card.appendChild(imgWrap);
        card.insertAdjacentHTML("beforeend", `
          <div class="v-card-info">
            <h3>${item.nombre}</h3>
            <a href="artista-detalle.html?id=${item.id}" class="v-card-link"></a>
          </div>
        `);
      }
      else if (type === 'categoria') {
        card.className = "card-categoria v-card";
        card.insertAdjacentHTML("beforeend", `
          <div class="v-card-info">
            <h3>${item.nombre}</h3>
            <a href="categoria-detalle.html?id=${item.id}" class="v-card-link"></a>
          </div>
        `);
      }

      grid.appendChild(card);
    });
  }
};

/* =====================================================
   HANDLERS
   ===================================================== */
const Handle = {
  favorite(e, id) {
    if (e) e.stopPropagation();
    toggleFavorite(id);
    const btn = e.currentTarget;
    const icon = btn.querySelector(".material-symbols-outlined");
    const active = isFavorite(id);
    btn.classList.toggle("active", active);
    icon.textContent = active ? 'favorite' : 'favorite_border';
  }
};

// Rutas de inicialización
async function initPages(page, seccion) {
  await Galleria.load();

  const routes = {
    home: () => {
      const sample = [...Galleria.obras].sort(() => 0.5 - Math.random()).slice(0, 8);
      Galleria.render("home-grid", sample);
      // Listener para categorías en home
      document.querySelectorAll(".home-categories span").forEach(span => {
        span.onclick = () => window.location.href = `pages/${span.dataset.cat}.html`;
      });
    },
    obras: () => {
      const grid = "obrasGrid";
      Galleria.render(grid, Galleria.obras);
      const search = document.getElementById("buscador");
      if (search) {
        search.oninput = () => {
          const q = search.value.toLowerCase();
          const filtered = Galleria.obras.filter(o => o.titulo.toLowerCase().includes(q));
          Galleria.render(grid, filtered);
        };
      }
    },
    artistas: () => Galleria.render("artistsGrid", Galleria.artistas, 'artista'),
    categorias: () => Galleria.render("categoriasGrid", Galleria.categorias, 'categoria'),
    moderno: () => initSeccion("moderno"),
    clasico: () => initSeccion("clasico"),
    abstracto: () => initSeccion("abstracto"),
    obra: initObraDetalle,
    artista: initArtistaDetalle,
    categoria: initCategoriaDetalle
  };

  if (routes[page]) routes[page]();
}

async function initSeccion(name) {
  const obrasId = SECCIONES[name]?.categoriaPrincipal || [];
  const filtered = Galleria.obras.filter(o => obrasId.includes(o.id));
  Galleria.render("editorial-grid", filtered);
}

async function initObraDetalle() {
  const id = parseInt(getParam("id"));
  const obra = Galleria.obras.find(o => o.id === id);
  if (!obra) return;
  const artista = Galleria.artistas.find(a => a.id === obra.artistaId);

  document.querySelector(".obra-texto h1").textContent = obra.titulo;
  const imgCont = document.querySelector(".obra-imagen");
  if (imgCont) renderOptimizedImage(imgCont, obra.imagen, obra.titulo, true, "1/1");
  
  document.querySelector(".obra-texto p").innerHTML = `
    <div class="v-details">
      <ul>
        <li><strong>Artista:</strong> ${artista?.nombre || "Vértice"}</li>
        <li><strong>Técnica:</strong> ${obra.tecnica}</li>
        <li><strong>Año:</strong> ${obra.año}</li>
      </ul>
    </div>
  `;
}

async function initArtistaDetalle() {
  const id = parseInt(getParam("id"));
  const artista = Galleria.artistas.find(a => a.id === id);
  if (!artista) return;
  document.getElementById("artistaNombre").textContent = artista.nombre;
  const filtered = Galleria.obras.filter(o => o.artistaId === id);
  Galleria.render("obrasGrid", filtered);
}

async function initCategoriaDetalle() {
  const id = parseInt(getParam("id"));
  const cat = Galleria.categorias.find(c => c.id === id);
  if (!cat) return;
  const title = document.querySelector(".section-title");
  if (title) title.textContent = cat.nombre;
  const filtered = Galleria.obras.filter(o => o.categoriaPrincipal === id);
  Galleria.render("obrasGrid", filtered);
}
