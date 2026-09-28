(() => {
  const track = document.querySelector('[data-showcase-track]');
  const controls = document.querySelector('[data-showcase-controls]');
  if (!track || !controls) return;
  // A cached or blocked stylesheet must not expose nonfunctional raw controls.
  if (getComputedStyle(track).getPropertyValue('--showcase-ready').trim() !== '1') return;

  const slides = Array.from(track.querySelectorAll('[data-showcase-slide]'));
  const previous = controls.querySelector('[data-showcase-prev]');
  const next = controls.querySelector('[data-showcase-next]');
  const count = controls.querySelector('[data-showcase-count]');
  if (!slides.length || !previous || !next || !count) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let queued = false;
  let viewportWidth = window.innerWidth;

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
    const nextActive = nearestSlide();
    if (nextActive !== active) {
      // Keep an expanded history on an offscreen card from stretching the rail.
      slides[active].querySelectorAll('details[open]').forEach((details) => { details.open = false; });
      active = nextActive;
      count.textContent = `${active + 1} of ${slides.length}`;
    }
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    pauseHiddenVideos();
  }

  function goTo(index, animate = true) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[target].offsetLeft - slides[0].offsetLeft,
      behavior: animate && !reducedMotion.matches ? 'smooth' : 'auto'
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
  window.addEventListener('resize', () => {
    if (window.innerWidth === viewportWidth) return;
    viewportWidth = window.innerWidth;
    goTo(active, false);
    update();
  });

  track.querySelectorAll('[data-preview-play]').forEach((button) => {
    const video = document.getElementById(button.getAttribute('aria-controls'));
    if (!video) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      video.play().catch(() => { button.hidden = false; });
    });
    video.addEventListener('play', () => { button.hidden = true; });
    video.addEventListener('pause', () => { button.hidden = false; });
    video.addEventListener('ended', () => { button.hidden = false; });
  });

  controls.hidden = false;
  update();
})();
