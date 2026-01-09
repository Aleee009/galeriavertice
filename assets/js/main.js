document.addEventListener("DOMContentLoaded", () => {
  cargarHeaderFooter();
  controlarSesion();
});

/* ================================
   CARGA HEADER Y FOOTER
================================ */
function cargarHeaderFooter() {
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");

  if (header) {
    fetch("../partials/header.html")
      .then(res => res.text())
      .then(html => {
        header.innerHTML = html;
        configurarHeader();
      });
  }

  if (footer) {
    fetch("../partials/footer.html")
      .then(res => res.text())
      .then(html => footer.innerHTML = html);
  }
}

/* ================================
   CONTROL DE SESIÓN
================================ */
function controlarSesion() {
  const userType = localStorage.getItem("userType");

  // Páginas protegidas
  const page = document.body.dataset.page;
  const protegidas = ["perfil-artista", "perfil-usuario"];

  if (protegidas.includes(page) && !userType) {
    window.location.href = "login.html";
  }
}

/* ================================
   CONFIGURAR HEADER
================================ */
function configurarHeader() {
  const userType = localStorage.getItem("userType");
  const actions = document.querySelector(".user-actions");

  if (!actions) return;

  if (userType) {
    const perfilLink =
      userType === "artista"
        ? "../pages/perfil-artista.html"
        : "../pages/perfil-usuario.html";

    actions.innerHTML = `
      <a href="${perfilLink}" class="btn">Mi perfil</a>
      <button id="logoutBtn" class="btn">Cerrar sesión</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("userType");
      localStorage.removeItem("favorites");
      window.location.href = "../index.html";
    });
  }
}
