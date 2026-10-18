(() => {
  // Self-hosted films: a large play button over the poster. The video keeps its native
  // controls, so it still plays without this script. Nothing loads until play.
  document.querySelectorAll('[data-play-film]').forEach((button) => {
    const video = document.getElementById(button.getAttribute('aria-controls'));
    if (!video) return;
    const sync = () => { button.hidden = !video.paused; };
    // Native controls come back once the film has started, for pausing and seeking.
    video.controls = false;
    button.addEventListener('click', () => { video.controls = true; video.play().catch(sync); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);
    sync();
  });
  // Only one video plays at a time, and none keeps playing in a hidden tab.
  const videos = Array.from(document.querySelectorAll('video'));
  videos.forEach((video) => video.addEventListener('play', () => {
    videos.forEach((other) => { if (other !== video) other.pause(); });
  }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach((video) => video.pause());
  });
})();
