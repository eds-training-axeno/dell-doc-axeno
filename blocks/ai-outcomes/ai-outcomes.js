export default function decorate(block) {

  const rows = [...block.children];
  const introRow = rows.shift();
  if (!introRow) {
    return;
  }
  const introCells = [...introRow.children];
  const headingText =
    introCells[0]?.textContent.trim() || '';
  const descriptionText =
    introCells[1]?.textContent.trim() || '';

  const intro = document.createElement('div');
  intro.className = 'ai-outcomes-intro';

  const heading = document.createElement('h2');
  heading.textContent = headingText;

  const description = document.createElement('p');
  description.textContent = descriptionText;

  intro.append(
    heading,
    description,
  );

  const carousel = document.createElement('div');
  carousel.className = 'ai-outcomes-carousel';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'carousel-btn prev';

  prevButton.setAttribute(
    'aria-label',
    'Previous',
  );
  prevButton.innerHTML = '←';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'carousel-btn next';

  nextButton.setAttribute(
    'aria-label',
    'Next',
  );
  nextButton.innerHTML = '→';

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  rows.forEach((row) => {
    const cells = [...row.children];

    const title = cells[0]?.textContent.trim() || '';

    const cardDescription = cells[1]?.textContent.trim() || '';

    const linkText = cells[2]?.textContent.trim() || '';

    const linkElement = cells[3]?.querySelector('a');

    const linkUrl = linkElement?.href || cells[3]?.textContent.trim() || '#';

    const card = document.createElement('article');
    card.className = 'outcome-card';

    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;

    const cardText = document.createElement('p');
    cardText.textContent = cardDescription;


    const link = document.createElement('a');
    link.href = linkUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = linkText;

    const arrow = document.createElement('span');

    arrow.className = 'arrow';
    arrow.textContent = '↗';
    link.append(arrow);

    card.append(
      cardTitle,
      cardText,
      link,
    );

    track.append(card);
  });

  viewport.append(track);

  carousel.append(
    prevButton,
    viewport,
    nextButton,
  );

  const dots = document.createElement('div');
        dots.className = 'carousel-dots';

  block.textContent = '';

  block.append(
    intro,
    carousel,
    dots,
  );

  let currentPage = 0;

  function getCardsPerPage() {
    if (window.innerWidth <= 768) {
      return 1;
    }

    return 2;
  }

  function getTotalPages() {
    const cardsPerPage = getCardsPerPage();

    return Math.ceil(
      track.children.length /
      cardsPerPage,
    );
  }

  function updateCarousel() {
    const cardsPerPage = getCardsPerPage();

    const totalPages = getTotalPages();

    if (!track.children.length) {
      return;
    }

    if (currentPage < 0) {
      currentPage = 0;
    }

    if (currentPage >= totalPages) {
      currentPage = totalPages - 1;
    }

    const firstCard =
      track.querySelector(
        '.outcome-card',
      );

    if (!firstCard) {
      return;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
  
    const trackStyles =
      window.getComputedStyle(track);

    const gap = parseFloat( trackStyles.columnGap,) || 0;

    const pageMovement =
      cardsPerPage *
      (cardWidth + gap);

    const viewportWidth = viewport.getBoundingClientRect().width;

    const trackWidth = track.scrollWidth;

    const maxTranslate =Math.max( 0,trackWidth - viewportWidth,);
    const requestedTranslate = currentPage * pageMovement;

    const translateX =
      Math.min(
        requestedTranslate,
        maxTranslate,
      );
    track.style.transform = `translate3d(-${translateX}px, 0, 0)`;
    prevButton.disabled = currentPage === 0;

    nextButton.disabled = currentPage >= totalPages - 1;
    dots.innerHTML = '';


    for (
      let i = 0;
      i < totalPages;
      i += 1
    ) {
      const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot';
            dot.setAttribute('aria-label',`Go to slide ${i + 1}`,);

      if (i === currentPage) {
        dot.classList.add('active');
      }
      dot.addEventListener(
        'click',
        () => {
          currentPage = i;

          updateCarousel();
        },
      );
      dots.append(dot);
    }
  }
  prevButton.addEventListener(
    'click',
    () => {
      if (currentPage > 0) {
        currentPage -= 1;

        updateCarousel();
      }
    },
  );
  nextButton.addEventListener(
    'click',
    () => {
      const totalPages =
        getTotalPages();

      if (
        currentPage <
        totalPages - 1
      ) {
        currentPage += 1;

        updateCarousel();
      }
    },
  );

  let resizeTimer;

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);

      resizeTimer =
        setTimeout(() => {
          updateCarousel();
        }, 100);
    },
  );
  updateCarousel();
}