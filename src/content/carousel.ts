// =============================================================================
// HOME PAGE CAROUSEL
// Hand-curated snapshots of Wide Tim, listed in `carousel.json`. Edit them
// with the local editor (`npm run editor`, or the "Wide Tim Editor" shortcut
// on the Desktop), which saves new photos into src/assets/carousel/ (NOT
// public/) — Astro optimizes & resizes anything in src/assets at build time.
// Each slide names its photo by filename, and can link somewhere with `href`.
// =============================================================================

import data from "./carousel.json";

export type CarouselSlide = {
  file: string; // filename inside src/assets/carousel/, e.g. "wide-tim-photo-1.webp"
  alt: string;
  caption?: string;
  href?: string; // optional link (e.g. back to an original post)
};

export const carouselSlides: CarouselSlide[] = data;
