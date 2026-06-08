(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('.movie-video');
        var overlay = document.querySelector('.movie-player-overlay');
        var hls = null;
        var ready = false;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function attachStream() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
            video.load();
        }

        function startPlayback() {
            attachStream();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
