/* ========================
   LOGIN PAGE LOGIC
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, skip to dashboard
  if (WF.isLoggedIn()) {
    window.location.href = 'pages/dashboard.html';
    return;
  }
  initIcons();

  ['loginUser', 'loginPass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  });
});

let loginInProgress = false;

function doLogin() {
  if (loginInProgress) return;
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if (!u || !p) { showToast('Ingresa usuario y contraseña', 'error'); return; }
  loginInProgress = true;
  WF.login(u);
  document.getElementById('page-login').classList.add('is-transitioning');
  const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850;
  setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, transitionDuration);
}

function togglePwd() {
  const inp = document.getElementById('loginPass');
  const ico = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.setAttribute('data-lucide', 'eye-off');
  } else {
    inp.type = 'password';
    ico.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}
