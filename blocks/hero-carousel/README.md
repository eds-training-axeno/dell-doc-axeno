# Hero Carousel — AEM Edge Delivery Services

A single EDS block implementing a responsive Dell-style hero carousel.

## Files

- `hero-carousel.js`
- `hero-carousel.css`
- Self-hosted font: `fonts/barlow-condensed-bold.woff2` (used only for this
  block's title, via a scoped `@font-face` in `hero-carousel.css`)

## Authoring

Create one `hero-carousel` block/table. Each row is one slide, with three cells:

| Images | Content | Theme |
|---|---|---|
| Insert every responsive image variant for this slide (any order — see below) | A bold paragraph (eyebrow), a plain paragraph (title), a plain paragraph (description), then a paragraph with the CTA link(s) | `light`, `dark`, or `dark-overlay` |

Add one row per slide. The theme cell is optional — leaving it blank (or any
unrecognized value) defaults to `light`.

### Images cell

Insert exactly 2 images, in this order:

1. **Mobile** image
2. **Tablet / desktop** image (shown at `>= 768px`)

Position decides which is which — not aspect ratio — so the order matters.

### Content cell

Written as plain paragraphs, in this order:

1. **Bold paragraph** → eyebrow (small label above the title)
2. **Plain paragraph** → title
3. **Plain paragraph** → description
4. **Paragraph with link(s)** → CTA(s). One link = one primary CTA; two links
   = primary + secondary CTA.

### Theme cell

- **`light`** (default) — dark text with a light gradient behind it.
- **`dark`** — white text on a solid black panel (fixed width on tablet/
  desktop, full-width block below the image on mobile). Use this when the
  photo doesn't already have a dark area for the text to sit on (e.g. a
  busy or light-colored photo).
- **`dark-overlay`** — white text floats directly on the photo, no panel or
  scrim at all. Only use this when the photo already has a naturally dark,
  fairly flat area (like a studio-gradient background) for the text to sit
  on — otherwise contrast will suffer. Falls back to the same solid block
  as `dark` on mobile.

## Behavior

- 8 second autoplay
- Previous / next arrows with a "current / total" slide counter
- Play / Pause button that starts and stops autoplay
- Touch swipe
- Keyboard left/right navigation
- Reduced-motion users do not get autoplay by default, but can start it via the Play button
- First image is eager/high priority
- Other slide images are lazy loaded
