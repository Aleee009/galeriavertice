/* ================================
   INIT GENERAL
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initSlidingLogic();
  initPasswordToggle();
  initRegister();
  initLogin();
  renderUserName();
  initCustomSelect();
});

/* ================================
   1. LOGICA DE ANIMACIÓN (SLIDING)
================================ */
function initSlidingLogic() {
  const container = document.getElementById('auth-container');

  // Botones del Overlay (Desktop)
  const signUpBtn = document.getElementById('signUp');
  const signInBtn = document.getElementById('signIn');

  // Enlaces de Móvil
  const mobileSignUpLink = document.getElementById('to-signup-mobile');
  const mobileSignInLink = document.getElementById('to-signin-mobile');

  // Función para activar panel derecho (Registro)
  const showRegister = (e) => {
    if (e) e.preventDefault();
    container.classList.add("right-panel-active");
  };

  // Función para desactivar panel derecho (volver a Login)
  const showLogin = (e) => {
    if (e) e.preventDefault();
    container.classList.remove("right-panel-active");
  };

  // Listeners
  if (signUpBtn) signUpBtn.addEventListener('click', showRegister);
  if (signInBtn) signInBtn.addEventListener('click', showLogin);
  if (mobileSignUpLink) mobileSignUpLink.addEventListener('click', showRegister);
  if (mobileSignInLink) mobileSignInLink.addEventListener('click', showLogin);
}

/* ================================
   2. TOGGLE PASSWORD
================================ */
function initPasswordToggle() {
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      // Buscamos el input hermano dentro del mismo grupo
      const input = button.parentElement.querySelector("input");
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
   3. REGISTRO (LOGICA DE NEGOCIO)
================================ */
function initRegister() {
  const form = document.getElementById("form-register");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-pass").value;

    // CAPTURAMOS EL ROL AQUÍ
    const roleSelect = document.getElementById("register-role");
    const role = roleSelect ? roleSelect.value : "usuario"; // Fallback por seguridad

    if (!name || !email || !password || !role) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const users = getUsers(); // Asumiendo que esta función viene de utils.js

    if (users.some((u) => u.email === email)) {
      alert("Este correo ya está registrado.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role, // Guardamos el rol (artista/usuario)
    };

    users.push(newUser);
    saveUsers(users);
    setSession(newUser);

    alert("¡Registro completado! Bienvenido.");

    // Redirigir
    window.location.href = "../index.html";
  });
}

/* ================================
   4. LOGIN (LOGICA DE NEGOCIO)
================================ */
function initLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Obtenemos valores del formulario de login
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-pass").value;

    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
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
   5. UTILS UI (RENDER NAME & LOGOUT)
================================ */
function renderUserName() {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll(".user-name").forEach((el) => {
    el.textContent = user.name;
  });
}

function logout() {
  clearSession();
  window.location.href = "../index.html";
}

/* Dropdown Menu (si lo usas en el header) */
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".user-menu");
  if (!menu) return;

  const trigger = e.target.closest("#userTrigger");

  if (trigger) {
    e.stopPropagation();
    renderUserName(); // Asegura tener el nombre actualizado
    menu.classList.toggle("open");
    return;
  }
  menu.classList.remove("open");
});

/* ================================
   LOGICA CUSTOM SELECT
================================ */
function initCustomSelect() {
  const wrapper = document.querySelector('.custom-select-wrapper');
  if (!wrapper) return;

  const trigger = wrapper.querySelector('.custom-select-trigger');
  const options = wrapper.querySelectorAll('.custom-option');
  const hiddenInput = document.getElementById('register-role');
  const selectedText = document.getElementById('role-selected-text');

  // 1. Abrir / Cerrar al hacer click
  trigger.addEventListener('click', () => {
    wrapper.classList.toggle('open');
  });

  // 2. Seleccionar opción
  options.forEach(option => {
    option.addEventListener('click', () => {
      // Obtenemos el valor y el texto
      const value = option.dataset.value;
      const text = option.textContent;

      // Actualizamos la UI
      selectedText.textContent = text;
      trigger.classList.add('has-value'); // Para poner el texto en negro

      // Actualizamos el input oculto (para que el formulario funcione)
      hiddenInput.value = value;

      // Cerramos
      wrapper.classList.remove('open');
    });
  });

  // 3. Cerrar si clickamos fuera
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
    }
  });
}

