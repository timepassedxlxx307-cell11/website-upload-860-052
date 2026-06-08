function closestCover(element) {
  return element.closest('.movie-cover, .featured-cover, .horizontal-cover, .rank-card-cover, .hero-poster, .detail-poster, .category-thumb-stack');
}

function markMissingImages() {
  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      var cover = closestCover(image);
      if (cover) {
        cover.classList.add('image-missing');
      }
    });
  });
}

function setupMobileMenu() {
  var button = document.querySelector('[data-mobile-menu-button]');
  var nav = document.querySelector('[data-site-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  var carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var prev = carousel.querySelector('[data-hero-prev]');
  var next = carousel.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  show(0);
  start();
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setupFilterPanel() {
  var panel = document.querySelector('[data-filter-panel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  if (!panel || cards.length === 0) {
    return;
  }

  var keywordInput = panel.querySelector('[data-filter-keyword]');
  var typeInput = panel.querySelector('[data-filter-type]');
  var yearInput = panel.querySelector('[data-filter-year]');
  var resetButton = panel.querySelector('[data-filter-reset]');
  var emptyState = document.querySelector('[data-empty-state]');

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var type = normalize(typeInput && typeInput.value);
    var year = normalize(yearInput && yearInput.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesType = !type || cardType.indexOf(type) !== -1;
      var matchesYear = !year || cardYear.indexOf(year) !== -1;
      var visible = matchesKeyword && matchesType && matchesYear;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  [keywordInput, typeInput, yearInput].forEach(function (input) {
    if (input) {
      input.addEventListener('input', applyFilter);
      input.addEventListener('change', applyFilter);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      if (keywordInput) {
        keywordInput.value = '';
      }
      if (typeInput) {
        typeInput.value = '';
      }
      if (yearInput) {
        yearInput.value = '';
      }
      applyFilter();
    });
  }
}

function setupSearchPage() {
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  if (!form || !input || !results || !window.SEARCH_DATA) {
    return;
  }

  function getQueryFromLocation() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-movie-card>' +
      '  <a class="movie-cover" href="video/' + escapeAttribute(movie.id) + '.html" aria-label="观看' + escapeAttribute(movie.title) + '">' +
      '    <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">' +
      '    <span class="cover-fallback">' + escapeHtml(movie.title) + '</span>' +
      '    <span class="play-badge">▶</span>' +
      '  </a>' +
      '  <div class="movie-info">' +
      '    <div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '    <h3><a href="video/' + escapeAttribute(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function movieMatches(movie, query) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' ').toLowerCase();
    return text.indexOf(query.toLowerCase()) !== -1;
  }

  function render(query) {
    var trimmed = query.trim();
    if (!trimmed) {
      status.textContent = '输入关键词后将显示匹配结果。';
      status.classList.add('is-visible');
      return;
    }

    var matched = window.SEARCH_DATA.filter(function (movie) {
      return movieMatches(movie, trimmed);
    }).slice(0, 120);

    if (matched.length === 0) {
      results.innerHTML = '';
      status.textContent = '没有找到匹配影片。';
      status.classList.add('is-visible');
      return;
    }

    results.innerHTML = matched.map(createCard).join('');
    status.textContent = '已显示相关影片，点击卡片可进入详情页。';
    status.classList.add('is-visible');
    markMissingImages();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  var initialQuery = getQueryFromLocation();
  if (initialQuery) {
    input.value = initialQuery;
    render(initialQuery);
  } else {
    status.classList.add('is-visible');
  }
}

function setupPlayer() {
  var video = document.getElementById('video-player');
  var button = document.querySelector('[data-play-button]');
  var message = document.querySelector('[data-player-message]');
  if (!video || !button) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('is-visible');
  }

  function playVideo() {
    var source = video.getAttribute('data-src');
    if (!source) {
      showMessage('当前影片暂未配置播放源。');
      return;
    }

    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        showMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          showMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('播放源暂时无法加载，请刷新页面或稍后重试。');
        }
      });
      return;
    }

    showMessage('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。');
  }

  button.addEventListener('click', playVideo);
}

document.addEventListener('DOMContentLoaded', function () {
  markMissingImages();
  setupMobileMenu();
  setupHeroCarousel();
  setupFilterPanel();
  setupSearchPage();
  setupPlayer();
});
