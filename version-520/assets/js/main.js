(function() {
    var header = document.querySelector("[data-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function setHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-site-search]").forEach(function(input) {
        input.addEventListener("keydown", function(event) {
            var query = input.value.trim();
            if (event.key === "Enter" && query) {
                window.location.href = "./search.html?q=" + encodeURIComponent(query);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startHeroTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener("click", function() {
            showSlide(current - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function() {
            showSlide(current + 1);
            startHeroTimer();
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startHeroTimer();
        });
    });

    startHeroTimer();

    var localSearch = document.querySelector("[data-local-search]");
    var cardList = document.querySelector("[data-card-list]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var sortSelect = document.querySelector("[data-sort]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function applyCards() {
        var query = normalize(localSearch ? localSearch.value : "");
        cards.forEach(function(card) {
            var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre"));
            var passQuery = !query || haystack.indexOf(query) !== -1;
            var passFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
            card.classList.toggle("hidden-card", !(passQuery && passFilter));
        });
    }

    function sortCards(value) {
        if (!cardList || !value || value === "default") {
            return;
        }
        var sorted = cards.slice();
        if (value === "year-desc") {
            sorted.sort(function(a, b) {
                return parseInt(b.getAttribute("data-year"), 10) - parseInt(a.getAttribute("data-year"), 10);
            });
        }
        if (value === "year-asc") {
            sorted.sort(function(a, b) {
                return parseInt(a.getAttribute("data-year"), 10) - parseInt(b.getAttribute("data-year"), 10);
            });
        }
        if (value === "title") {
            sorted.sort(function(a, b) {
                return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
            });
        }
        sorted.forEach(function(card) {
            cardList.appendChild(card);
        });
    }

    if (localSearch) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            localSearch.value = initialQuery;
        }
        localSearch.addEventListener("input", applyCards);
        applyCards();
    }

    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            filterButtons.forEach(function(item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            activeFilter = button.getAttribute("data-filter-value") || "all";
            applyCards();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", function() {
            sortCards(sortSelect.value);
            applyCards();
        });
    }
}());
