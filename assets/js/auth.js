function initAuth(page) {
  initPasswordToggle();

  if (page === "login") initLogin();
  if (page === "register") initRegister();
}

/* ================================
   TOGGLE PASSWORD
================================ */
function initPasswordToggle() {
  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = button
        .closest(".form-password")
        ?.querySelector("input");

      if (!input) return;

      const visible = input.type === "text";
      input.type = visible ? "password" : "text";

      button.innerHTML = visible
        ? `<i class="fa-regular fa-eye"></i>`
        : `<i class="fa-regular fa-eye-slash"></i>`;
    });
  });
}

/* ================================
   AUTH TRANSITIONS
================================ */

function goToAuth(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}

/* ================================
   RENDER USER NAME (ROBUSTO)
================================ */

function renderUserName() {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll(".user-name").forEach(el => {
    el.textContent = user.name;
  });
}

/* ================================
   REGISTER
================================ */

function initRegister() {
  const form = document.querySelector(".form-auth");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.querySelector("#nombre").value.trim();
    const email = form.querySelector("#email").value.trim();
    const password = form.querySelector("#password").value;
    const role = form.querySelector("#tipo").value;

    if (!name || !email || !password || !role) {
      alert("Completa todos los campos");
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      alert("Este correo ya existe");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    saveUsers(users);
    setSession(newUser);

    goToAuth("login.html");
  });
}

/* ================================
   LOGIN
================================ */

function initLogin() {
  const form = document.querySelector(".form-auth");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const email = form.querySelector("#email").value.trim();
    const password = form.querySelector("#password").value;

    const users = getUsers();
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      alert("Correo o contraseña incorrectos");
      return;
    }

    setSession(user);
    window.location.href = "../index.html";
  });
}

/* ================================
   LOGOUT
================================ */

function logout() {
  const user = getCurrentUser();
  if (!user) return;

  clearSession();
  window.location.href = "login.html";
}

/* ================================
   INIT GENERAL
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  initAuth(page);

  // Por si el header ya está cargado
  renderUserName();
});

/* ================================
   USER MENU DROPDOWN (ROBUSTO)
   ✔ Funciona con partials
================================ */

document.addEventListener("click", (e) => {
  const menu = document.querySelector(".user-menu");
  if (!menu) return;

  const trigger = e.target.closest("#userTrigger");

  // Click en el botón de usuario → toggle
  if (trigger) {
    e.stopPropagation();
    renderUserName(); // ⬅️ CLAVE: el header ya existe aquí
    menu.classList.toggle("open");
    return;
  }

  // Click fuera → cerrar
  menu.classList.remove("open");
});

/* ================================
   AUTO-RENDER USER NAME (SIN CLICK)
================================ */

const userNameObserver = new MutationObserver(() => {
  const userNameEl = document.querySelector(".user-name");
  const user = getCurrentUser();

  if (user && userNameEl && !userNameEl.textContent) {
    userNameEl.textContent = user.name;
  }
});

// Observa cambios en el body (cuando se inserta el header)
userNameObserver.observe(document.body, {
  childList: true,
  subtree: true
});
