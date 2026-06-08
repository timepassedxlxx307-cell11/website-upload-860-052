(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        document.querySelectorAll('[data-menu-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var menu = document.querySelector('[data-mobile-menu]');
                if (menu) {
                    menu.classList.toggle('is-open');
                }
            });
        });

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var index = 0;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }
        });

        document.querySelectorAll('[data-card-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
            var activeKind = '';

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function apply() {
                var term = normalize(input ? input.value : '');
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var kind = card.getAttribute('data-kind') || '';
                    var matchTerm = !term || text.indexOf(term) !== -1;
                    var matchKind = !activeKind || kind === activeKind;
                    card.hidden = !(matchTerm && matchKind);
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeKind = button.getAttribute('data-filter-button') || '';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }

            apply();
        });

        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var control = player.querySelector('[data-play-control]');
            var sourceTag = video ? video.querySelector('source') : null;
            var streamUrl = sourceTag ? sourceTag.getAttribute('src') : '';
            var attached = false;

            function attach() {
                if (!video || !streamUrl || attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hlsPlayer = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsPlayer.loadSource(streamUrl);
                    hlsPlayer.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attach();
                player.classList.add('is-playing');
                if (video) {
                    var started = video.play();
                    if (started && typeof started.catch === 'function') {
                        started.catch(function () {});
                    }
                }
            }

            if (control) {
                control.addEventListener('click', play);
            }
            player.addEventListener('click', function (event) {
                if (event.target === player || event.target.classList.contains('player-overlay')) {
                    play();
                }
            });
        });
    });
})();
