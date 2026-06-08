(function () {
  function activate(wrapper) {
    const video = wrapper.querySelector("video");
    const stream = wrapper.getAttribute("data-stream");
    const overlay = wrapper.querySelector(".player-overlay");
    if (!video || !stream) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!wrapper.hlsInstance) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        wrapper.hlsInstance = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }
    if (!video.src) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  document.querySelectorAll(".movie-player").forEach(function (wrapper) {
    const overlay = wrapper.querySelector(".player-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        activate(wrapper);
      });
    }
    wrapper.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "VIDEO") {
        return;
      }
      activate(wrapper);
    });
  });
})();
