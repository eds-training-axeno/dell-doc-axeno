import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'dell-blogs-card';

    const [imageCell, titleCell, ctaCell] = cells;

    if (imageCell) {
      const image = document.createElement('div');
      image.className = 'dell-blogs-card-image';
      while (imageCell.firstElementChild) image.append(imageCell.firstElementChild);
      li.append(image);
    }

    const body = document.createElement('div');
    body.className = 'dell-blogs-card-body';

    if (titleCell && titleCell.textContent.trim()) {
      const title = document.createElement('h3');
      title.className = 'dell-blogs-card-title';
      title.textContent = titleCell.textContent.trim();
      body.append(title);
    }

    if (ctaCell && ctaCell.textContent.trim()) {
      const cta = document.createElement('div');
      cta.className = 'dell-blogs-card-cta';
      const link = ctaCell.querySelector('a');
      if (link) {
        link.className = 'dell-blogs-card-link';
        link.textContent = link.textContent.trim();
        cta.append(link);
      } else {
        const span = document.createElement('span');
        span.className = 'dell-blogs-card-link';
        span.textContent = ctaCell.textContent.trim();
        cta.append(span);
      }
      body.append(cta);
    }

    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  ul.querySelectorAll('.dell-blogs-card').forEach((card) => {
    const link = card.querySelector('a[href]');
    if (!link) return;
    card.classList.add('dell-blogs-card--linked');
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', link.textContent);
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      link.click();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });
  });

  block.replaceChildren(ul);
}
