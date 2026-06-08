(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('.nav-toggle');
    var mobileNav = qs('.mobile-nav');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement;
        var search = qs('[data-filter-search]', panel);
        var region = qs('[data-filter-region]', panel);
        var type = qs('[data-filter-type]', panel);
        var year = qs('[data-filter-year]', panel);
        var cards = qsa('.movie-card', scope);
        var noResults = qs('.no-results', scope);

        function includes(value, query) {
            return String(value || '').toLowerCase().indexOf(String(query || '').toLowerCase()) !== -1;
        }

        function update() {
            var query = search ? search.value.trim() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags,
                    card.textContent
                ].join(' ');
                var match = true;
                if (query && !includes(text, query)) {
                    match = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    match = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    match = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    match = false;
                }
                card.classList.toggle('hidden', !match);
                if (match) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle('show', visible === 0);
            }
        }

        [search, region, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', update);
                el.addEventListener('change', update);
            }
        });
    });

    qsa('.hero-slider').forEach(function (slider) {
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
                dot.setAttribute('aria-current', i === current ? 'true' : 'false');
            });
        }

        function advance(step) {
            show(current + step);
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                advance(1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                advance(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                advance(1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    });
})();
