/* Moduli di richiesta (catering, feste, assemblee, contatti).
   Il sito non ha un servizio di invio: il pulsante apre WhatsApp con la richiesta gia' scritta,
   e la persona la invia da li'. Quando ci sara' un servizio di posta, basta sostituire l'ultima riga. */
(function () {
  var EN = document.documentElement.lang === 'en';
  var NUMERO = '393911761595';

  function etichetta(label) {
    var t = '';
    label.childNodes.forEach(function (n) { if (n.nodeType === 3) t += n.textContent; });
    return t.replace(/\s+/g, ' ').replace(/\((facoltativo|optional)\)/i, '').replace(/[:\s]+$/, '').trim();
  }

  document.querySelectorAll('form').forEach(function (form) {
    var campi = [].slice.call(form.querySelectorAll('label:not(.check)'));
    var nome = form.querySelector('input[autocomplete="name"]');
    var tel = form.querySelector('input[type="tel"]');
    var mail = form.querySelector('input[type="email"]');
    if (nome) nome.required = true;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // serve almeno un recapito per poter rispondere
      if (tel) tel.setCustomValidity('');
      if (tel && mail && !tel.value.trim() && !mail.value.trim()) {
        tel.setCustomValidity(EN ? 'Please leave a phone number or an email address.' : 'Lascia un telefono o una email.');
      }
      if (!form.reportValidity()) return;

      var titolo = document.title.split('|')[0].split(',')[0].trim();
      var righe = [(EN ? 'Request from the website' : 'Richiesta dal sito') + ' · ' + titolo, ''];
      campi.forEach(function (l) {
        var c = l.querySelector('input, select, textarea');
        if (!c) return;
        var v = c.tagName === 'SELECT' ? c.options[c.selectedIndex].text : c.value.trim();
        if (v) righe.push(etichetta(l) + ': ' + v);
      });
      var consensi = form.querySelectorAll('label.check input');
      if (consensi[1] && consensi[1].checked) {
        righe.push('', EN ? 'I agree to receive news about evenings and events.' : 'Acconsento a ricevere comunicazioni su serate ed eventi.');
      }
      window.open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(righe.join('\n')), '_blank', 'noopener');
    });
    if (tel) tel.addEventListener('input', function () { tel.setCustomValidity(''); });
    if (mail) mail.addEventListener('input', function () { if (tel) tel.setCustomValidity(''); });
  });
})();
