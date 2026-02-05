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

  render(containerId, items, type = 'obra', append = false) {
    const grid = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
    if (!grid) return;

    if (!append) grid.innerHTML = "";
    if (items.length === 0 && !append) {
      grid.innerHTML = "<p class='v-empty'>No hay elementos en esta selección.</p>";
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement("article");
      const priority = index < 6;

      if (type === 'obra') {
        const artista = this.artistas.find(a => a.id === item.artistaId);
        card.className = "card-obra v-card";

        card.innerHTML = `
          <div class="v-card-visual">
            <div class="v-card-img-wrap"></div>
            <div class="v-card-overlay">
              <button class="favorite ${isFavorite(item.id) ? 'active' : ''}" onclick="Handle.favorite(event, ${item.id})">
                <span class="material-symbols-outlined">${isFavorite(item.id) ? 'favorite' : 'favorite_border'}</span>
              </button>
              <div class="v-card-info">
                <p class="v-card-artist">${artista?.nombre || "Vértice"}</p>
                <h2 class="v-card-title">${item.titulo}</h2>
                <div class="v-card-meta">
                  <span>${item.tecnica}</span>
                  <span class="v-sep">|</span>
                  <span>${item.año}</span>
                </div>
              </div>
            </div>
            <a href="${getPageRoute('obra-detalle.html')}?id=${item.id}" class="v-card-link"></a>
          </div>
        `;

        const imgWrap = card.querySelector(".v-card-img-wrap");
        renderOptimizedImage(imgWrap, item.imagen, item.titulo, priority, "4/5");
      }
      else if (type === 'artista') {
        card.className = "card-artista v-card";
        const imgWrap = document.createElement("div");
        renderOptimizedImage(imgWrap, item.avatar, item.nombre, priority, "1/1");
        card.appendChild(imgWrap);
        card.insertAdjacentHTML("beforeend", `
          <div class="v-card-info">
            <h3>${item.nombre}</h3>
            <a href="${getPageRoute('artista-detalle.html')}?id=${item.id}" class="v-card-link"></a>
          </div>
        `);
      }
      else if (type === 'categoria') {
        card.className = "card-categoria v-card";
        card.insertAdjacentHTML("beforeend", `
          <div class="v-card-info">
            <h3>${item.nombre}</h3>
            <a href="${getPageRoute('categoria-detalle.html')}?id=${item.id}" class="v-card-link"></a>
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
      const grid = "home-grid";
      const spans = document.querySelectorAll(".home-categories span");

      const renderCategory = (catName) => {
        // Filtrar obras por sección curatorial (usando la lógica de SECCIONES en utils.js)
        const obras = Galleria.obras.filter(o => obraEnSeccion(o, catName));
        // Tomar las primeras 5 o las que haya
        const sample = obras.slice(0, 5);
        Galleria.render(grid, sample);

        // Actualizar clase activa
        spans.forEach(s => s.classList.toggle("active", s.dataset.cat === catName));
      };

      spans.forEach(span => {
        span.onmouseenter = () => renderCategory(span.dataset.cat);
        // Si el usuario hace click, también le llevamos a la página de la categoría
        span.onclick = () => window.location.href = getPageRoute(`${span.dataset.cat}.html`);
      });

      // Render inicial (por defecto Moderno)
      renderCategory("moderno");
    },
    obras: () => {
      const grid = "obrasGrid";
      const btnVerMas = document.getElementById("btnVerMas");
      let visibleCount = 12;
      let currentItems = Galleria.obras;

      const updateGallery = () => {
        const toShow = currentItems.slice(0, visibleCount);
        Galleria.render(grid, toShow);
        if (btnVerMas) {
          btnVerMas.style.display = visibleCount < currentItems.length ? "block" : "none";
        }
      };

      if (btnVerMas) {
        btnVerMas.onclick = () => {
          visibleCount += 12;
          updateGallery();
          // Scroll suave hacia abajo para mostrar las nuevas obras
          window.scrollBy({ top: 300, behavior: 'smooth' });
        };
      }

      updateGallery();

      const search = document.getElementById("buscador");
      if (search) {
        search.oninput = () => {
          const q = search.value.toLowerCase();
          currentItems = Galleria.obras.filter(o => o.titulo.toLowerCase().includes(q));
          visibleCount = 12;
          updateGallery();
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
  const filtered = Galleria.obras.filter(o => obraEnSeccion(o, name));
  Galleria.render("editorial-grid", filtered);
}

async function initObraDetalle() {
  const id = parseInt(getParam("id"));
  const obra = Galleria.obras.find(o => o.id === id);
  if (!obra) return;
  const artista = Galleria.artistas.find(a => a.id === obra.artistaId);

  document.querySelector(".obra-texto").innerHTML = `
    <h1 class="v-title">${obra.titulo}</h1>
    <a href="${getPageRoute('artista-detalle.html')}?id=${artista?.id}" class="obra-artist-link">${artista?.nombre || "Vértice"}</a>
    
    <div class="obra-curatorial-block">
      <p class="obra-short-desc">${obra.descripcion}</p>
      
      <div class="obra-spec-grid">
        <div class="spec-item"><strong>Técnica:</strong> ${obra.tecnica}</div>
        <div class="spec-item"><strong>Año:</strong> ${obra.año}</div>
        <div class="spec-item"><strong>Dimensiones:</strong> ${obra.dimensiones}</div>
        <div class="spec-item"><strong>Época:</strong> ${obra.epoca}</div>
      </div>
    </div>
  `;
}

async function initArtistaDetalle() {
  const id = parseInt(getParam("id"));
  // Aseguramos que los datos estén cargados
  if (Galleria.artistas.length === 0) await Galleria.load();

  const artista = Galleria.artistas.find(a => a.id === id);

  if (!artista) {
    document.querySelector(".section-title").textContent = "Artista no encontrado";
    return;
  }

  // 1. INYECTAMOS NOMBRE + AVATAR EN EL HEADER
  const header = document.querySelector(".section-header");
  if (header) {
    // Usamos ../assets/img/ + el nombre del archivo del JSON
    header.innerHTML = `
      <h1 class="section-title">${artista.nombre}</h1>
      <div class="artist-header-image">
        <img src="../assets/img/${artista.avatar}" alt="${artista.nombre}">
      </div>
    `;
  }

  // 2. Generamos el perfil (Bio + Sidebar) - Esto sigue igual que antes
  const profileContainer = document.getElementById("artistProfile");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="profile-main">
        <p class="artist-bio-text">${artista.bio || "La biografía de este artista estará disponible próximamente."}</p>
      </div>

      <aside class="profile-sidebar">
        <div class="sidebar-block">
          <h3 class="sidebar-title">Reconocimientos</h3>
          <ul class="sidebar-list">
            ${(artista.premios || []).length > 0
        ? (artista.premios || []).map(p => `<li>${p}</li>`).join('')
        : '<li class="empty">Sin reconocimientos registrados</li>'}
          </ul>
        </div>
        <div class="sidebar-block">
          <h3 class="sidebar-title">Actualidad</h3>
          <p class="sidebar-text">${artista.noticias || "No hay noticias recientes."}</p>
        </div>
      </aside>
    `;
  }

  // 3. Renderizamos sus obras
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
