export default function decorate(block) {
  /*
   * =========================================
   * GET CONTENT FROM GOOGLE DOC
   * =========================================
   */

  const rows = [...block.children];

  /*
   * The first row contains:
   *
   * Heading | Description
   */

  const introRow = rows.shift();

  if (!introRow) {
    return;
  }

  const introCells = [...introRow.children];

  const headingText =
    introCells[0]?.textContent.trim() || '';

  const descriptionText =
    introCells[1]?.textContent.trim() || '';


  /*
   * =========================================
   * CREATE INTRO SECTION
   * =========================================
   */

  const intro = document.createElement('div');

  intro.className = 'ai-outcomes-intro';


  /*
   * Heading
   */

  const heading = document.createElement('h2');

  heading.textContent = headingText;


  /*
   * Description
   */

  const description = document.createElement('p');

  description.textContent = descriptionText;


  /*
   * Add heading + description
   */

  intro.append(
    heading,
    description,
  );


  /*
   * =========================================
   * CREATE CAROUSEL
   * =========================================
   */

  const carousel = document.createElement('div');

  carousel.className = 'ai-outcomes-carousel';


  /*
   * =========================================
   * PREVIOUS BUTTON
   * =========================================
   */

  const prevButton = document.createElement('button');

  prevButton.type = 'button';

  prevButton.className = 'carousel-btn prev';

  prevButton.setAttribute(
    'aria-label',
    'Previous',
  );

  prevButton.innerHTML = '←';


  /*
   * =========================================
   * NEXT BUTTON
   * =========================================
   */

  const nextButton = document.createElement('button');

  nextButton.type = 'button';

  nextButton.className = 'carousel-btn next';

  nextButton.setAttribute(
    'aria-label',
    'Next',
  );

  nextButton.innerHTML = '→';


  /*
   * =========================================
   * VIEWPORT
   * =========================================
   */

  const viewport = document.createElement('div');

  viewport.className = 'carousel-viewport';


  /*
   * =========================================
   * TRACK
   * =========================================
   */

  const track = document.createElement('div');

  track.className = 'carousel-track';


  /*
   * =========================================
   * CREATE CARDS
   * =========================================
   */

  rows.forEach((row) => {
    const cells = [...row.children];

    /*
     * Google Doc structure:
     *
     * Title
     * Description
     * Link Text
     * Link
     */

    const title =
      cells[0]?.textContent.trim() || '';

    const cardDescription =
      cells[1]?.textContent.trim() || '';

    const linkText =
      cells[2]?.textContent.trim() || '';

    /*
     * Get URL.
     *
     * If Google Doc creates an <a>, use its href.
     * Otherwise use the cell text.
     */

    const linkElement =
      cells[3]?.querySelector('a');

    const linkUrl =
      linkElement?.href ||
      cells[3]?.textContent.trim() ||
      '#';


    /*
     * =======================================
     * CARD
     * =======================================
     */

    const card = document.createElement('article');

    card.className = 'outcome-card';


    /*
     * Card title
     */

    const cardTitle =
      document.createElement('h3');

    cardTitle.textContent = title;


    /*
     * Card description
     */

    const cardText =
      document.createElement('p');

    cardText.textContent =
      cardDescription;


    /*
     * Card link
     */

    const link =
      document.createElement('a');

    link.href = linkUrl;

    link.target = '_blank';

    link.rel = 'noopener noreferrer';

    link.textContent = linkText;


    /*
     * External link arrow
     */

    const arrow =
      document.createElement('span');

    arrow.className = 'arrow';

    arrow.textContent = '↗';

    link.append(arrow);


    /*
     * Add content to card
     */

    card.append(
      cardTitle,
      cardText,
      link,
    );


    /*
     * Add card to track
     */

    track.append(card);
  });


  /*
   * Add track to viewport
   */

  viewport.append(track);


  /*
   * Add carousel controls
   */

  carousel.append(
    prevButton,
    viewport,
    nextButton,
  );


  /*
   * =========================================
   * PAGINATION DOTS
   * =========================================
   */

  const dots =
    document.createElement('div');

  dots.className = 'carousel-dots';


  /*
   * =========================================
   * CLEAR ORIGINAL BLOCK
   * =========================================
   */

  block.textContent = '';


  /*
   * Add final structure
   */

  block.append(
    intro,
    carousel,
    dots,
  );


  /*
   * =========================================
   * CAROUSEL STATE
   * =========================================
   */

  let currentPage = 0;


  /*
   * =========================================
   * CARDS PER PAGE
   * =========================================
   */

  function getCardsPerPage() {
    /*
     * Mobile
     */

    if (window.innerWidth <= 768) {
      return 1;
    }


    /*
     * Desktop
     *
     * 2 cards visible
     */

    return 2;
  }


  /*
   * =========================================
   * TOTAL PAGES
   * =========================================
   */

  function getTotalPages() {
    const cardsPerPage =
      getCardsPerPage();

    return Math.ceil(
      track.children.length /
      cardsPerPage,
    );
  }


  /*
   * =========================================
   * UPDATE CAROUSEL
   * =========================================
   */

  function updateCarousel() {
    const cardsPerPage =
      getCardsPerPage();

    const totalPages =
      getTotalPages();


    /*
     * No cards
     */

    if (!track.children.length) {
      return;
    }


    /*
     * Make sure current page
     * is within valid range.
     */

    if (currentPage < 0) {
      currentPage = 0;
    }

    if (currentPage >= totalPages) {
      currentPage = totalPages - 1;
    }


    /*
     * Get first card.
     */

    const firstCard =
      track.querySelector(
        '.outcome-card',
      );

    if (!firstCard) {
      return;
    }


    /*
     * Get actual card width.
     */

    const cardWidth =
      firstCard.getBoundingClientRect().width;


    /*
     * Get actual gap from CSS.
     */

    const trackStyles =
      window.getComputedStyle(track);

    const gap =
      parseFloat(
        trackStyles.columnGap,
      ) || 0;


    /*
     * =======================================
     * CALCULATE MOVEMENT
     * =======================================
     *
     * Example:
     *
     * Card width = 500px
     * Gap        = 24px
     *
     * 2 cards/page:
     *
     * movement =
     * 2 × (500 + 24)
     *
     * = 1048px
     */

    const pageMovement =
      cardsPerPage *
      (cardWidth + gap);


    /*
     * Maximum possible movement.
     *
     * This prevents the last page
     * from moving too far.
     */

    const viewportWidth =
      viewport.getBoundingClientRect().width;

    const trackWidth =
      track.scrollWidth;

    const maxTranslate =
      Math.max(
        0,
        trackWidth - viewportWidth,
      );


    /*
     * Requested movement.
     */

    const requestedTranslate =
      currentPage *
      pageMovement;


    /*
     * Never exceed available
     * track width.
     */

    const translateX =
      Math.min(
        requestedTranslate,
        maxTranslate,
      );


    /*
     * Apply movement.
     */

    track.style.transform =
      `translate3d(-${translateX}px, 0, 0)`;


    /*
     * =======================================
     * UPDATE PREVIOUS BUTTON
     * =======================================
     */

    prevButton.disabled =
      currentPage === 0;


    /*
     * =======================================
     * UPDATE NEXT BUTTON
     * =======================================
     */

    nextButton.disabled =
      currentPage >= totalPages - 1;


    /*
     * =======================================
     * UPDATE DOTS
     * =======================================
     */

    dots.innerHTML = '';


    for (
      let i = 0;
      i < totalPages;
      i += 1
    ) {
      const dot =
        document.createElement('button');

      dot.type = 'button';

      dot.className = 'dot';

      dot.setAttribute(
        'aria-label',
        `Go to slide ${i + 1}`,
      );


      /*
       * Active dot
       */

      if (i === currentPage) {
        dot.classList.add('active');
      }


      /*
       * Dot click
       */

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


  /*
   * =========================================
   * PREVIOUS BUTTON
   * =========================================
   */

  prevButton.addEventListener(
    'click',
    () => {
      if (currentPage > 0) {
        currentPage -= 1;

        updateCarousel();
      }
    },
  );


  /*
   * =========================================
   * NEXT BUTTON
   * =========================================
   */

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


  /*
   * =========================================
   * RESPONSIVE RESIZE
   * =========================================
   */

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


  /*
   * =========================================
   * INITIALIZE
   * =========================================
   */

  updateCarousel();
}