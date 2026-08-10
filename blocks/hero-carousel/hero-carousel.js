/**
 * Hero Carousel
 *
 * One EDS block supporting:
 * - Multiple slides, each authored as: [image stack] | [content] | [theme]
 * - Responsive images: 1st image in the cell is mobile, 2nd is tablet/desktop
 * - Slide themes (3rd cell: "light", "dark", or "dark-overlay"; defaults to
 *   light) — "dark" adds a solid panel behind the text for photos that need
 *   help with contrast; "dark-overlay" skips the panel for photos with a
 *   naturally dark background already built in
 * - 1 or 2 CTAs
 * - Auto-advance every 8 seconds, cross-fading between slides; manual
 *   navigation (arrows/swipe/keyboard) slides the track instead
 * - Previous / next controls with a slide counter
 * - Play / pause autoplay toggle
 * - Touch swipe
 * - Keyboard navigation
 * - Reduced-motion support
 */

const AUTOPLAY_MS = 8000;
const FADE_MS = 500;

// Single breakpoint. Position, not guessed aspect ratio, decides which image
// is which: the 1st image authored in the cell is mobile, the 2nd is
// tablet/desktop. Rendition widths are requested larger than typically
// needed so images stay sharp on high-DPI displays; the image service caps
// at the asset's native size, so asking for more than is available is
// harmless.
const DESKTOP_BREAKPOINT = 768;
const DESKTOP_RENDITION_WIDTH = 2560;
const MOBILE_RENDITION_WIDTH = 900;

function withRenditionWidth(src, width) {
  if (!src) return src;

  try {
    const url = new URL(src, window.location.href);
    url.searchParams.set('width', width);
    return url.toString();
  } catch {
    return src;
  }
}

function createPicture(pictures, index) {
  const picture = document.createElement('picture');
  picture.className = 'hero-carousel-picture';

  if (!pictures.length) return picture;

  const [mobilePicture, desktopPicture = mobilePicture] = pictures;
  const mobileSrc = mobilePicture.querySelector('img')?.src;
  const desktopSrc = desktopPicture.querySelector('img')?.src || mobileSrc;

  if (desktopSrc && desktopSrc !== mobileSrc) {
    const source = document.createElement('source');
    source.media = `(min-width: ${DESKTOP_BREAKPOINT}px)`;
    source.srcset = withRenditionWidth(desktopSrc, DESKTOP_RENDITION_WIDTH);
    picture.append(source);
  }

  const img = document.createElement('img');
  img.className = 'hero-carousel-image';
  img.src = withRenditionWidth(mobileSrc, MOBILE_RENDITION_WIDTH);
  img.alt = '';
  img.loading = index === 0 ? 'eager' : 'lazy';

  if (index === 0) {
    img.fetchPriority = 'high';
  }

  picture.append(img);

  return picture;
}

function createCTA(text, url, type) {
  if (!text || !url) return null;

  const link = document.createElement('a');
  link.className = `hero-carousel-cta hero-carousel-cta-${type}`;
  link.href = url;
  link.textContent = text;

  return link;
}

// Reads the content cell as authored: a bold paragraph (eyebrow), then a plain
// paragraph (title), then a plain paragraph (description), then a paragraph
// whose links become the CTA(s). Order-based rather than column-based because
// authors write this as free-flowing paragraphs, not a fixed field grid.
function parseContent(contentCell) {
  const paragraphs = contentCell ? [...contentCell.querySelectorAll(':scope > p')] : [];

  let eyebrow = '';
  let title = '';
  let description = '';
  const ctas = [];

  paragraphs.forEach((p) => {
    const links = [...p.querySelectorAll('a')].filter((a) => a.textContent.trim());

    if (links.length) {
      links.forEach((a) => ctas.push({ text: a.textContent.trim(), url: a.href }));
      return;
    }

    const text = p.textContent.trim();
    if (!text) return;

    if (p.querySelector('strong, b') && !eyebrow) {
      eyebrow = text;
    } else if (!title) {
      title = text;
    } else if (!description) {
      description = text;
    } else {
      description = `${description} ${text}`;
    }
  });

  return {
    eyebrow, title, description, ctas,
  };
}

function createSlide(slide, index, total) {
  const article = document.createElement('article');
  article.className = 'hero-carousel-slide';

  article.setAttribute('role', 'group');
  article.setAttribute('aria-roledescription', 'Slide');
  article.setAttribute('aria-label', `Slide ${index + 1} of ${total}`);
  article.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
  article.classList.add(`hero-carousel-slide-${slide.theme}`);

  const picture = createPicture(slide.pictures, index);

  const content = document.createElement('div');
  content.className = 'hero-carousel-content';

  const scrim = document.createElement('div');
  scrim.className = 'hero-carousel-scrim';
  content.append(scrim);

  const inner = document.createElement('div');
  inner.className = 'hero-carousel-content-inner';

  if (slide.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'hero-carousel-eyebrow';
    eyebrow.textContent = slide.eyebrow;
    inner.append(eyebrow);
  }

  if (slide.title) {
    const title = document.createElement('h2');
    title.className = 'hero-carousel-title';
    title.textContent = slide.title;
    inner.append(title);
  }

  if (slide.description) {
    const description = document.createElement('div');
    description.className = 'hero-carousel-description';
    description.textContent = slide.description;
    inner.append(description);
  }

  const ctas = document.createElement('div');
  ctas.className = 'hero-carousel-ctas';

  slide.ctas.slice(0, 2).forEach((cta, i) => {
    const link = createCTA(cta.text, cta.url, i === 0 ? 'primary' : 'secondary');
    if (link) ctas.append(link);
  });

  if (ctas.children.length) inner.append(ctas);

  content.append(inner);
  article.append(picture, content);

  return article;
}

function createControls(total) {
  const controls = document.createElement('div');
  controls.className = 'hero-carousel-controls';

  const nav = document.createElement('div');
  nav.className = 'hero-carousel-nav';

  const prev = document.createElement('button');
  prev.className = 'hero-carousel-arrow hero-carousel-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.innerHTML = '<span aria-hidden="true">←</span>';

  const counter = document.createElement('div');
  counter.className = 'hero-carousel-counter';
  counter.setAttribute('aria-live', 'off');
  counter.innerHTML = `
    <span class="hero-carousel-counter-current">1</span><span aria-hidden="true">/</span><span class="hero-carousel-counter-total">${total}</span>
  `;

  const next = document.createElement('button');
  next.className = 'hero-carousel-arrow hero-carousel-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next slide');
  next.innerHTML = '<span aria-hidden="true">→</span>';

  nav.append(prev, counter, next);

  const playPause = document.createElement('button');
  playPause.className = 'hero-carousel-playpause';
  playPause.type = 'button';
  playPause.innerHTML = `
    <span class="hero-carousel-playpause-label">Play</span>
    <span class="hero-carousel-playpause-icon" aria-hidden="true"></span>
  `;

  controls.append(nav, playPause);

  return controls;
}

function initialiseCarousel(block, total) {
  const viewport = block.querySelector('.hero-carousel-viewport');
  const track = block.querySelector('.hero-carousel-track');
  const slides = [...block.querySelectorAll('.hero-carousel-slide')];
  const prev = block.querySelector('.hero-carousel-prev');
  const next = block.querySelector('.hero-carousel-next');
  const counter = block.querySelector('.hero-carousel-counter');
  const counterCurrent = block.querySelector('.hero-carousel-counter-current');
  const playPause = block.querySelector('.hero-carousel-playpause');
  const playPauseLabel = block.querySelector('.hero-carousel-playpause-label');

  if (total <= 1) {
    block.classList.add('hero-carousel-single');
    return;
  }

  let current = 0;
  let timer = null;
  let isPlaying = false;
  let touchStartX = 0;

  // Slides sit side by side in a flex row so the sliding transform works,
  // which means the row would otherwise stretch every slide to match the
  // tallest one. Explicitly syncing the viewport to the active slide's own
  // height keeps shorter slides from leaving blank space below them.
  //
  // A plain 'load' listener on the image isn't reliable for this: the event
  // can fire before the browser has finished applying layout, so reading
  // offsetHeight at that exact moment sometimes still measures 0 (observed
  // directly — the height only became measurable once a *different* slide's
  // image loaded afterward, coincidentally forcing a reflow). ResizeObserver
  // reports the element's actual rendered size whenever it changes, for
  // whatever reason, which sidesteps that timing problem entirely.
  const syncHeight = (heightPx) => {
    viewport.style.height = `${heightPx}px`;
  };

  let observedSlide = null;
  const heightObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) syncHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
  });

  const observeActiveSlide = () => {
    if (observedSlide) heightObserver.unobserve(observedSlide);
    observedSlide = slides[current];
    heightObserver.observe(observedSlide);
  };

  const applySlideState = (index) => {
    current = (index + total) % total;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    counterCurrent.textContent = String(current + 1);
    observeActiveSlide();
  };

  // Autoplay — true cross-fade: the incoming slide is temporarily stacked
  // directly on top of the outgoing one (as an absolutely-positioned
  // overlay) so both are visible and animating at the same time, one
  // dissolving out as the other dissolves in. Once that settles, the track
  // jumps instantly to the incoming slide's normal position and the overlay
  // is removed, so manual navigation afterward behaves exactly as before.
  let fading = false;
  let fadeTimeouts = [];

  const cancelFade = () => {
    if (!fading) return;

    fadeTimeouts.forEach((id) => window.clearTimeout(id));
    fadeTimeouts = [];
    fading = false;

    // Clear any inline styles / overlay state left mid-fade so every slide
    // is back to its normal resting state before manual navigation takes
    // over — applySlideState() (called right after this) will then set
    // is-active/aria-hidden correctly for the slide the user navigated to.
    slides.forEach((slide) => {
      slide.style.transition = '';
      slide.style.opacity = '';
      slide.classList.remove('hero-carousel-slide-fade-overlay');
    });
  };

  // Manual navigation (arrows, swipe, keyboard) — slides the whole track
  // horizontally, unchanged from before. Takes precedence over an
  // in-progress autoplay fade rather than fighting with it.
  const goTo = (index) => {
    cancelFade();
    applySlideState(index);
    track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
  };

  const fadeTo = (index) => {
    const incomingIndex = (index + total) % total;
    if (fading || incomingIndex === current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      goTo(index);
      return;
    }

    fading = true;
    const outgoing = slides[current];
    const incoming = slides[incomingIndex];

    incoming.classList.add('hero-carousel-slide-fade-overlay', 'is-active');
    incoming.setAttribute('aria-hidden', 'false');
    incoming.style.opacity = '0';

    // Force a reflow so the browser registers opacity:0 before animating to
    // 1 below, instead of possibly collapsing straight to the end state.
    // eslint-disable-next-line no-unused-expressions
    incoming.offsetWidth;

    outgoing.style.transition = `opacity ${FADE_MS}ms ease`;
    incoming.style.transition = `opacity ${FADE_MS}ms ease`;
    outgoing.style.opacity = '0';
    incoming.style.opacity = '1';

    const settleTimeout = window.setTimeout(() => {
      track.style.transition = 'none';
      applySlideState(incomingIndex);
      track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

      outgoing.style.transition = '';
      outgoing.style.opacity = '';
      incoming.style.transition = '';
      incoming.style.opacity = '';
      incoming.classList.remove('hero-carousel-slide-fade-overlay');

      // Reflow before re-enabling the track's transition, same reasoning
      // as above — otherwise the instant jump can get animated instead.
      // eslint-disable-next-line no-unused-expressions
      track.offsetWidth;
      track.style.transition = '';
      fading = false;
    }, FADE_MS);
    fadeTimeouts.push(settleTimeout);
  };

  const updatePlayPauseUI = () => {
    playPause.classList.toggle('is-playing', isPlaying);
    playPause.setAttribute('aria-label', isPlaying ? 'Pause slideshow' : 'Play slideshow');
    playPauseLabel.textContent = isPlaying ? 'Pause' : 'Play';
    // Avoid interrupting screen readers with an announcement for every
    // automatic slide change; only announce slide changes once paused.
    counter.setAttribute('aria-live', isPlaying ? 'off' : 'polite');
  };

  const stopAutoplay = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    isPlaying = false;
    updatePlayPauseUI();
  };

  const startAutoplay = () => {
    if (timer) window.clearInterval(timer);

    timer = window.setInterval(() => {
      fadeTo(current + 1);
    }, AUTOPLAY_MS);

    isPlaying = true;
    updatePlayPauseUI();
  };

  const resetAutoplayTimer = () => {
    if (isPlaying) startAutoplay();
  };

  prev.addEventListener('click', () => {
    goTo(current - 1);
    resetAutoplayTimer();
  });

  next.addEventListener('click', () => {
    goTo(current + 1);
    resetAutoplayTimer();
  });

  playPause.addEventListener('click', () => {
    if (isPlaying) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  block.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current - 1);
      resetAutoplayTimer();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(current + 1);
      resetAutoplayTimer();
    }
  });

  track.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const distance = touchEndX - touchStartX;

    if (Math.abs(distance) < 50) return;

    if (distance < 0) {
      goTo(current + 1);
    } else {
      goTo(current - 1);
    }

    resetAutoplayTimer();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    } else if (isPlaying) {
      startAutoplay();
    }
  });

  goTo(0);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updatePlayPauseUI();
  } else {
    startAutoplay();
  }
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) return;

  const slides = rows.map((row) => {
    const [imageCell, contentCell, themeCell] = [...row.children];
    const pictures = imageCell ? [...imageCell.querySelectorAll('picture')] : [];
    const themeRaw = themeCell?.textContent?.trim().toLowerCase() || '';
    const theme = themeRaw === 'dark' || themeRaw === 'dark-overlay' ? themeRaw : 'light';

    return {
      pictures,
      theme,
      ...parseContent(contentCell),
    };
  }).filter((slide) => slide.pictures.length || slide.title);

  if (!slides.length) return;

  block.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'hero-carousel-viewport';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  slides.forEach((slide, index) => {
    track.append(createSlide(slide, index, slides.length));
  });

  viewport.append(track);

  const controls = createControls(slides.length);

  block.append(viewport, controls);

  initialiseCarousel(block, slides.length);
}
