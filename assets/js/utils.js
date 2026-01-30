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
   JSON
================================ */

// Carga de archivos JSON respetando /pages/
async function loadJSON(file) {
  const base = getBasePath();
  const res = await fetch(`${base}/data/${file}`);
  return await res.json();
}

/* ================================
   TEXTO
================================ */

// Normaliza texto para búsquedas (acentos, mayúsculas)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  moderno: {
    categoriaPrincipal: [4, 6, 18], // Arte Digital, Conceptual, Motion
  },
  clasico: {
    categoriaPrincipal: [1, 2], // Pintura, Fotografía
  },
  abstracto: {
    categoriasSecundarias: [14], // Abstracto
  },
};

/**
 * Comprueba si una obra pertenece a una sección
 */
function obraEnSeccion(obra, seccion) {
  const config = SECCIONES[seccion];
  if (!config) return false;

  if (
    config.categoriaPrincipal &&
    config.categoriaPrincipal.includes(obra.categoriaPrincipal)
  ) {
    return true;
  }

  if (
    config.categoriasSecundarias &&
    obra.categoriasSecundarias?.some(cat =>
      config.categoriasSecundarias.includes(cat)
    )
  ) {
    return true;
  }

  return false;
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