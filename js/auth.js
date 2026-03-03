/**
 * auth.js – Supabase-Auth: Login, Session-Check, Logout
 *
 * Verwendet auf:
 * - index.html (Landing Page): Login-Formular
 * - map.html (Karte): Session-Check + Logout
 */

(function () {
  const SUPABASE_URL = 'https://kwwyyuqwrkgyyaxnaipe.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eapfujf9HCWaFhMLZmQaVQ_FvcBiDnD';

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Auf welcher Seite sind wir?
  const isLanding = document.getElementById('login-form') !== null;
  const isMap = document.getElementById('map') !== null && !isLanding;

  // ── Landing Page: Login-Formular ──────────────────────────────────
  if (isLanding) {
    // Wenn schon eingeloggt → direkt zur Karte
    sb.auth.getSession().then(function (res) {
      if (res.data.session) {
        window.location.href = 'map.html';
      }
    });

    var form = document.getElementById('login-form');
    var errorEl = document.getElementById('login-error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorEl.classList.add('hidden');

      var email = form.user.value.trim();
      var pass = form.pass.value;

      // Falls kein @ im Zugangsname: automatisch @gtasnp.haw-kiel.de anhängen
      if (email.indexOf('@') === -1) {
        email = email + '@gtasnp.haw-kiel.de';
      }

      sb.auth.signInWithPassword({ email: email, password: pass })
        .then(function (res) {
          if (res.error) {
            errorEl.textContent = 'Zugangsname oder Passwort falsch.';
            errorEl.classList.remove('hidden');
          } else {
            window.location.href = 'map.html';
          }
        });
    });
  }

  // ── Karten-Seite: Session prüfen ──────────────────────────────────
  if (isMap) {
    sb.auth.getSession().then(function (res) {
      if (!res.data.session) {
        window.location.href = 'index.html';
      }
    });

    var logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        sb.auth.signOut().then(function () {
          window.location.href = 'index.html';
        });
      });
    }
  }

  // Global verfügbar machen für andere Module
  window._supabaseAuth = sb;
})();
