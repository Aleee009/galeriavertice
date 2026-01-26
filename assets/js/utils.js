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
   JSON
================================ */
async function loadJSON(file) {
  const base = window.location.pathname.includes("/pages/") ? ".." : ".";
  const res = await fetch(`${base}/data/${file}`);
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