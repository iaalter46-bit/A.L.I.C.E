(() => {
  // ======== Neural Net Background on Canvas ========
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let dpi = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let w, h;

  function resize() {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w * dpi);
    canvas.height = Math.floor(h * dpi);
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  const NODES = Math.floor(Math.min(80, w / 10));
  const nodes = Array.from({ length: NODES }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6
  }));

  function step() {
    ctx.clearRect(0, 0, w, h);

    // glow background grid faint
    const grad = ctx.createRadialGradient(w*0.7, h*0.1, 0, w*0.7, h*0.1, Math.max(w, h));
    grad.addColorStop(0, 'rgba(0,195,255,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    // move nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    // edges
    const MAX_D = Math.min(150, Math.max(90, Math.min(w, h) * 0.28));
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < MAX_D * MAX_D) {
          const alpha = 1 - (Math.sqrt(d2) / MAX_D);
          ctx.strokeStyle = `rgba(0,195,255,${alpha * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(170, 240, 255, 0.9)';
      ctx.shadowColor = 'rgba(0,195,255,0.65)';
      ctx.shadowBlur = 6;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // ======== Book Slider Logic ========
  const pages = document.getElementById('pages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const sections = Array.from(pages.querySelectorAll('.page'));
  const dotsWrap = document.getElementById('dots');

  let index = 0;
  const last = sections.length - 1;

  // dots
  sections.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'dot';
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.setAttribute('aria-label', `Ir a la página ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    d.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && goTo(i));
    dotsWrap.appendChild(d);
  });

  function mark3D() {
    sections.forEach((s, i) => {
      s.classList.remove('page--prev','page--active','page--next');
      if (i === index - 1) s.classList.add('page--prev');
      else if (i === index) s.classList.add('page--active');
      else if (i === index + 1) s.classList.add('page--next');
    });
  }

  function update() {
    pages.style.transform = `translate3d(-${index * 100}vw, 0, 0)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === last;

    // dots
    dotsWrap.querySelectorAll('.dot').forEach((el, i) => {
      el.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    // reset scroll and focus
    sections[index].scrollTo({ top: 0, behavior: 'instant' });
    const focusable = sections[index].querySelector('h1, h2');
    if (focusable) {
      focusable.setAttribute('tabindex', '-1');
      focusable.focus({ preventScroll: true });
    }

    mark3D();
  }

  function goTo(i) {
    index = Math.max(0, Math.min(last, i));
    update();
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // touch swipe
  let startX = 0, startY = 0, touching = false, swiped = false;

  function onStart(e){
    touching = true; swiped = false;
    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX; startY = t.clientY;
  }
  function onMove(e){
    if(!touching) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // sólo gesto horizontal
    if(Math.abs(dy) > Math.abs(dx)) return;
    // parallax + leve rotación
    const pct = Math.max(-1, Math.min(1, dx / window.innerWidth));
    pages.style.transform = `translate3d(calc(-${index * 100}vw + ${dx}px), 0, 0)`;
    sections[index].style.transform = `rotateY(${pct * 6}deg)`;
    if (sections[index+1]) sections[index+1].style.transform = `rotateY(${(pct-1)*6}deg)`;
    if (sections[index-1]) sections[index-1].style.transform = `rotateY(${(pct+1)*6}deg)`;
    if(Math.abs(dx) > 10) { e.preventDefault(); swiped = true; }
  }
  function onEnd(e){
    if(!touching) return;
    touching = false;
    // reset rotaciones
    sections.forEach(s => s.style.transform = 'rotateY(0deg)');
    if(!swiped) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const threshold = Math.min(90, window.innerWidth * 0.22);
    if(dx < -threshold) next();
    else if(dx > threshold) prev();
    else update(); // volver a su lugar
  }

  pages.addEventListener('touchstart', onStart, { passive: true });
  pages.addEventListener('touchmove', onMove, { passive: false });
  pages.addEventListener('touchend', onEnd, { passive: true });

  // keyboard
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

  // init
  update();
})();
