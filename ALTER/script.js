(function () {
  const pages = document.getElementById('pages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const sections = Array.from(pages.querySelectorAll('.page'));
  const dotsWrap = document.getElementById('dots');

  let index = 0;
  const last = sections.length - 1;

  // Crear indicadores (dots)
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

  function update() {
    pages.style.transform = `translateX(-${index * 100}vw)`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === last;

    // Marcar dot activo
    dotsWrap.querySelectorAll('.dot').forEach((el, i) => {
      el.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    // Llevar la página al tope
    sections[index].scrollTo({ top: 0, behavior: 'instant' });
    // Enfocar primer título para accesibilidad
    const focusable = sections[index].querySelector('h1, h2');
    focusable && focusable.setAttribute('tabindex', '-1');
    focusable && focusable.focus({ preventScroll: true });
  }

  function goTo(i) {
    index = Math.max(0, Math.min(last, i));
    update();
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Swipe táctil
  let startX = 0, startY = 0, isTouching = false, moved = false;

  function onTouchStart(e){
    isTouching = true;
    moved = false;
    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX;
    startY = t.clientY;
  }
  function onTouchMove(e){
    if(!isTouching) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // Ignorar si el gesto es vertical
    if(Math.abs(dy) > Math.abs(dx)) return;
    // Prevenir scroll horizontal del body
    if(Math.abs(dx) > 10){ e.preventDefault(); moved = true; }
  }
  function onTouchEnd(e){
    if(!isTouching) return;
    isTouching = false;
    if(!moved) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const threshold = Math.min(80, window.innerWidth * 0.18);
    if(dx < -threshold) next();
    else if(dx > threshold) prev();
  }

  pages.addEventListener('touchstart', onTouchStart, { passive: true });
  pages.addEventListener('touchmove', onTouchMove, { passive: false });
  pages.addEventListener('touchend', onTouchEnd, { passive: true });

  // Teclas (por si se visualiza en escritorio)
  window.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

  // Inicializar
  update();
})();
