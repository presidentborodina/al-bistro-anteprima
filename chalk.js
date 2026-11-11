/* Scritta a gesso liquido: il titolo si scrive da sinistra a destra.
   Ogni elemento con class="chalk" viene trasformato in SVG; il testo vero resta
   nel titolo (span visivamente nascosto) per Google e per i lettori di schermo. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || location.hash === '#still';
  let uid = 0;

  function build(el) {
    const lines = [[]];
    el.childNodes.forEach(n => {
      if (n.nodeName === 'BR') { lines.push([]); return; }
      const t = n.textContent.replace(/\s+/g, ' ');
      if (t) lines[lines.length - 1].push({ t, em: n.nodeName === 'EM' });
    });
    lines.forEach(ln => {
      if (ln.length) { ln[0].t = ln[0].t.replace(/^\s+/, ''); ln[ln.length - 1].t = ln[ln.length - 1].t.replace(/\s+$/, ''); }
    });
    for (let i = lines.length - 1; i >= 0; i--) if (!lines[i].some(p => p.t)) lines.splice(i, 1);
    const label = lines.map(ln => ln.map(p => p.t).join('')).join(' ').replace(/\s+/g, ' ').trim();
    const fs = 100, lh = 112, id = 'ck' + (uid++);

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('chalk-svg');
    svg.innerHTML =
      `<defs>
         <filter id="${id}f" x="-2%" y="-10%" width="104%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="${uid}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter>
       </defs>`;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('filter', `url(#${id}f)`);
    svg.appendChild(g);

    const rows = [];
    const texts = lines.map((ln, i) => {
      const row = document.createElementNS(NS, 'g');
      row.classList.add('ln');
      g.appendChild(row);
      rows.push(row);
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', 0);
      text.setAttribute('y', fs * 0.9 + i * lh);
      text.classList.add('ink');
      ln.forEach(p => {
        const ts = document.createElementNS(NS, 'tspan');
        ts.textContent = p.t;
        if (p.em) ts.classList.add('em');
        text.appendChild(ts);
      });
      row.appendChild(text);
      return text;
    });

    const sr = document.createElement('span');
    sr.className = 'chalk-sr';
    sr.textContent = label;
    el.textContent = '';
    el.appendChild(sr);
    el.appendChild(svg);

    // misura le righe e le scrive una dopo l'altra, da sinistra a destra
    let W = 0, end = 0;
    const per = 1.15; // secondi di attesa tra una riga e la successiva
    texts.forEach((t, i) => {
      const w = t.getComputedTextLength();
      W = Math.max(W, w);
      const d = i * per;
      const dur = Math.min(2.4, 0.9 + w / 900);
      rows[i].style.animationDelay = d + 's';
      rows[i].style.animationDuration = dur + 's';
      t.style.animationDelay = d + 's, ' + (d + dur * 0.7) + 's';
      t.style.animationDuration = (dur + 0.3) + 's, 0.9s';
      end = Math.max(end, d + dur + 0.3, d + dur * 0.7 + 0.9);
    });
    svg.dataset.end = end;
    const H = lines.length * lh;
    svg.setAttribute('viewBox', `-4 -4 ${W + 12} ${H + 12}`);
    svg.style.height = (lines.length * 1.12) + 'em';
    svg.style.maxWidth = '100%';
    return svg;
  }

  function play(svg) {
    clearTimeout(svg._done); clearTimeout(svg._smooth);
    svg.classList.remove('chalk-on', 'chalk-still');
    void svg.getBoundingClientRect();
    svg.classList.add('chalk-on');
    // a fine scrittura il titolo passa allo stato fermo: niente animazioni appese
    // il bordo da gesso si leviga negli ultimi 0,6 secondi: il titolo finito resta pulito
    const disp = svg.querySelector('feDisplacementMap');
    if (disp) disp.setAttribute('scale', 2.4);
    cancelAnimationFrame(svg._raf);
    const endMs = parseFloat(svg.dataset.end) * 1000;
    const smooth = 600;
    clearTimeout(svg._smooth);
    svg._smooth = setTimeout(() => {
      const t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / smooth);
        if (disp) disp.setAttribute('scale', (2.4 * (1 - k)).toFixed(2));
        if (k < 1) svg._raf = requestAnimationFrame(step);
      };
      svg._raf = requestAnimationFrame(step);
    }, Math.max(0, endMs - smooth));
    svg._done = setTimeout(() => svg.classList.add('chalk-still'), endMs + 20);
  }

  window.chalkPlay = function (root) {
    root.querySelectorAll('.chalk-svg').forEach(play);
  };

  document.fonts.ready.then(() => {
    const svgs = [...document.querySelectorAll('.chalk')].map(build);
    if (reduce) { svgs.forEach(s => s.classList.add('chalk-on', 'chalk-still')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const svg = e.target;
      const slide = svg.closest('.slide');
      if (slide && !slide.classList.contains('on')) return;
      play(svg);
      io.unobserve(svg);
    }), { threshold: 0.4 });
    svgs.forEach(s => {
      const slide = s.closest('.slide');
      if (slide) { if (slide.classList.contains('on')) play(s); return; }
      const r = s.getBoundingClientRect();
      if (r.top < innerHeight * 0.9 && r.bottom > 0) play(s); else io.observe(s);
    });
  });
})();
