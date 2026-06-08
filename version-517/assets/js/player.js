(function () {
    function mount(source) {
        var panel = document.querySelector('[data-player]');
        if (!panel) {
            return;
        }
        var video = panel.querySelector('video');
        var overlay = panel.querySelector('.player-overlay');
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready || !video) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('ended', function () {
                if (overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    window.MoviePlayer = { mount: mount };
})();
