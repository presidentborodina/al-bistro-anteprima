/* «Aperto ora» / «Chiuso ora» nella barra in alto, calcolato sugli orari veri (ora di Milano).
   Orari (aggiornare QUI se cambiano; il footer e i testi vanno aggiornati a parte):
     lun-gio 7.30-15.30   (il giovedì sera per ora chiuso, deciso il 25/11/2026)
     ven     7.30-15.30 · 18.30-22.30
     sab     8.30-15.30 · 18.30-22.30
     dom     chiuso
   Non tiene conto di festivi e chiusure straordinarie. */
(function () {
  var el = document.querySelector('.util .dot');
  if (!el) return;
  var G = 7 * 60 + 30, S = 8 * 60 + 30, P = 15 * 60 + 30, C1 = 18 * 60 + 30, C2 = 22 * 60 + 30;
  var EN = document.documentElement.lang === 'en';
  var giorni = EN ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  function fasce(g, dataNum) {            // g: 0 = domenica ... 6 = sabato; dataNum: AAAAMMGG
    if (g === 0) return [];
    if (g === 6) return [[S, P], [C1, C2]];
    if (g === 5) return [[G, P], [C1, C2]];
    return [[G, P]];
  }
  function ora(m) {
    var h = Math.floor(m / 60), mm = ('0' + (m % 60)).slice(-2);
    return EN ? ((h % 12) || 12) + '.' + mm + (h < 12 ? ' am' : ' pm') : h + '.' + mm;
  }

  function adesso() {                      // data e ora a Milano, qualunque sia il fuso di chi guarda
    var p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var g = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { g: g, min: (+p.hour % 24) * 60 + (+p.minute), num: +(p.year + p.month + p.day), y: +p.year, m: +p.month, d: +p.day };
  }

  function aggiorna() {
    var n = adesso(), oggi = fasce(n.g, n.num), aperto = false, prossima = '';
    oggi.forEach(function (f) { if (n.min >= f[0] && n.min < f[1]) aperto = true; });
    if (!aperto) {
      var dopo = oggi.filter(function (f) { return f[0] > n.min; })[0];
      if (dopo) prossima = (EN ? 'opens at ' : 'apre alle ') + ora(dopo[0]);
      else {
        for (var k = 1; k <= 7 && !prossima; k++) {
          var dt = new Date(Date.UTC(n.y, n.m - 1, n.d + k));
          var num = dt.getUTCFullYear() * 10000 + (dt.getUTCMonth() + 1) * 100 + dt.getUTCDate();
          var f = fasce(dt.getUTCDay(), num)[0];
          if (f) prossima = (EN ? 'opens ' : 'apre ') + (k === 1 ? (EN ? 'tomorrow' : 'domani') : giorni[dt.getUTCDay()]) + (EN ? ' at ' : ' alle ') + ora(f[0]);
        }
      }
    }
    el.textContent = aperto ? (EN ? 'Open now' : 'Aperto ora') : (EN ? 'Closed now' : 'Chiuso ora');
    el.title = aperto ? '' : prossima.charAt(0).toUpperCase() + prossima.slice(1);
    el.classList.toggle('chiuso', !aperto);
    el.setAttribute('data-ok', '');
    var extra = el.nextElementSibling && el.nextElementSibling.classList.contains('riapre') ? el.nextElementSibling : null;
    if (!extra) { extra = document.createElement('span'); extra.className = 'riapre hide'; el.after(extra); }
    extra.textContent = aperto ? '' : prossima;
    extra.style.display = aperto ? 'none' : '';
  }
  aggiorna();
  setInterval(aggiorna, 60000);
})();
