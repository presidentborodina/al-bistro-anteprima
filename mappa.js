/* Mappa di Google caricata solo su richiesta (Google usa cookie propri).
   Vale per i riquadri .map (Feste, Assemblee) e .map-ph (Contatti): il pulsante dentro al riquadro
   sostituisce il segnaposto con la mappa vera. Stili in base.css. */
(function () {
  var src = 'https://www.google.com/maps?q=Al+Bistr%C3%B2+Via+delle+Ande+16+Milano&z=16&output=embed';
  document.querySelectorAll('.map, .map-ph').forEach(function (box) {
    var btn = box.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = src;
      f.title = 'Mappa: Al Bistrò, via delle Ande 16, Milano';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      box.textContent = '';
      box.classList.add('aperta');
      box.appendChild(f);
    });
  });
})();
