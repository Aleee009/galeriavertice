document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     HEADER (con / sin sesión)
  ================================ */

  const headerContainer = document.getElementById("header");

  if (headerContainer) {
    const isLoggedIn = localStorage.getItem("userLoggedIn");

    const headerFile = isLoggedIn
      ? "/partials/header.html"          // CON sesión
      : "/partials/header_sesion.html";  // SIN sesión

    fetch(headerFile)
      .then(res => res.text())
      .then(html => {
        headerContainer.innerHTML = html;
      })
      .catch(err => {
        console.error("Error cargando el header:", err);
      });
  }

  /* ================================
     CONTEXTO DE PÁGINA
  ================================ */

  const page = document.body.dataset.page;

  /* ================================
     REGISTRO
  ================================ */

  if (page === "registro") {
    const form = document.querySelector(".register-form");
    const userTypeSelect = document.querySelector("#userType");

    if (!form || !userTypeSelect) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userType = userTypeSelect.value;

      if (!userType) {
        alert("Selecciona un tipo de usuario");
        return;
      }

      // Guardar tipo de usuario
      localStorage.setItem("userType", userType);
      localStorage.setItem("userLoggedIn", "true");

      // Redirección según rol
      if (userType === "artista") {
        window.location.href = "perfil-artista.html";
      } else if (userType === "usuario") {
        window.location.href = "perfil-usuario.html";
      }
    });
  }

  /* ================================
     LOGIN
  ================================ */

  if (page === "login") {
    const form = document.querySelector(".login-form");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userType = localStorage.getItem("userType");

      if (!userType) {
        alert("No existe una cuenta registrada");
        return;
      }

      // Marcar sesión como iniciada
      localStorage.setItem("userLoggedIn", "true");

      if (userType === "artista") {
        window.location.href = "perfil-artista.html";
      } else if (userType === "usuario") {
        window.location.href = "perfil-usuario.html";
      }
    });
  }

});
