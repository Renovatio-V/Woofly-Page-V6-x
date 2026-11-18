/* ========================
   LOGIN PAGE LOGIC
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
  if (WF.isLoggedIn()) {
    window.location.href = 'pages/dashboard.html';
    return;
  }
  initIcons();

  document.getElementById('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    doLogin();
  });
  document.getElementById('registerForm').addEventListener('submit', event => {
    event.preventDefault();
    doRegister();
  });
  document.getElementById('openRegister').addEventListener('click', openRegister);
  document.getElementById('closeRegister').addEventListener('click', closeRegister);
  document.getElementById('backToLogin').addEventListener('click', closeRegister);
  document.querySelectorAll('.register-password-toggle').forEach(button => {
    button.addEventListener('click', () => toggleRegisterPassword(button));
  });
  document.getElementById('registerOverlay').addEventListener('click', event => {
    if (event.target === event.currentTarget) closeRegister();
  });
});

let loginInProgress = false;
let passwordTypingTimer = null;

function doLogin() {
  if (loginInProgress) return;
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if (!u || !p) { showToast('Ingresa usuario y contraseña', 'error'); return; }
  if (!WF.login(u, p)) {
    showToast('Usuario o contraseña incorrectos', 'error');
    return;
  }
  startDashboardTransition();
}

function doRegister() {
  const name = document.getElementById('registerName').value.trim();
  const username = document.getElementById('registerUser').value.trim();
  const password = document.getElementById('registerPass').value;
  const confirmation = document.getElementById('registerConfirm').value;
  if (password !== confirmation) {
    showToast('Las contraseñas no coinciden', 'error');
    document.getElementById('registerConfirm').focus();
    return;
  }
  if (!WF.register(name, username, password)) {
    showToast('Ese usuario ya está registrado', 'error');
    document.getElementById('registerUser').focus();
    return;
  }
  closeRegister();
  document.getElementById('registerForm').reset();
  document.getElementById('loginUser').value = username;
  const loginPassword = document.getElementById('loginPass');
  loginPassword.value = '';
  loginPassword.focus();
  typePasswordIntoLogin(password);
  showToast('Cuenta creada. Inicia sesión cuando termine de escribirse la contraseña.', 'success');
}

function typePasswordIntoLogin(password) {
  if (passwordTypingTimer !== null) {
    clearInterval(passwordTypingTimer);
    passwordTypingTimer = null;
  }
  const input = document.getElementById('loginPass');
  const submitButton = document.querySelector('#loginForm .btn-primary');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    input.value = password;
    input.disabled = false;
    submitButton.disabled = false;
    return;
  }
  input.disabled = true;
  submitButton.disabled = true;
  let visibleCharacters = 0;
  passwordTypingTimer = window.setInterval(() => {
    visibleCharacters++;
    input.value = password.slice(0, visibleCharacters);
    if (visibleCharacters === password.length) {
      clearInterval(passwordTypingTimer);
      passwordTypingTimer = null;
      input.disabled = false;
      submitButton.disabled = false;
    }
  }, 1000 / password.length);
}

function startDashboardTransition() {
  if (loginInProgress) return;
  loginInProgress = true;
  document.getElementById('page-login').classList.add('is-transitioning');
  const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850;
  setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, transitionDuration);
}

function openRegister() {
  if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
    showToast('No se pudo generar una contraseña segura en este navegador.', 'error');
    return;
  }
  const generatedPassword = createGeneratedPassword();
  const form = document.getElementById('registerForm');
  form.reset();
  document.getElementById('registerPass').value = generatedPassword;
  document.getElementById('registerConfirm').value = generatedPassword;
  document.querySelectorAll('.register-password-toggle').forEach(button => {
    document.getElementById(button.dataset.target).type = 'password';
    button.textContent = 'Mostrar';
    button.setAttribute('aria-label', button.dataset.target === 'registerPass'
      ? 'Mostrar contraseña'
      : 'Mostrar confirmación de contraseña');
  });
  const overlay = document.getElementById('registerOverlay');
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('page-login').classList.add('registration-open');
  document.getElementById('registerName').focus();
}

function closeRegister() {
  const overlay = document.getElementById('registerOverlay');
  if (overlay.hidden) return;
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('page-login').classList.remove('registration-open');
  document.getElementById('openRegister').focus();
}

function createGeneratedPassword() {
  const characterSets = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%&*+-_'
  ];
  const allCharacters = characterSets.join('');
  const randomValues = new Uint32Array(31);
  window.crypto.getRandomValues(randomValues);
  const characters = characterSets.map((set, index) => set[randomValues[index] % set.length]);
  for (let index = characterSets.length; index < 16; index++) {
    characters.push(allCharacters[randomValues[index] % allCharacters.length]);
  }
  for (let index = characters.length - 1, randomIndex = 16; index > 0; index--, randomIndex++) {
    const swapIndex = randomValues[randomIndex] % (index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters.join('');
}

function toggleRegisterPassword(button) {
  const input = document.getElementById(button.dataset.target);
  const showPassword = input.type === 'password';
  input.type = showPassword ? 'text' : 'password';
  button.textContent = showPassword ? 'Ocultar' : 'Mostrar';
  button.setAttribute('aria-label', showPassword
    ? 'Ocultar contraseña'
    : input.id === 'registerPass' ? 'Mostrar contraseña' : 'Mostrar confirmación de contraseña');
}

document.addEventListener('keydown', event => {
  const overlay = document.getElementById('registerOverlay');
  if (!overlay || overlay.hidden) return;
  if (event.key === 'Escape') {
    closeRegister();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = overlay.querySelectorAll('button:not([disabled]), input:not([disabled])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function togglePwd() {
  const inp = document.getElementById('loginPass');
  const ico = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.setAttribute('data-lucide', 'eye-off');
    document.querySelector('.toggle-pwd').setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    inp.type = 'password';
    ico.setAttribute('data-lucide', 'eye');
    document.querySelector('.toggle-pwd').setAttribute('aria-label', 'Mostrar contraseña');
  }
  initIcons();
}
