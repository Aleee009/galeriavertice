document.addEventListener("DOMContentLoaded", () => {
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

      // Guardamos el tipo de usuario
      localStorage.setItem("userType", userType);

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

      if (userType === "artista") {
        window.location.href = "perfil-artista.html";
      } else if (userType === "usuario") {
        window.location.href = "perfil-usuario.html";
      }
    });
  }
});
