/* Galleria: una foto grande con le miniature sotto (stili in base.css: .galleria, .lb).
   - le miniature scelgono la foto grande;
   - finche' nessuno tocca, la foto cambia da sola ogni 4,5 secondi (non con "riduci movimento",
     non quando la galleria e' fuori dallo schermo);
   - toccando la foto grande si apre a tutto schermo: frecce, tasti freccia, scorrimento col dito,
     Esc o X per chiudere.
   Le foto e le didascalie si leggono dalle miniature: per aggiungerne una basta un altro <button>. */
(function () {
  var lb, lbImg, lbCap, lista = [], pos = 0, alCambio = null, ritorno = null;
  var EN = document.documentElement.lang === 'en';

  function creaLb() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', (EN ? 'Full-screen photo' : 'Foto a tutto schermo'));
    lb.innerHTML = '<button type="button" class="lb-x" aria-label="' + (EN ? 'Close' : 'Chiudi') + '">&times;</button>' +
      '<button type="button" class="lb-p" aria-label="' + (EN ? 'Previous photo' : 'Foto precedente') + '">&lsaquo;</button>' +
      '<img alt="">' +
      '<button type="button" class="lb-n" aria-label="' + (EN ? 'Next photo' : 'Foto successiva') + '">&rsaquo;</button>' +
      '<p class="lb-c"></p>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('.lb-c');
    lb.querySelector('.lb-x').addEventListener('click', chiudi);
    lb.querySelector('.lb-p').addEventListener('click', function () { vai(pos - 1); });
    lb.querySelector('.lb-n').addEventListener('click', function () { vai(pos + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) chiudi(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') chiudi();
      else if (e.key === 'ArrowLeft') vai(pos - 1);
      else if (e.key === 'ArrowRight') vai(pos + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) vai(pos + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function vai(n) {
    pos = (n + lista.length) % lista.length;
    lbImg.src = lista[pos].src;
    lbImg.alt = lista[pos].alt;
    lbCap.textContent = lista[pos].alt + ' · ' + (pos + 1) + (EN ? ' of ' : ' di ') + lista.length;
    if (alCambio) alCambio(pos);
  }

  function apri(foto, da, cb, chi) {
    if (!lb) creaLb();
    lista = foto; alCambio = cb; ritorno = chi;
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    vai(da);
    lb.querySelector('.lb-x').focus();
  }

  function chiudi() {
    lb.hidden = true;
    document.documentElement.style.overflow = '';
    if (ritorno) ritorno.focus();
  }

  // mosaico: ogni riquadro apre la foto a tutto schermo, e da li' si sfogliano tutte
  document.querySelectorAll('.mosaico').forEach(function (m) {
    var b = [].slice.call(m.querySelectorAll('button'));
    var foto = b.map(function (x) { var im = x.querySelector('img'); return { src: im.getAttribute('src'), alt: im.getAttribute('alt') }; });
    b.forEach(function (x, k) { x.addEventListener('click', function () { apri(foto, k, null, x); }); });
  });

  document.querySelectorAll('.galleria').forEach(function (g) {
    var main = g.querySelector('.gal-main'), mi = main.querySelector('img');
    var th = [].slice.call(g.querySelectorAll('.gal-thumbs button'));
    var foto = th.map(function (b) {
      return { src: b.querySelector('img').getAttribute('src'), alt: b.getAttribute('aria-label').replace(/^Mostra: /, '') };
    });
    var i = 0, auto = true, vis = true;

    function mostra(n) {
      n = (n + foto.length) % foto.length;
      if (n === i) return;
      i = n;
      th.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      main.classList.add('cambia');
      setTimeout(function () {
        var fatto = function () { main.classList.remove('cambia'); };
        mi.onload = fatto;
        mi.removeAttribute('srcset'); // le versioni leggere valgono solo per la prima foto
        mi.src = foto[i].src;
        mi.alt = foto[i].alt;
        if (mi.complete) fatto();
      }, 350);
    }

    th.forEach(function (b, k) { b.addEventListener('click', function () { auto = false; mostra(k); }); });
    main.addEventListener('click', function () { auto = false; apri(foto, i, mostra, main); });

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (window.IntersectionObserver) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(g);
      setInterval(function () { if (auto && vis && !document.hidden) mostra(i + 1); }, 4500);
    }
  });
})();
