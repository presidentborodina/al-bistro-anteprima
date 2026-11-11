/* Allinea il graticcio ai rombi di fondo: le diagonali continuano da una sezione all'altra.
   Rombi di fondo (pattern-bistro.png a 450px): passo 112.5 x 110.6.
   Graticcio (modulo 112.5 x 110.6): origine (13.8, 18.0) dal body: le linee cadono sulle fasce chiare continue del fondo (fasi misurate con istogramma diagonale), misurata sui punti d'incrocio delle fasce chiare del fondo.
   La fascia viene spostata leggermente in basso perché il bordo superiore cada su una riga d'incrocio:
   così in alto e in basso non restano triangolini tagliati. */
(function () {
  const OX = 13.8, OY = 18.0, PX = 112.5, PY = 110.6;
  const mod = (a, m) => ((a % m) + m) % m;

  function snapTop() {
    document.querySelectorAll('.m-graticcio').forEach(el => {
      el.style.marginTop = '';
      const b = document.body.getBoundingClientRect();
      const top = el.getBoundingClientRect().top - b.top;
      const shift = mod(PY - mod(top - OY, PY), PY);
      if (shift > 0.5) el.style.marginTop = shift + 'px';
    });
  }

  // Fasce con data-snap: altezza portata al multiplo del modulo, così il motivo finisce intero in basso come in alto
  function snap() {
    document.querySelectorAll('[data-snap]').forEach(el => {
      const m = parseFloat(el.dataset.snap);
      el.style.paddingBottom = '';
      const h = el.getBoundingClientRect().height;
      const extra = Math.ceil(h / m - 0.001) * m - h;
      const pb = parseFloat(getComputedStyle(el).paddingBottom);
      el.style.paddingBottom = (pb + extra) + 'px';
    });
  }

  function align() {
    const b = document.body.getBoundingClientRect();
    document.querySelectorAll('.m-graticcio').forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (OX - (r.left - b.left)) + 'px');
      el.style.setProperty('--py', (OY - (r.top - b.top)) + 'px');
    });
  }

  function all() { snapTop(); snap(); align(); }
  addEventListener('load', all);
  addEventListener('resize', all);
  document.fonts && document.fonts.ready.then(all);
})();
