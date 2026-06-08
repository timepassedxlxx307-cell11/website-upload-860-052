(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var opened = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('.movie-search-input');
    var yearFilter = document.querySelector('.movie-year-filter');
    var typeFilter = document.querySelector('.movie-type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();

            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var matchedType = !type || cardType.indexOf(type) !== -1;

            card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedYear && matchedType));
        });
    }

    [searchInput, yearFilter, typeFilter].forEach(function (el) {
        if (el) {
            el.addEventListener('input', applyFilters);
            el.addEventListener('change', applyFilters);
        }
    });
})();
