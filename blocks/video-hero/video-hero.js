export default function decorate(block) {
  const [
    backgroundVideoRow,
    fullVideoRow,
    eyebrowRow,
    headingRow,
    descriptionRow,
    playVideoRow,
    secondaryCtaRow,
  ] = [...block.children];

  const backgroundVideoUrl = backgroundVideoRow?.querySelector('a')?.href
    || backgroundVideoRow?.textContent.trim();

  const fullVideoUrl = fullVideoRow?.querySelector('a')?.href
    || fullVideoRow?.textContent.trim();

  const eyebrow = eyebrowRow?.textContent.trim();

  const heading = headingRow
    ?.querySelector('h1, h2, h3, h4, h5, h6')
    ?.textContent.trim()
    || headingRow?.textContent.trim();

  const description = descriptionRow?.textContent.trim();

  const playVideoLabel = playVideoRow?.textContent.trim() || 'Play Video';

  const authoredCta = secondaryCtaRow?.querySelector('a');
  const secondaryCtaLabel = authoredCta?.textContent.trim();
  const secondaryCtaUrl = authoredCta?.href;

  block.innerHTML = '';

  const backgroundVideo = document.createElement('video');
  backgroundVideo.className = 'video-hero-background';
  backgroundVideo.src = backgroundVideoUrl;
  backgroundVideo.autoplay = true;
  backgroundVideo.muted = true;
  backgroundVideo.loop = true;
  backgroundVideo.playsInline = true;

  // Decorative background video
  backgroundVideo.setAttribute('aria-hidden', 'true');
  block.append(backgroundVideo);

  const overlay = document.createElement('div');
  overlay.className = 'video-hero-overlay';
  block.append(overlay);

  const content = document.createElement('div');
  content.className = 'video-hero-content';

  if (eyebrow) {
    const eyebrowElement = document.createElement('p');
    eyebrowElement.className = 'video-hero-eyebrow';
    eyebrowElement.textContent = eyebrow;
    content.append(eyebrowElement);
  }

  if (heading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'video-hero-heading';
    headingElement.textContent = heading;
    content.append(headingElement);
  }

  if (description) {
    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'video-hero-description';
    descriptionElement.textContent = description;
    content.append(descriptionElement);
  }

  const playButton = document.createElement('button');
  playButton.className = 'video-hero-play';
  playButton.type = 'button';

  const playIcon = document.createElement('span');
  playIcon.className = 'video-hero-play-icon';
  playIcon.setAttribute('aria-hidden', 'true');
  playIcon.textContent = '▶';

  const playLabel = document.createElement('span');
  playLabel.textContent = playVideoLabel;

  playButton.append(playIcon, playLabel);
  content.append(playButton);

  if (secondaryCtaLabel && secondaryCtaUrl) {
    const secondaryCta = document.createElement('a');
    secondaryCta.className = 'video-hero-secondary-cta';
    secondaryCta.href = secondaryCtaUrl;
    secondaryCta.textContent = secondaryCtaLabel;
    content.append(secondaryCta);
  }

  block.append(content);

  const controlButton = document.createElement('button');
  controlButton.className = 'video-hero-control';
  controlButton.type = 'button';

  const controlLabel = document.createElement('span');
  controlLabel.textContent = 'Pause';

  const controlIcon = document.createElement('span');
  controlIcon.className = 'video-hero-control-icon';
  controlIcon.setAttribute('aria-hidden', 'true');
  controlIcon.textContent = 'Ⅱ';

  controlButton.append(controlLabel, controlIcon);
  block.append(controlButton);

  controlButton.addEventListener('click', () => {
    if (backgroundVideo.paused) {
      backgroundVideo.play();
      controlLabel.textContent = 'Pause';
      controlIcon.textContent = 'Ⅱ';
    } else {
      backgroundVideo.pause();
      controlLabel.textContent = 'Play';
      controlIcon.textContent = '▶';
    }
  });

  const modal = document.createElement('div');
  modal.className = 'video-hero-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Video');
  modal.setAttribute('aria-hidden', 'true');

  /* Modal content */
  const modalContent = document.createElement('div');
  modalContent.className = 'video-hero-modal-content';

  /* Close button */
  const closeButton = document.createElement('button');
  closeButton.className = 'video-hero-modal-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close video');
  closeButton.innerHTML = '×';

  /* Full video */
  const fullVideo = document.createElement('video');
  fullVideo.className = 'video-hero-modal-video';
  fullVideo.src = fullVideoUrl;
  fullVideo.controls = true;
  fullVideo.playsInline = true;

  modalContent.append(closeButton, fullVideo);
  modal.append(modalContent);
  document.body.append(modal);

  const openModal = () => {
    backgroundVideo.pause();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-hero-modal-open');
    fullVideo.currentTime = 0;
    fullVideo.play();
    closeButton.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('video-hero-modal-open');
    fullVideo.pause();
    fullVideo.currentTime = 0;
    backgroundVideo.play();
    controlLabel.textContent = 'Pause';
    controlIcon.textContent = 'Ⅱ';
    playButton.focus();
  };

  playButton.addEventListener('click', openModal);

  closeButton.addEventListener('click', closeModal);

  /* Close when clicking outside video */
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  /* Close with ESC */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape'
      && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}