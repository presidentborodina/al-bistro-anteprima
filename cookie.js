/* Consenso per la mappa di Google (26/11/2026).
   Le pagine con la mappa hanno l'iframe con data-src al posto di src: la mappa si carica
   solo dopo «Accetta». La scelta resta nel browser per sei mesi (localStorage, chiave
   "albistro-mappa"), poi la domanda torna. Nella pagina Privacy il pulsante
   [data-cookie-reset] cancella la scelta. I testi stanno nell'HTML, così vengono tradotti
   in inglese come il resto della pagina. */
(function () {
  var KEY = 'albistro-mappa', DURATA = 180 * 24 * 3600 * 1000;

  function leggi() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (v.s === 'si' || v.s === 'no') && Date.now() - v.t < DURATA) return v.s;
    } catch (e) {}
    return null;
  }
  function salva(s) {
    try { localStorage.setItem(KEY, JSON.stringify({ s: s, t: Date.now() })); } catch (e) {}
  }

  var banner = document.getElementById('cookie-banner');
  var mappe = document.querySelectorAll('iframe[data-src]');

  function mostraMappe() {
    mappe.forEach(function (f) {
      if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
      f.parentNode.classList.add('aperta');
    });
  }
  function chiudiBanner() { if (banner) banner.hidden = true; }

  function scegli(s) {
    salva(s);
    chiudiBanner();
    if (s === 'si') mostraMappe();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cookie]');
    if (b) { e.preventDefault(); scegli(b.getAttribute('data-cookie')); return; }
    var r = e.target.closest('[data-cookie-reset]');
    if (r) {
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch (err) {}
      var ok = document.getElementById('cookie-reset-ok');
      if (ok) ok.hidden = false;
    }
  });

  var scelta = leggi();
  if (scelta === 'si') mostraMappe();
  else if (scelta === null && banner && mappe.length) banner.hidden = false;
})();
