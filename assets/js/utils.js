/* ================================
   URL Y NAVEGACIÓN
================================ */

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function goTo(page, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.href = query ? `${page}?${query}` : page;
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
   DATOS (JSON)
================================ */

async function loadJSON(file) {
  const res = await fetch(`../data/${file}`);
  return await res.json();
}

/* ================================
   TEXTO
================================ */

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
