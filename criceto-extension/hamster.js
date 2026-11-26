// Criceto virtuale: segue il cursore su ogni pagina.
// Nessuna immagine esterna e nessuna rete: solo SVG + animazioni CSS.
(() => {
  'use strict';
  if (window.top !== window.self) return;               // solo finestra principale
  if (document.getElementById('criceto-host')) return;  // evita doppioni

  // ---------- Impostazioni (modificale a piacere) ----------
  const SIZE = 64;           // dimensione in px
  const STOP_DISTANCE = 70;  // distanza a cui si ferma dal cursore
  const MAX_SPEED = 340;     // velocità massima (px al secondo)
  const RUN_SPEED = 200;     // sopra questa velocità corre invece di camminare
  const SLEEP_AFTER = 10000; // ms di quiete prima di addormentarsi

  // ---------- Stile (animazioni CSS) ----------
  const CSS = `
    .pet{position:fixed;top:0;left:0;width:${SIZE}px;height:${SIZE}px;pointer-events:auto;
      cursor:pointer;user-select:none;-webkit-user-select:none;will-change:transform;--gait:.46s}
    .pet.run{--gait:.26s}
    .flip,.hop{width:100%;height:100%}
    .hop{transform-origin:50% 100%}
    svg{display:block;overflow:visible}
    .body{transform-box:fill-box;transform-origin:50% 100%}
    .eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5s infinite}
    .leg{transform-box:fill-box;transform-origin:50% 0}
    .eye-closed{display:none}
    .zzz{position:absolute;left:24px;top:-6px;font:700 14px/1 sans-serif;color:#7c8cf8;
      text-shadow:0 0 3px #fff;opacity:0;pointer-events:none}
    .heart{position:absolute;top:2px;font:16px/1 sans-serif;color:#ff5c85;pointer-events:none;
      animation:heart 1s ease-out both}

    .walk .leg.a,.run .leg.a{animation:swing var(--gait) ease-in-out infinite}
    .walk .leg.b,.run .leg.b{animation:swing var(--gait) ease-in-out infinite;
      animation-delay:calc(var(--gait) / -2)}
    .walk .body,.run .body{animation:bob calc(var(--gait) / 2) ease-in-out infinite}
    .idle .body{animation:breathe 2.6s ease-in-out infinite}
    .sleep .body{animation:sleepy 3.4s ease-in-out infinite}
    .sleep .leg,.sleep .eyes{display:none}
    .sleep .eye-closed{display:inline}
    .sleep .zzz{animation:zzz 2.4s ease-out infinite}
    .hop.jump{animation:jump .65s ease-out}

    @keyframes swing{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}}
    @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    @keyframes breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.04)}}
    @keyframes sleepy{0%,100%{transform:translateY(6px) scaleY(.88)}50%{transform:translateY(6px) scaleY(.92)}}
    @keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
    @keyframes jump{0%{transform:scale(1,1)}15%{transform:translateY(2px) scale(1.1,.88)}
      45%{transform:translateY(-22px) scale(.94,1.08)}70%{transform:translateY(0) scale(1.08,.92)}
      85%{transform:translateY(-5px) scale(1,1)}100%{transform:none}}
    @keyframes zzz{0%{opacity:0;transform:translate(0,8px) scale(.7)}25%{opacity:1}
      100%{opacity:0;transform:translate(10px,-14px) scale(1.15)}}
    @keyframes heart{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:1}
      100%{opacity:0;transform:translate(var(--dx),-40px) scale(1.2)}}

    @media print{.pet{display:none}}
    @media (prefers-reduced-motion:reduce){.body,.eyes{animation:none!important}}
  `;

  // ---------- Costruzione del criceto ----------
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n);
    return n;
  };
  const div = (cls, parent) => {
    const d = document.createElement('div');
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  };

  const pet = div('pet idle');
  const flip = div('flip', pet);
  const hop = div('hop', flip);
  div('zzz', pet).textContent = 'Z z';

  const svg = S('svg', { viewBox: '0 0 64 64', width: SIZE, height: SIZE }, hop);

  // zampe (a/b = le due coppie diagonali che si alternano)
  const legs = S('g', {}, svg);
  [['a', 14, '#D9985A'], ['b', 38, '#D9985A'], ['b', 21, '#F5C28A'], ['a', 42, '#F5C28A']]
    .forEach(([c, x, fill]) =>
      S('rect', { class: 'leg ' + c, x, y: 47, width: 6, height: 12, rx: 3, fill }, legs));

  S('circle', { cx: 7, cy: 40, r: 2.6, fill: '#E9A95D' }, svg); // codina

  // corpo + testa (il criceto guarda verso destra, poi viene specchiato)
  const body = S('g', { class: 'body' }, svg);
  S('ellipse', { cx: 30, cy: 38, rx: 22, ry: 14, fill: '#E9A95D' }, body);
  S('ellipse', { cx: 26, cy: 32, rx: 14, ry: 7, fill: '#C97D35' }, body);      // macchia sulla schiena
  S('ellipse', { cx: 34, cy: 44.5, rx: 15, ry: 6.5, fill: '#FFF0D4' }, body);  // pancia
  S('ellipse', { cx: 48, cy: 36, rx: 13, ry: 12, fill: '#E9A95D' }, body);     // testa
  S('circle', { cx: 41, cy: 25, r: 4.5, fill: '#C97D35' }, body);              // orecchie
  S('circle', { cx: 41, cy: 25, r: 2.4, fill: '#F4B3B3' }, body);
  S('circle', { cx: 53, cy: 25, r: 4.2, fill: '#C97D35' }, body);
  S('circle', { cx: 53, cy: 25, r: 2.2, fill: '#F4B3B3' }, body);
  S('ellipse', { cx: 52, cy: 41.5, rx: 8, ry: 5.5, fill: '#FFF0D4' }, body);   // guancia
  S('circle', { cx: 49, cy: 40, r: 2.6, fill: '#F6A5A5', opacity: 0.55 }, body);
  const eyes = S('g', { class: 'eyes' }, body);
  S('circle', { cx: 54, cy: 33, r: 2.3, fill: '#2A1B10' }, eyes);
  S('circle', { cx: 54.8, cy: 32.2, r: 0.8, fill: '#fff' }, eyes);
  S('path', { class: 'eye-closed', d: 'M51.5 33.5Q54 35.5 56.5 33.5', fill: 'none',
    stroke: '#2A1B10', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, body);
  S('ellipse', { cx: 60, cy: 37, rx: 2, ry: 1.6, fill: '#E7788A' }, body);     // naso
  S('path', { d: 'M55 40.5Q57 42 59 40.5M57 38L63 36M57 39.5L63 40.5', fill: 'none',
    stroke: '#7A5230', 'stroke-width': 0.7, 'stroke-linecap': 'round' }, body); // bocca + baffi

  // ---------- Montaggio nella pagina (Shadow DOM: la pagina non lo altera) ----------
  const host = document.createElement('div');
  host.id = 'criceto-host';
  host.style.cssText = 'all:initial!important;position:fixed!important;top:0!important;' +
    'left:0!important;width:0!important;height:0!important;z-index:2147483647!important;' +
    'pointer-events:none!important';
  const root = host.attachShadow({ mode: 'closed' });
  try {
    const sheet = new CSSStyleSheet();   // non soggetto alle CSP restrittive delle pagine
    sheet.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet];
  } catch (_) {
    const st = document.createElement('style');
    st.textContent = CSS;
    root.appendChild(st);
  }
  root.appendChild(pet);
  document.documentElement.appendChild(host);

  // ---------- Comportamento ----------
  let x = innerWidth - 100, y = innerHeight - 50;  // centro del criceto
  let tx = x, ty = y;                               // posizione del cursore
  let facing = 1, mode = 'idle', raf = 0, last = 0, sleepTimer = 0, hidden = false;

  const render = () => {
    pet.style.transform =
      `translate3d(${(x - SIZE / 2).toFixed(1)}px,${(y - SIZE / 2).toFixed(1)}px,0)`;
  };
  const setMode = (m) => { if (m !== mode) { mode = m; pet.className = 'pet ' + m; } };
  const face = (f) => {
    if (f !== facing) { facing = f; flip.style.transform = f > 0 ? '' : 'scaleX(-1)'; }
  };
  const armSleep = () => {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => { if (!raf) setMode('sleep'); }, SLEEP_AFTER);
  };

  // Il ciclo di animazione gira SOLO mentre il criceto si muove.
  function tick(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const dx = tx - x, dy = ty - y;
    const dist = Math.hypot(dx, dy);
    const gap = dist - STOP_DISTANCE;
    if (gap > 1) {
      const speed = Math.min(MAX_SPEED, 20 + gap * 4);  // rallenta avvicinandosi
      const step = Math.min(speed * dt, gap);
      x += (dx / dist) * step;
      y += (dy / dist) * step;
      if (Math.abs(dx) > 3) face(dx > 0 ? 1 : -1);
      setMode(speed > RUN_SPEED ? 'run' : 'walk');
      render();
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      setMode('idle');
      armSleep();
    }
  }

  function wake() {
    clearTimeout(sleepTimer);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  addEventListener('mousemove', (e) => {
    if (hidden) return;
    tx = e.clientX;
    ty = e.clientY;
    if (Math.hypot(tx - x, ty - y) > STOP_DISTANCE + 12) wake();   // piccoli movimenti vicini: ignorati
    else if (!raf && mode === 'idle') face(tx > x ? 1 : -1);        // da fermo si gira verso il cursore
  }, { passive: true, capture: true });

  // Click: salto + cuoricini (e sveglia se dormiva)
  hop.addEventListener('animationend', (e) => {
    if (e.animationName === 'jump') hop.classList.remove('jump');
  });
  pet.addEventListener('click', () => {
    if (mode === 'sleep') setMode('idle');
    hop.classList.remove('jump');
    void hop.offsetWidth;                 // riavvia l'animazione anche con click ravvicinati
    hop.classList.add('jump');
    for (let i = 0; i < 3; i++) {
      const h = div('heart', pet);
      h.textContent = '\u2665';
      h.style.left = 20 + Math.random() * 24 + 'px';
      h.style.setProperty('--dx', Math.random() * 30 - 15 + 'px');
      h.style.animationDelay = i * 0.12 + 's';
      h.addEventListener('animationend', () => h.remove());
    }
    if (!raf) armSleep();
  });

  // Alt+Maiusc+H: nasconde / mostra il criceto
  addEventListener('keydown', (e) => {
    if (!(e.altKey && e.shiftKey && e.code === 'KeyH')) return;
    hidden = !hidden;
    pet.style.display = hidden ? 'none' : '';
    if (hidden) { cancelAnimationFrame(raf); raf = 0; clearTimeout(sleepTimer); }
    else armSleep();
  }, true);

  addEventListener('resize', () => {
    x = Math.min(x, innerWidth - SIZE / 2);
    y = Math.min(y, innerHeight - SIZE / 2);
    render();
  });

  render();
  armSleep();
})();
