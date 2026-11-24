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
    // data-full sul <button>: la foto intera da aprire a tutto schermo quando nel riquadro c'e' un ritaglio
    // (si usa solo il nome del file, nella stessa cartella della foto del riquadro: cosi' vale anche nelle pagine inglesi)
    var foto = b.map(function (x) {
      var im = x.querySelector('img'), src = im.getAttribute('src'), full = x.getAttribute('data-full');
      if (full) src = src.replace(/[^\/]+$/, '') + full.replace(/^.*\//, '');
      return { src: src, alt: im.getAttribute('alt') };
    });
    b.forEach(function (x, k) { x.addEventListener('click', function () { apri(foto, k, null, x); }); });
  });

  // mosaico nel riquadro delle foto (.pics.collage): ogni foto si apre a tutto schermo e da li' si sfogliano tutte,
  // anche quelle oltre la quarta, che nel mosaico non si vedono
  document.querySelectorAll('.pics.collage').forEach(function (box) {
    var im = [].slice.call(box.querySelectorAll('img'));
    var foto = im.map(function (x) { return { src: x.getAttribute('src'), alt: x.getAttribute('alt') }; });
    im.forEach(function (x, k) {
      x.tabIndex = 0;
      x.setAttribute('role', 'button');
      x.addEventListener('click', function () { apri(foto, k, null, x); });
      x.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apri(foto, k, null, x); } });
    });
    if (im.length > 4) {                      // le foto in piu': un'etichetta "+N foto" che apre la prima nascosta
      var piu = document.createElement('button');
      piu.type = 'button';
      piu.className = 'pics-piu';
      piu.textContent = '+' + (im.length - 4) + (EN ? (im.length - 4 === 1 ? ' photo' : ' photos') : ' foto');
      piu.setAttribute('aria-label', EN ? 'See the other photos' : 'Guarda le altre foto');
      piu.addEventListener('click', function () { apri(foto, 4, null, piu); });
      box.appendChild(piu);
    }
  });

  // foto a coppie (.pics.scorri): due visibili alla volta; con piu' di due compaiono le frecce e scorrono da sole.
  // Per aggiungere una foto basta un altro <img> dentro .pics-t.
  document.querySelectorAll('.pics.scorri').forEach(function (box) {
    var t = box.querySelector('.pics-t'), im = [].slice.call(t.querySelectorAll('img'));
    var foto = im.map(function (x) { return { src: x.getAttribute('src') || x.getAttribute('data-src'), alt: x.getAttribute('alt') }; });
    var i = 0, max = Math.max(0, im.length - 2), auto = true, vis = true;
    function vaiA(n) {
      i = n > max ? 0 : (n < 0 ? max : n);
      t.style.transform = 'translateX(calc(' + i + ' * (-50% - 6px)))';
    }
    im.forEach(function (x, k) {
      x.tabIndex = 0;
      x.setAttribute('role', 'button');
      function apriFoto() { auto = false; apri(foto, k, null, x); }
      x.addEventListener('click', apriFoto);
      x.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apriFoto(); } });
    });
    if (max < 1) return;
    [['pics-p', '&lsaquo;', EN ? 'Previous photos' : 'Foto precedenti', -1], ['pics-n', '&rsaquo;', EN ? 'Next photos' : 'Foto successive', 1]].forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = d[0]; b.innerHTML = d[1]; b.setAttribute('aria-label', d[2]);
      b.addEventListener('click', function () { auto = false; vaiA(i + d[3]); });
      box.appendChild(b);
    });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { auto = false; vaiA(i + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (window.IntersectionObserver) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(box);
      setInterval(function () { if (auto && vis && !document.hidden && (!lb || lb.hidden)) vaiA(i + 1); }, 5000);
    }
  });

  document.querySelectorAll('.galleria').forEach(function (g) {
    var main = g.querySelector('.gal-main');
    if (!main) return;                        // <section class="galleria"> con il mosaico fisso (Menu' Ristorante, Pizza)
    var mi = main.querySelector('img');
    var th = [].slice.call(g.querySelectorAll('.gal-thumbs button'));
    var foto = th.map(function (b) {
      var bi = b.querySelector('img');
      return { src: bi.getAttribute('src'), srcset: bi.getAttribute('srcset'), pos: b.getAttribute('data-pos') || '',
               alt: b.getAttribute('aria-label').replace(/^(Mostra|Show): /, '') };
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
        // versioni leggere: si prendono dalla miniatura (stesso elenco di copie WebP), altrimenti resta il JPEG
        if (foto[i].srcset) mi.setAttribute('srcset', foto[i].srcset); else mi.removeAttribute('srcset');
        mi.style.objectPosition = foto[i].pos;
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
