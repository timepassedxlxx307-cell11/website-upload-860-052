(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        restart();
    }

    var searchInput = document.querySelector('[data-search]');
    var list = document.querySelector('[data-card-list]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function applyListState() {
        if (!list) {
            return;
        }

        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(list.children);

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var region = (card.getAttribute('data-region') || '').toLowerCase();
            var genre = (card.getAttribute('data-genre') || '').toLowerCase();
            var year = (card.getAttribute('data-year') || '').toLowerCase();
            var text = title + ' ' + region + ' ' + genre + ' ' + year + ' ' + card.textContent.toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = activeFilter === 'all' || region.indexOf(activeFilter.toLowerCase()) !== -1 || genre.indexOf(activeFilter.toLowerCase()) !== -1;
            card.hidden = !(matchQuery && matchFilter);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        searchInput.addEventListener('input', applyListState);
        applyListState();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });

            button.classList.add('active');
            activeFilter = button.getAttribute('data-filter') || 'all';
            applyListState();
        });
    });
}());

function setupMoviePlayer(src) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var loading = document.getElementById('playerLoading');
    var message = document.getElementById('playerMessage');
    var hls = null;
    var ready = false;

    if (!video || !overlay) {
        return;
    }

    function showLoading(show) {
        if (loading) {
            loading.classList.toggle('visible', Boolean(show));
        }
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text || '';
            message.classList.toggle('visible', Boolean(text));
        }
    }

    function startPlayback() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('hidden');
            });
        }
    }

    function attachAndPlay() {
        overlay.classList.add('hidden');
        showMessage('');
        showLoading(true);

        if (ready) {
            showLoading(false);
            startPlayback();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
                showLoading(false);
                startPlayback();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showLoading(false);
                    showMessage('播放失败，请刷新重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
                ready = true;
                showLoading(false);
                startPlayback();
            }, { once: true });
            video.load();
        } else {
            showLoading(false);
            showMessage('播放失败，请刷新重试');
        }
    }

    overlay.addEventListener('click', attachAndPlay);

    video.addEventListener('click', function () {
        if (!ready) {
            attachAndPlay();
            return;
        }

        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
