(function () {
  const menu = document.querySelector(".menu-toggle");
  if (menu) {
    menu.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let active = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(active - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      showSlide(active + 1);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 6500);
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href =
        "./search.html?q=" + encodeURIComponent(input.value.trim());
    });
  });

  const filterInput = document.querySelector("[data-filter-input]");
  const filterList = document.querySelector("[data-filter-list]");
  const cards = filterList
    ? Array.from(filterList.querySelectorAll(".movie-card"))
    : [];
  function applyFilter(value) {
    const query = String(value || "")
      .trim()
      .toLowerCase();
    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.textContent,
      ]
        .join(" ")
        .toLowerCase();
      card.classList.toggle(
        "is-filtered-out",
        Boolean(query) && !haystack.includes(query),
      );
    });
  }
  if (filterInput && filterList) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (initial) {
      filterInput.value = initial;
      applyFilter(initial);
    }
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
    const inlineForm = filterInput.closest("form");
    if (inlineForm) {
      inlineForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter(filterInput.value);
      });
    }
  }
  document.querySelectorAll("[data-chip]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (!filterInput) {
        return;
      }
      filterInput.value = chip.getAttribute("data-chip") || "";
      applyFilter(filterInput.value);
      filterInput.focus();
    });
  });
})();
