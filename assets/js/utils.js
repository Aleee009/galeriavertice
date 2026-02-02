/* ================================
   URL Y NAVEGACIÓN
================================ */

// Obtener parámetro de la URL (?id=3, ?seccion=moderno, etc.)
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Navegar a otra página con parámetros opcionales
function goTo(page, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.href = query ? `${page}?${query}` : page;
}

// Base path automático (home vs /pages)
function getBasePath() {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

// Resuelve la ruta a una página interna (.html) respetando la ubicación actual
function getPageRoute(pageFile) {
  const base = getBasePath();
  // El index siempre está en la raíz
  if (pageFile === "index.html") return `${base}/index.html`;
  // Si ya estamos en /pages, el resto de páginas están en el mismo nivel
  if (base === "..") return pageFile;
  // Si estamos en la raíz, el resto de páginas están en /pages
  return `pages/${pageFile}`;
}

/* ================================
   LOCAL STORAGE
================================ */

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

function remove(key) {
  localStorage.removeItem(key);
}

/* ================================
   FAVORITOS
================================ */

function getFavorites() {
  return load("favorites", []);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  let favs = getFavorites();

  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }

  save("favorites", favs);
  return favs;
}

/* ================================
   JSON & CACHE
================================ */

const dataCache = new Map();

// Carga de archivos JSON respetando /pages/ con caché interna
async function loadJSON(file) {
  if (dataCache.has(file)) return dataCache.get(file);

  try {
    const base = getBasePath();
    const res = await fetch(`${base}/data/${file}`);
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    const data = await res.json();
    dataCache.set(file, data);
    return data;
  } catch (err) {
    console.error(`[loadJSON] Error cargando ${file}:`, err);
    return null;
  }
}

// Pre-carga paralela de los archivos críticos
async function preloadGlobals() {
  console.log("[Performance] Preloading globals in parallel...");
  return Promise.all([
    loadJSON("categorias.json"),
    loadJSON("artistas.json"),
    loadJSON("obras.json")
  ]);
}

/* ================================
   TEXTO Y FECHAS
================================ */

// Normaliza texto para búsquedas (acentos, mayúsculas)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatNewsDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

/* ================================
   UI HELPERS
================================ */

function initCarouselControls(track) {
  // Lógica básica para el carrusel si es necesaria
  if (track) track.style.opacity = "1";
}

/**
 * Renderiza una imagen con optimizaciones extremas
 */
function renderOptimizedImage(container, src, alt, priority = false, aspectRatio = "4/5") {
  const base = getBasePath();
  
  container.classList.add("image-reveal-container");
  container.style.aspectRatio = aspectRatio;
  // Mantenemos el fondo para el efecto shimmer
  container.style.position = "relative";

  // Si la prioridad es alta, inyectamos directamente
  if (priority) {
    container.innerHTML = `
      <img src="${base}/assets/img/${src}" 
           alt="${alt}" 
           fetchpriority="high"
           onload="this.parentElement.classList.add('loaded')"
           style="opacity: 0; transition: opacity 0.8s ease-in-out; width: 100%; height: 100%; object-fit: cover;">
    `;
    return;
  }

  // Si no es prioritaria, usamos el observer para no saturar el ancho de banda
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        container.innerHTML = `
          <img src="${base}/assets/img/${src}" 
               alt="${alt}" 
               loading="lazy"
               onload="this.parentElement.classList.add('loaded')"
               style="opacity: 0; transition: opacity 0.8s ease-in-out; width: 100%; height: 100%; object-fit: cover;">
        `;
        observer.unobserve(container);
      }
    });
  }, { rootMargin: '200px' }); // Cargar 200px antes de que llegue

  observer.observe(container);
}

/* ================================
   SISTEMA CURATORIAL · CATEGORÍAS
   (MODELO NUEVO)
================================ */

/**
 * Mapa único de secciones curatoriales
 * 👉 un solo sitio donde se define la lógica
 */
const SECCIONES = {
  moderno: "moderno",
  clasico: "clasico",
  abstracto: "abstracto",
};

/**
 * Comprueba si una obra pertenece a una sección curatorial
 */
function obraEnSeccion(obra, seccion) {
  const targetEpoca = SECCIONES[seccion];
  return obra && obra.epoca === targetEpoca;
}

/**
 * Filtra obras por sección curatorial
 */
function filtrarPorSeccion(obras, seccion) {
  return obras.filter(obra => obraEnSeccion(obra, seccion));
}

/**
 * Filtra obras por categoría concreta
 * (principal o secundaria)
 */
function filtrarPorCategoria(obras, categoriaId) {
  return obras.filter(
    obra =>
      obra.categoriaPrincipal === categoriaId ||
      obra.categoriasSecundarias?.includes(categoriaId)
  );
}

/**
 * Filtra obras por tag
 */
function filtrarPorTag(obras, tag) {
  return obras.filter(obra => obra.tags?.includes(tag));
}

/* ================================
   AUTH · LOCAL STORAGE
================================ */

function getUsers() {
  return load("users", []);
}

function saveUsers(users) {
  save("users", users);
}

function getSession() {
  return load("session", null);
}

function setSession(user) {
  save("session", { userId: user.id });
}

function clearSession() {
  remove("session");
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
}