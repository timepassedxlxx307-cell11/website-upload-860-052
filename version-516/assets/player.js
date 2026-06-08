(function () {
  function setupVideo(video) {
    var src = video.getAttribute('data-stream');

    if (!src || video.getAttribute('data-ready') === '1') {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }

  function bindPlayer(card) {
    var video = card.querySelector('video[data-stream]');
    var button = card.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    setupVideo(video);

    if (button) {
      button.addEventListener('click', function () {
        setupVideo(video);
        card.classList.add('is-playing');
        video.play().catch(function () {});
      });
    }

    video.addEventListener('play', function () {
      card.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove('is-playing');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(bindPlayer);
})();
