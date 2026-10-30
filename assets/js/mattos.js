/* DJ Mattos: topo, menu, entradas, luz de palco, reels com som, galeria da pista, ficha do WhatsApp. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ZAP = '5511982456366';
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zapLink = msg => `https://wa.me/${ZAP}?text=${encodeURIComponent(msg)}`;

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* links de WhatsApp com mensagem pronta */
  $$('[data-zap]').forEach(a => { a.href = zapLink(a.dataset.zap); a.target = '_blank'; a.rel = 'noopener'; });

  /* entrada do hero depois das fontes (ou 1,2 s, o que vier antes) */
  const hero = $('.hero');
  if (hero) {
    let foi = false;
    const entrar = () => { if (foi) return; foi = true; requestAnimationFrame(() => hero.classList.add('entrou')); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(entrar);
    setTimeout(entrar, 1200);
  }

  /* topo: sólido depois do hero, some ao descer e volta ao subir; WhatsApp flutuante */
  const topo = $('#topo'), zap = $('.zap-flut'), gaveta = $('#gaveta'), menuBtn = $('.menu-btn');
  let yAnt = 0;
  function rolar() {
    const y = scrollY, lim = hero ? hero.offsetHeight * .6 : 80;
    topo.classList.toggle('solido', y > 40);
    const aberta = gaveta && gaveta.classList.contains('aberta');
    topo.classList.toggle('some', !aberta && y > lim && y > yAnt + 2);
    if (y < yAnt - 2 || y < lim) topo.classList.remove('some');
    zap && zap.classList.toggle('ve', y > lim && !aberta);
    yAnt = y;
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();

  /* link ativo no menu */
  const links = $$('.topo nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(ents => ents.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(s => io.observe(s));
  }

  /* menu do celular */
  function gavetaAbrir(abrir) {
    if (!gaveta) return;
    menuBtn.setAttribute('aria-expanded', abrir);
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) {
      gaveta.hidden = false; document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => gaveta.classList.add('aberta')));
      topo.classList.add('solido'); topo.classList.remove('some');
    } else {
      gaveta.classList.remove('aberta'); document.documentElement.style.overflow = '';
      setTimeout(() => { if (!gaveta.classList.contains('aberta')) gaveta.hidden = true; }, 380);
      rolar();
    }
  }
  menuBtn && menuBtn.addEventListener('click', () => gavetaAbrir(menuBtn.getAttribute('aria-expanded') !== 'true'));
  gaveta && $$('a', gaveta).forEach(a => a.addEventListener('click', () => gavetaAbrir(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && gaveta && !gaveta.hidden) gavetaAbrir(false); });
  addEventListener('resize', () => { if (innerWidth > 1100 && gaveta && !gaveta.hidden) gavetaAbrir(false); });

  /* entradas ao rolar */
  const io = 'IntersectionObserver' in window && !reduz
    ? new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 })
    : null;
  const observar = el => io ? io.observe(el) : el.classList.add('visto');
  $$('.revela').forEach(observar);

  /* contadores */
  $$('[data-conta]').forEach(el => {
    const fim = +el.dataset.conta; if (reduz || fim < 3) return;
    el.textContent = '0';
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now(), dur = 1600;
      const passo = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }, { threshold: .6 }).observe(el);
  });

  /* manifesto: as palavras acendem conforme a frase sobe na tela */
  const man = $('[data-palavras]');
  if (man) {
    const destaque = ['reunião', 'alinhamento'];
    man.innerHTML = man.textContent.trim().split(/\s+/).map(w => `<span class="p${destaque.some(d => w.startsWith(d)) ? ' v' : ''}">${w}</span>`).join(' ');
    const ps = $$('.p', man);
    if (reduz) ps.forEach(p => p.classList.add('on'));
    else {
      const pinta = () => {
        const r = man.getBoundingClientRect(), vh = innerHeight;
        const k = Math.min(1, Math.max(0, (vh * .86 - r.top) / (r.height + vh * .38)));
        const n = Math.round(k * ps.length);
        ps.forEach((p, i) => p.classList.toggle('on', i < n));
      };
      addEventListener('scroll', pinta, { passive: true }); addEventListener('resize', pinta); pinta();
    }
  }

  /* paralaxe leve nas fotos do "Sobre" */
  const par = $$('.sobre-fotos img');
  if (par.length && !reduz) {
    let pend = false;
    const mexe = () => {
      pend = false; const vh = innerHeight;
      par.forEach((img, i) => {
        const r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const k = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `translateY(${(-6.5 + k * (i ? -7 : 7)).toFixed(2)}%)`;
      });
    };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(mexe); } }, { passive: true }); mexe();
  }

  /* luz de palco (assets/js/palco.js): ao vivo em WebGL no desktop; em telas de toque, o MP4 do
     mesmo shader (em pé ou deitado). Só anima na tela; com "reduzir movimento" fica um quadro parado. */
  const toque = matchMedia('(hover: none), (pointer: coarse)').matches;
  $$('[data-palco]').forEach(box => {
    const cv = $('canvas', box), vid = $('video', box);
    const ver = cb => 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: '200px 0px' }).observe(box)
      : cb(true);
    if (toque) {
      if (!vid) return;
      box.classList.add('em-video');
      ver(dentro => {
        if (dentro) {
          if (!vid.src) {
            vid.src = innerWidth > innerHeight ? box.dataset.vDeitado : box.dataset.vPe;
            vid.addEventListener('playing', () => box.classList.add('viva'), { once: true });
          }
          if (!reduz) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
          else vid.addEventListener('loadeddata', () => box.classList.add('viva'), { once: true });
        } else vid.pause();
      });
      return;
    }
    if (!cv || !window.palcoGL) return;
    let T = null;
    try { T = palcoGL(cv, { modo: +box.dataset.palco, forca: +box.dataset.forca }); } catch (e) { T = null; }
    if (!T) return;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); box.classList.remove('viva'); T = null; });
    const CICLO = (+box.dataset.ciclo || 36) * 1000;
    let esc = Math.min(devicePixelRatio || 1, 2) * .5;
    let fase = 1;
    const ajusta = () => { if (!T) return; T.tamanho(Math.max(2, Math.round(box.clientWidth * esc)), Math.max(2, Math.round(box.clientHeight * esc))); T.desenhar(fase); };
    ajusta(); addEventListener('resize', ajusta);
    if (reduz) { T.desenhar(1); box.classList.add('viva'); return; }
    let ve = false, ult = 0, soma = 0, n = 0;
    const t0 = performance.now();
    const quadro = t => {
      if (!T) return;
      requestAnimationFrame(quadro);
      if (!ve || document.hidden) { ult = 0; return; }
      if (ult) { soma += t - ult; n++; }
      ult = t;
      if (n === 40) { if (soma / n > 22 && esc > .3) { esc *= .8; ajusta(); } soma = 0; n = 0; }
      fase = (1 + (t - t0) / CICLO * 6.283185307179586) % 6.283185307179586;
      T.desenhar(fase);
      box.classList.add('viva');
    };
    ver(dentro => { ve = dentro; ult = 0; });
    requestAnimationFrame(quadro);
  });

  /* reels: tocam mudos quando estão na tela; o botão liga o som do início, um com som por vez */
  const comSom = [];
  $$('.tela-video').forEach(tela => {
    const v = $('video', tela), btn = $('.som', tela);
    if (!v) return;
    const item = { v, comSom: false };
    const tocar = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    item.mudo = () => { item.comSom = false; v.muted = true; v.loop = true; btn && btn.setAttribute('aria-pressed', 'false'); btn && btn.setAttribute('aria-label', 'Ouvir com som'); };
    comSom.push(item);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; if (!reduz || item.comSom) tocar(); }
        else { v.pause(); if (item.comSom) item.mudo(); }
      }, { threshold: .35 }).observe(v);
    }
    btn && btn.addEventListener('click', () => {
      if (item.comSom) { item.mudo(); return; }
      comSom.forEach(o => { if (o !== item && o.comSom) o.mudo(); });
      item.comSom = true; v.muted = false; v.currentTime = 0; v.loop = false; tocar();
      btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Tirar o som');
    });
    v.addEventListener('ended', () => { item.mudo(); tocar(); });
  });

  /* galeria da pista (lista em assets/js/pista.js, gerada por tools/processar.py) */
  const galeria = $('#galeria'), fotos = window.PISTA || [];
  if (galeria && fotos.length) {
    galeria.innerHTML = fotos.map((o, i) => `<figure class="foto revela" data-i="${i}">
      <button type="button" aria-label="Ampliar: ${o.a}"><img src="assets/img/pista/${o.id}-640.webp" srcset="assets/img/pista/${o.id}-640.webp 640w, assets/img/pista/${o.id}-1080.webp 1080w" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" alt="${o.a}" loading="lazy" width="640" height="800"></button></figure>`).join('');
    $$('.foto', galeria).forEach(observar);
    galeria.addEventListener('click', e => { const f = e.target.closest('.foto'); if (f) abrirLuz(+f.dataset.i); });
  }

  /* tela cheia da galeria */
  const luz = $('#luz'), luzImg = $('#luz-img'), luzLeg = $('#luz-leg');
  let li = 0, foco = null;
  function pintarLuz() {
    const o = fotos[li]; if (!o) return;
    luzImg.style.opacity = 0;
    const src = `assets/img/pista/${o.id}-1080.webp`, tmp = new Image();
    tmp.onload = () => { luzImg.src = src; luzImg.alt = o.a; luzImg.style.opacity = 1; };
    tmp.src = src;
    luzLeg.textContent = o.a;
  }
  function abrirLuz(i) {
    if (!luz || i < 0) return;
    li = i; foco = document.activeElement; pintarLuz();
    luz.hidden = false; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => luz.classList.add('aberta'));
    $('.luz-fechar', luz).focus();
  }
  function fecharLuz() {
    luz.classList.remove('aberta'); document.documentElement.style.overflow = '';
    setTimeout(() => { luz.hidden = true; }, 300);
    foco && foco.focus();
  }
  const passa = d => { li = (li + d + fotos.length) % fotos.length; pintarLuz(); };
  if (luz) {
    $('.luz-fechar', luz).addEventListener('click', fecharLuz);
    $('.luz-ant', luz).addEventListener('click', () => passa(-1));
    $('.luz-prox', luz).addEventListener('click', () => passa(1));
    luz.addEventListener('click', e => { if (e.target === luz || e.target.tagName === 'FIGURE') fecharLuz(); });
    addEventListener('keydown', e => {
      if (luz.hidden) return;
      if (e.key === 'Escape') fecharLuz(); else if (e.key === 'ArrowRight') passa(1); else if (e.key === 'ArrowLeft') passa(-1);
    });
    let x0 = null;
    luz.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    luz.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1); x0 = null; });
  }

  /* ficha: monta a mensagem e abre o WhatsApp */
  const ficha = $('#ficha');
  ficha && ficha.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(ficha));
    const nome = ficha.elements.nome;
    if (!d.nome.trim()) { nome.classList.add('erro'); nome.focus(); return; }
    nome.classList.remove('erro');
    const linhas = [`Olá, Mattos! Meu nome é ${d.nome.trim()} e vim pelo site.`, `Quero consultar uma data para: ${d.tipo}`];
    if (d.data) { const [a, m, dia] = d.data.split('-'); linhas.push(`Data: ${dia}/${m}/${a}`); }
    if (d.local.trim()) linhas.push(`Local: ${d.local.trim()}`);
    if (d.convidados.trim()) linhas.push(`Convidados: cerca de ${d.convidados.trim()}`);
    window.open(zapLink(linhas.join('\n')), '_blank', 'noopener');
  });
})();
