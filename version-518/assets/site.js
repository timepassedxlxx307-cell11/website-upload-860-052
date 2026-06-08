document.addEventListener("DOMContentLoaded", function() {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
        });
    });

    if (slides.length > 1) {
        setInterval(function() {
            showSlide(currentSlide + 1);
        }, 6000);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-buttons] button"));
    var activeType = "all";
    var activeCategory = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function activeQuery() {
        for (var i = 0; i < searchInputs.length; i += 1) {
            if (searchInputs[i].value) {
                return normalize(searchInputs[i].value);
            }
        }
        return "";
    }

    function getCards() {
        return Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    }

    function refreshCards() {
        var query = activeQuery();
        var visible = 0;
        getCards().forEach(function(card) {
            var searchText = normalize(card.getAttribute("data-search"));
            var cardType = card.getAttribute("data-type") || "";
            var cardCategory = card.getAttribute("data-category") || "";
            var matchQuery = !query || searchText.indexOf(query) !== -1;
            var matchType = activeType === "all" || cardType === activeType;
            var matchCategory = activeCategory === "all" || cardCategory === activeCategory;
            var shouldShow = matchQuery && matchType && matchCategory;
            card.classList.toggle("is-hidden", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        var oldMessage = document.querySelector("[data-empty-message]");
        if (oldMessage) {
            oldMessage.remove();
        }

        if (!visible && getCards().length) {
            var message = document.createElement("div");
            message.className = "no-results";
            message.setAttribute("data-empty-message", "true");
            message.textContent = "没有找到匹配的影片";
            var target = document.querySelector(".full-grid, .movie-grid, .rank-list, .category-overview-list, .wide-grid");
            if (target && target.parentNode) {
                target.parentNode.insertBefore(message, target.nextSibling);
            }
        }
    }

    searchInputs.forEach(function(input) {
        input.addEventListener("input", refreshCards);
    });

    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            var type = button.getAttribute("data-filter-type");
            var category = button.getAttribute("data-filter-value");

            if (category === "all") {
                activeType = "all";
                activeCategory = "all";
            } else if (type) {
                activeType = type;
                activeCategory = "all";
            } else if (category) {
                activeCategory = category;
                activeType = "all";
            }

            filterButtons.forEach(function(item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            refreshCards();
        });
    });
});
