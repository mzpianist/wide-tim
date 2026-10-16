// =============================================================================
// PAGE VISIBILITY
// Whether each page is out in the open, set per page in `pages.json`; switch
// them with the local editor (`npm run editor`, or the "Wide Tim Editor"
// shortcut on the Desktop), under Every page → Show & hide pages.
//
//   "shown"      the normal page: in the menu, the home page's link bars, the
//                For Fun cards, the sitemap and search engines.
//   "link-only"  left out of all of those, but anyone with the link (or a QR
//                code) can still open it.
//   "off"        left out of all of those, and the page shows a "not open
//                right now" message instead of its content (BaseLayout.astro).
//
// A page that isn't listed counts as "shown"; the home page always is.
// astro.config.mjs reads the same file to keep hidden pages out of the
// sitemap.
// =============================================================================

import data from "./pages.json";

export type Visibility = "shown" | "link-only" | "off";

const settings = data as Record<string, Visibility>;

// "/merch-run/" and "/merch-run" are the same page.
const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

export function visibilityOf(path: string): Visibility {
  return settings[normalize(path)] ?? "shown";
}

// Whether a link should be offered around the site. Links to other sites
// always are.
export function isListed(href: string): boolean {
  return !href.startsWith("/") || visibilityOf(href) === "shown";
}
