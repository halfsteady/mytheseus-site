(() => {
  const film = document.querySelector('[data-film]');
  const link = film && film.querySelector('[data-film-link]');
  if (!link) return;
  // The poster is a plain link to YouTube, so it works without this script. With it, pressing
  // play swaps in YouTube's privacy-enhanced player. Nothing from YouTube loads before that.
  const id = new URL(link.href).pathname.split('/').pop();
  if (!/^[\w-]{11}$/.test(id)) return;

  link.addEventListener('click', (event) => {
    // Let "open in a new tab" gestures keep their normal meaning.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    frame.title = 'Apps that grow with you: a 30-second film about the idea behind Mytheseus';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const stage = document.createElement('div');
    stage.className = 'film-frame film-live';
    stage.appendChild(frame);
    link.replaceWith(stage);
    frame.focus();
  });
})();
