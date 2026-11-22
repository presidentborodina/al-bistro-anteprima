/* Schede del menu (nav.tabs: La cucina · Le pizze · Drink) nelle pagine Pizza e sera.
   1) Le sezioni a cui portano le schede si fermano sotto la testata e la barra delle schede,
      non nascoste dietro (scroll-margin-top calcolato sulle misure reali).
   2) La scheda evidenziata segue la sezione che si sta guardando. */
(function () {
  var tabs = document.querySelector('nav.tabs');
  if (!tabs) return;
  var voci = [].slice.call(tabs.querySelectorAll('a[href^="#"]')).filter(function (a) {
    return a.getAttribute('href').length > 1 && document.getElementById(a.getAttribute('href').slice(1));
  });
  if (!voci.length) return;
  var sez = voci.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });

  // bordo inferiore della barra delle schede quando e' agganciata in alto
  function soglia() {
    return (parseFloat(getComputedStyle(tabs).top) || 0) + tabs.offsetHeight;
  }
  function margini() {
    var s = soglia() + 16;
    sez.forEach(function (x) { x.style.scrollMarginTop = s + 'px'; });
  }
  function segna() {
    var s = soglia() + 40, attiva = 0;
    sez.forEach(function (x, i) { if (x.getBoundingClientRect().top <= s) attiva = i; });
    voci.forEach(function (a, i) { a.classList.toggle('on', i === attiva); });
  }

  margini();
  addEventListener('resize', function () { margini(); segna(); });
  addEventListener('scroll', segna, { passive: true });
  // arrivo da un'altra pagina con l'ancora (es. pizza.html#pizze): riallinea dopo aver messo i margini
  if (location.hash) {
    var t = document.getElementById(location.hash.slice(1));
    if (t && sez.indexOf(t) >= 0) setTimeout(function () { t.scrollIntoView(); segna(); }, 60);
  }
  segna();
})();
