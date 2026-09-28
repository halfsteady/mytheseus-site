(() => {
  const track = document.querySelector('[data-showcase-track]');
  const controls = document.querySelector('[data-showcase-controls]');
  if (!track || !controls) return;

  const slides = Array.from(track.querySelectorAll('[data-showcase-slide]'));
  const previous = controls.querySelector('[data-showcase-prev]');
  const next = controls.querySelector('[data-showcase-next]');
  const count = controls.querySelector('[data-showcase-count]');
  if (!slides.length || !previous || !next || !count) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let queued = false;

  function nearestSlide() {
    const left = track.getBoundingClientRect().left;
    let nearest = 0;
    let distance = Infinity;
    slides.forEach((slide, index) => {
      const delta = Math.abs(slide.getBoundingClientRect().left - left);
      if (delta < distance) {
        distance = delta;
        nearest = index;
      }
    });
    return nearest;
  }

  function pauseHiddenVideos() {
    slides.forEach((slide, index) => {
      if (index !== active) {
        slide.querySelectorAll('video').forEach((video) => video.pause());
      }
    });
  }

  function update() {
    queued = false;
    active = nearestSlide();
    count.textContent = `${active + 1} of ${slides.length}`;
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    pauseHiddenVideos();
  }

  function goTo(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[target].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  track.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.target !== track) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
    else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    else if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) track.querySelectorAll('video').forEach((video) => video.pause());
  });
  window.addEventListener('resize', update);

  controls.hidden = false;
  update();
})();
