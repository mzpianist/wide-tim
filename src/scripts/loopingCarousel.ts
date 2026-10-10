// Shared navigation for the site's scroll-snap carousels (the About Wide Tim
// slide deck and the Project Gallery).
//
// The track is a horizontal scroll-snap strip whose children are the slides.
// Arrows, dots, and ← → keys scroll it to a slide; native scrolling gives
// swipe / trackpad support for free. The dots/counter follow the scroll
// position, so swiping updates them too.
//
// The arrows and keys wrap around (next on the last slide goes to the first,
// and vice versa) and the wrap looks like any other one-slide step instead
// of rolling back past every slide in between. To do that, the slides are
// briefly re-ordered (CSS `order`) so the first slide sits just right of the
// last one — a rotation of the strip — and the track scrolls one slide over.
// Once it comes to rest the strip is rotated back, with the scroll position
// adjusted so nothing visibly moves. Swiping stops at the ends.

type Options = {
  track: HTMLElement;
  dots?: NodeListOf<HTMLElement>;
  prev?: HTMLElement | null;
  next?: HTMLElement | null;
  // Shows "3 / 6".
  count?: HTMLElement | null;
  // ← → keys only drive the carousel while this returns true.
  keysActive?: () => boolean;
};

export function initLoopingCarousel({ track, dots, prev, next, count, keysActive }: Options) {
  const slides = Array.from(track.children) as HTMLElement[];
  const n = slides.length;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shown = -1;
  // Slide we're animating toward, so quick repeated presses each advance
  // one slide instead of re-targeting the one already on its way.
  let pending: number | null = null;
  let idleTimer: number | undefined;
  // How far the strip is rotated. Slide r is shown in position vis(r);
  // position v shows slide real(v). 0 = normal order.
  let shift = 0;
  // Where the last smooth scroll was aimed (see goTo).
  let lastLeft: number | null = null;
  // Scroll position when the idle check last looked (see whenIdle).
  let lastSeen = -1;

  const vis = (r: number) => (((r - shift) % n) + n) % n;
  const real = (v: number) => (((v + shift) % n) + n) % n;

  // Distance from one slide to the next: a slide's width plus the gap.
  function stride() {
    return slides[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }
  function position() {
    return Math.round(track.scrollLeft / stride());
  }
  // Rotate the strip, keeping whatever is on screen exactly where it is
  // (even partway through a scroll). "instant" also cancels a smooth
  // scroll in progress.
  function rotate(s: number) {
    const p = track.scrollLeft / stride();
    const anchor = real(Math.round(p));
    shift = s;
    slides.forEach((slide, r) => (slide.style.order = String(vis(r))));
    track.scrollTo({ left: (vis(anchor) + p - Math.round(p)) * stride(), behavior: "instant" });
  }
  function goTo(i: number) {
    pending = i;
    // Snapping is paused while we scroll, so rotating mid-scroll can keep
    // an in-between position; settle() turns it back on.
    track.style.scrollSnapType = "none";
    let left = vis(i) * stride();
    // Chrome drops a smooth scroll aimed exactly where the last one was
    // headed, even after rotate() cut that one short (a quick second press
    // across the wrap lands the next slide on the same spot). Aim 1px short
    // instead; settle() lines it up exactly.
    if (lastLeft !== null && Math.abs(left - lastLeft) < 0.5) {
      left += track.scrollLeft < left ? -1 : 1;
    }
    lastLeft = left;
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }
  function step(delta: number) {
    const from = pending !== null ? pending : real(position());
    const to = (((from + delta) % n) + n) % n;
    // If the target sits on the far side (wrapping around), rotate the
    // strip so it's the next slide over in the direction we're moving.
    const here = track.scrollLeft / stride();
    if (delta > 0 ? vis(to) <= here : vis(to) >= here) {
      rotate(delta > 0 ? to + 1 : to);
    }
    goTo(to);
  }
  // Runs 150ms after the last scroll event. A busy page can hold scroll
  // events back while a smooth scroll keeps moving, so if we're still short
  // of where goTo() aimed and the position has changed, check again later
  // rather than settling mid-slide.
  function whenIdle() {
    const at = track.scrollLeft;
    if (pending !== null && lastLeft !== null && Math.abs(at - lastLeft) > 1.5 && at !== lastSeen) {
      lastSeen = at;
      idleTimer = window.setTimeout(whenIdle, 150);
      return;
    }
    settle();
  }
  function settle() {
    pending = null;
    if (shift !== 0) rotate(0);
    track.scrollTo({ left: position() * stride(), behavior: "instant" });
    track.style.scrollSnapType = "";
  }
  function render() {
    const i = real(position());
    if (i === shown) return;
    shown = i;
    dots?.forEach((dot, d) => dot.setAttribute("aria-current", d === i ? "true" : "false"));
    if (count) count.textContent = `${i + 1} / ${n}`;
  }

  if (n > 1) {
    track.addEventListener(
      "scroll",
      () => {
        if (!stride()) return; // hidden
        render();
        clearTimeout(idleTimer);
        lastSeen = -1;
        idleTimer = window.setTimeout(whenIdle, 150);
      },
      { passive: true },
    );
    prev?.addEventListener("click", () => step(-1));
    next?.addEventListener("click", () => step(1));
    dots?.forEach((dot, d) => dot.addEventListener("click", () => goTo(d)));
    document.addEventListener("keydown", (e) => {
      if (keysActive && !keysActive()) return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as Element | null;
      if (target?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    });
  }
  // Opening on a deep link (#in-person etc.) can land mid-strip.
  if (stride()) render();

  return {
    // Put the strip back on the slide that was showing, e.g. after it was
    // hidden (a hidden track loses its scroll position).
    restore() {
      track.scrollTo({ left: vis(Math.max(shown, 0)) * stride(), behavior: "instant" });
      render();
    },
  };
}
