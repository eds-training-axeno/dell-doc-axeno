function formatMetricValue(value, suffix = '') {
  const safeValue = Number(value);

  const formatted = Number.isInteger(safeValue)
    ? safeValue.toLocaleString('en-US')
    : safeValue.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });

  return `${formatted}${suffix}`;
}

function parseMetricValue(rawText) {
  const match = rawText.match(/-?\d[\d,]*(?:\.\d+)?/);

  if (!match) {
    return {
      target: 0,
      suffix: rawText,
    };
  }

  const target = Number(match[0].replace(/,/g, ''));

  const suffix = rawText
    .slice(match.index + match[0].length)
    .trim();

  return {
    target,
    suffix,
  };
}

function animateMetricValue(element) {
  const rawText = element.dataset.rawText || element.textContent.trim();
  const { target, suffix } = parseMetricValue(rawText);

  if (!Number.isFinite(target) || target === 0) {
    element.textContent = rawText;
    return;
  }

  const start = performance.now();
  const duration = 3000;
  const steps = 30;
  let step = 0;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - ((1 - progress) ** 4);

    if (step < steps) {
      const randomOffset = target * (0.02 + Math.random() * 0.12);

      const displayedValue = progress < 0.8
        ? target * (0.12 + eased * 0.88)
            + randomOffset * (1 - progress)
        : target;

      element.textContent = formatMetricValue(
        displayedValue,
        suffix,
      );

      step += 1;
      requestAnimationFrame(tick);
      return;
    }

    element.textContent = formatMetricValue(target, suffix);
  };

  requestAnimationFrame(tick);
}

let activePopover = null;

function closeActivePopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

function openSourcePopover(anchor, source) {
  const popoverKey = source.href || source.text;

  if (activePopover && activePopover.dataset.forSource === popoverKey) {
    closeActivePopover();
    return;
  }

  closeActivePopover();

  const popover = document.createElement('div');
  popover.className = 'ai-result-popover';
  popover.dataset.forSource = popoverKey;

  let content;

  if (source.href) {
    content = document.createElement('a');
    content.href = source.href;
    content.textContent = source.href;
    content.target = '_blank';
    content.rel = 'noopener noreferrer';
  } else {
    content = document.createElement('p');
    content.textContent = source.text;
  }

  content.className = 'ai-result-popover-url';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'ai-result-popover-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', closeActivePopover);

  popover.append(content, closeButton);
  anchor.append(popover);

  activePopover = popover;
}

function decorateFootnoteSource(footnote, source, infoIcon) {
  const anchor = footnote;
  anchor.classList.add('ai-result-footnote-has-source');

  const trigger = (e) => {
    e.preventDefault();
    openSourcePopover(anchor, source);
  };

  infoIcon.addEventListener('click', trigger);
  infoIcon.setAttribute('role', 'button');
  infoIcon.setAttribute('tabindex', '0');
  infoIcon.removeAttribute('aria-hidden');
  infoIcon.setAttribute('aria-label', 'View source');

  infoIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSourcePopover(anchor, source);
    }
  });
}

document.addEventListener('click', (e) => {
  if (activePopover && !activePopover.contains(e.target) && !e.target.closest('.ai-result-footnote')) {
    closeActivePopover();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeActivePopover();
});

export default function decorate(block) {
  if (!block) return;

  block.classList.add('ai-results');

  const rows = [...block.children];

  if (rows.length < 2) return;

  /*
   * Word table structure:
   *
   * Row 0 = Header
   * Row 1 = Intro
   * Row 2 = Metric 1
   * Row 3 = Metric 2
   * Row 4 = Metric 3
   */

  // Remove table header row
  rows.shift();

  // Get intro row
  const introRow = rows.shift();

  const [headingCol, descriptionCol] = introRow.children;

  const section = document.createElement('div');
  section.className = 'ai-results-content';

  // -------------------------
  // Heading
  // -------------------------

  const heading = document.createElement('h2');
  heading.className = 'ai-results-heading';

  const headingText = headingCol.textContent.trim();

  const headingStrong = document.createElement('span');
  headingStrong.className = 'ai-results-heading-highlight';
  headingStrong.textContent = 'Measurable AI results';

  const headingRest = document.createElement('span');
  headingRest.className = 'ai-results-heading-rest';
  headingRest.textContent = headingText.replace(
    'Measurable AI results',
    '',
  ).trim();

  heading.append(
    headingStrong,
    document.createTextNode(' '),
    headingRest,
  );

  // -------------------------
  // Description
  // -------------------------

  const description = document.createElement('p');
  description.className = 'ai-results-description';

  description.append(...descriptionCol.childNodes);

  // -------------------------
  // Metrics
  // -------------------------

  const metrics = document.createElement('div');
  metrics.className = 'ai-results-metrics';

  rows.forEach((row) => {
    if (row.children.length < 6) return;

    const [
      ,
      ,
      metricTitleCol,
      prefixCol,
      valueCol,
      footnoteCol,
      footnoteLinkCol,
    ] = row.children;

    const metric = document.createElement('div');
    metric.className = 'ai-result';

    // -------------------------
    // Title + Prefix
    // -------------------------

    const label = document.createElement('div');
    label.className = 'ai-result-label';

    const title = document.createElement('span');
    title.className = 'ai-result-title';
    title.append(...metricTitleCol.childNodes);

    const prefix = document.createElement('span');
    prefix.className = 'ai-result-prefix';
    prefix.append(...prefixCol.childNodes);

    label.append(
      title,
      prefix,
    );

    // -------------------------
    // Value
    // -------------------------

    const value = document.createElement('div');
    value.className = 'ai-result-value';

    const rawText = valueCol.textContent.trim();

    const {
      target,
      suffix,
    } = parseMetricValue(rawText);

    value.dataset.rawText = rawText;

    value.textContent = formatMetricValue(
      target,
      suffix,
    );

    // -------------------------
    // Footnote
    // -------------------------

    const footnote = document.createElement('div');
    footnote.className = 'ai-result-footnote';

    footnote.append(...footnoteCol.childNodes);

    const footnoteLink = footnoteLinkCol?.querySelector('a');
    const footnoteLinkText = footnoteLinkCol?.textContent.trim();

    let footnoteSource = null;

    if (footnoteLink) {
      footnoteSource = { href: footnoteLink.href };
    } else if (footnoteLinkText) {
      footnoteSource = /^https?:\/\/\S+$/.test(footnoteLinkText)
        ? { href: footnoteLinkText }
        : { text: footnoteLinkText };
    }

    if (footnoteSource) {
      const infoIcon = document.createElement('span');

      infoIcon.className = 'ai-result-info';
      infoIcon.textContent = 'i';

      footnote.append(infoIcon);

      decorateFootnoteSource(footnote, footnoteSource, infoIcon);
    }

    // -------------------------
    // Build metric
    // -------------------------

    metric.append(
      label,
      value,
      footnote,
    );

    metrics.append(metric);
  });

  // -------------------------
  // Build section
  // -------------------------

  section.append(
    heading,
    description,
    metrics,
  );

  block.textContent = '';
  block.append(section);

  // -------------------------
  // Animate values (once, when in viewport)
  // -------------------------

  const animatedValues = block.querySelectorAll('.ai-result-value');

  const pendingAnimation = new Set();

  animatedValues.forEach((valueEl) => {
    const currentValue = valueEl.dataset.rawText
      || valueEl.textContent.trim();

    const { target } = parseMetricValue(currentValue);

    if (Number.isFinite(target) && target > 0) {
      valueEl.textContent = '0';
      pendingAnimation.add(valueEl);
    }
  });

  if (pendingAnimation.size) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateMetricValue(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    pendingAnimation.forEach((valueEl) => observer.observe(valueEl));
  }
}
