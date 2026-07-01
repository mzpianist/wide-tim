// =============================================================================
// HOME PAGE CAROUSEL
// Hand-curated snapshots of Wide Tim. To add a slide:
//   1. Drop the image into src/assets/carousel/  (NOT public/)
//      — Astro optimizes & resizes anything in src/assets at build time.
//   2. Add an entry below using just the filename.
//   3. Optionally link it somewhere with `href`.
// =============================================================================

export type CarouselSlide = {
  file: string; // filename inside src/assets/carousel/, e.g. "1.PNG"
  alt: string;
  caption?: string;
  href?: string; // optional link (e.g. back to an original post)
};

// How long (in seconds) each slide is shown before auto-advancing.
// Bump up for a slower carousel, down for a faster one.
export const carouselIntervalSeconds = 5;
export const carouselIntervalMs = carouselIntervalSeconds * 1000;

export const carouselSlides: CarouselSlide[] = [
  { file: "1.PNG", alt: "Wide Tim, photo 1" },
  { file: "2.JPG", alt: "Wide Tim, photo 2" },
  { file: "3.PNG", alt: "Wide Tim, photo 3" },
  { file: "4.PNG", alt: "Wide Tim, photo 4" },
  { file: "5.PNG", alt: "Wide Tim, photo 5" },
  { file: "6.PNG", alt: "Wide Tim, photo 6" },
  { file: "7.PNG", alt: "Wide Tim, photo 7" },
  { file: "8.PNG", alt: "Wide Tim, photo 8" },
  { file: "9.PNG", alt: "Wide Tim, photo 9" },
  { file: "10.PNG", alt: "Wide Tim, photo 10" },
];
