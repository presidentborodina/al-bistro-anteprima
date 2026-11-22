/* Forno acceso: la foto del forno in testata si muove, in modo leggero e continuo.
   Si attiva sulle immagini con l'attributo data-fuoco (la foto image00045, 4:3): testate di Pizza e della sera,
   diapositiva Pizza dello slider in home.
   Un canvas ridisegna i pixel veri della foto nella zona della bocca del forno, deformandoli a onde
   (piu' ampie nella fascia della fiamma); i bordi sfumano nella foto ferma. Stili in base.css (.fuoco).
   Con "riduci movimento" attivo non parte e la foto resta ferma. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('img[data-fuoco]').forEach(accendi);

  function accendi(img) {
  var sec = img.parentElement; // la testata della pagina, oppure una diapositiva dello slider in home
  var box = document.createElement('div');
  box.className = 'fuoco';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<canvas width="574" height="376"></canvas><i class="b1"></i><i class="b3"></i>';
  img.after(box);
  var cv = box.firstChild, ctx = cv.getContext('2d');
  cv.style.filter = getComputedStyle(img).filter; // stesso scurimento della foto

  // il riquadro .fuoco ricalca la foto "a riempimento" (object-fit: cover), rispettando object-position
  function posa() {
    if (!img.naturalWidth) return;
    var W = sec.clientWidth, H = sec.clientHeight;
    var s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    var op = getComputedStyle(img).objectPosition.split(' '), px = parseFloat(op[0]) / 100, py = parseFloat(op[1]) / 100;
    if (isNaN(px)) px = .5; if (isNaN(py)) py = .5;
    box.style.left = (W - dw) * px + 'px';
    box.style.top = (H - dh) * py + 'px';
    box.style.width = dw + 'px';
    box.style.height = dh + 'px';
  }
  posa(); img.addEventListener('load', posa); // la foto puo' arrivare dopo (slider della home)
  if (window.ResizeObserver) new ResizeObserver(posa).observe(sec); else addEventListener('resize', posa);

  // zona della foto ridisegnata (stesse percentuali del canvas nel CSS): x 22-78%, y 9-58%
  var RX = .22, RY = .09, RW = .56, RH = .49, W = cv.width, H = cv.height, passo = 2, base = 2.3;
  var visibile = true, ultimo = 0;
  if (window.IntersectionObserver) new IntersectionObserver(function (e) { visibile = e[0].isIntersecting; }).observe(sec);

  function disegna(ms) {
    requestAnimationFrame(disegna);
    if (!visibile || document.hidden || !img.complete || !img.naturalWidth) return;
    if (sec.classList.contains('slide') && !sec.classList.contains('on')) return; // diapositiva non in vista
    if (ms - ultimo < 33) return; // circa 30 fotogrammi al secondo
    ultimo = ms;
    var t = ms / 1000;
    var sx = img.naturalWidth * RX, sy = img.naturalHeight * RY, sw = img.naturalWidth * RW, sh = img.naturalHeight * RH, k = sh / H;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    for (var y = 0; y < H; y += passo) {
      var yn = y / H, f = Math.exp(-Math.pow((yn - .2) / .17, 2)); // la fiamma sta nella fascia alta
      var amp = base * (.22 + f);
      var dx = amp * (Math.sin(y * .075 + t * 2.3) + .6 * Math.sin(y * .19 - t * 3.7) + .4 * Math.sin(y * .031 + t * 1.1));
      ctx.drawImage(img, sx, sy + y * k, sw, passo * k, dx - 6, y, W + 12, passo);
    }
    // la fiamma si accende e si attenua: la fascia alta ridisegnata su se stessa in luce additiva
    var luce = (Math.sin(t * 7.3) + Math.sin(t * 11.7 + 1) + Math.sin(t * 3.1 + 2)) / 6 + .5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .2 * luce;
    var fh = Math.round(H * .42);
    ctx.drawImage(cv, 0, 0, W, fh, 0, 0, W, fh);
  }
  requestAnimationFrame(disegna);
  }
})();
