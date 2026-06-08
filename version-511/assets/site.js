(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = all(".hero-slide", hero);
        var dots = all(".hero-dot", hero);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5800);
    }

    function setupFilters() {
        all("[data-filter-form]").forEach(function (form) {
            var scopeSelector = form.getAttribute("data-filter-form");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var input = form.querySelector("[data-filter-input]");
            var region = form.querySelector("[data-filter-region]");
            var year = form.querySelector("[data-filter-year]");
            var genre = form.querySelector("[data-filter-genre]");
            if (!scope) {
                return;
            }
            var cards = all(".movie-card", scope);
            function apply() {
                var query = text(input && input.value);
                var regionValue = text(region && region.value);
                var yearValue = text(year && year.value);
                var genreValue = text(genre && genre.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var cardText = text([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    var ok = true;
                    if (query && cardText.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (regionValue && text(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && text(card.getAttribute("data-year")) !== yearValue) {
                        ok = false;
                    }
                    if (genreValue && text(card.getAttribute("data-genre")).indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                scope.classList.toggle("no-result", visible === 0);
            }
            [input, region, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var layer = document.querySelector(".play-layer");
        if (!video || !streamUrl) {
            return;
        }
        var prepared = false;
        var hlsInstance = null;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            prepare();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    video.controls = true;
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
