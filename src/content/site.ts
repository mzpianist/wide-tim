// =============================================================================
// SITE-WIDE CONFIGURATION
// The site's title, description and copyright line live in `site.json`; edit
// them with the local editor (`npm run editor`, or the "Wide Tim Editor"
// shortcut on the Desktop). The navigation is part of the site's structure,
// so it stays in code below.
// =============================================================================

import data from "./site.json";
import { ACCENTS } from "./palette";

export const site = data;

// -----------------------------------------------------------------------------
// NAVIGATION
// To add a dropdown item, just add a new entry to `children`.
// To add a top-level link, add a new entry to this array.
// Use `external: true` for links that open off-site (e.g. the Redbubble shop).
// -----------------------------------------------------------------------------

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
  // Background color of the button when you're on this section. Pick one of
  // the shared accents from src/content/palette.ts, e.g. `ACCENTS.coral`
  // (coral, teal, mustard, lavender, sky, pink).
  accent?: string;
};

export const nav: NavItem[] = [
  { label: "Home", href: "/", accent: ACCENTS.lavender },
  {
    label: "About",
    href: "/about/wide-tim",
    accent: ACCENTS.coral,
    children: [
      { label: "About Wide Tim", href: "/about/wide-tim" },
      { label: "About the Creator", href: "/about/creator" },
      { label: "Past Collaborators", href: "/about/collaborators" },
      { label: "Wide Tim in the Press", href: "/about/press" },
      { label: "Project Gallery", href: "/about/projects" },
    ],
  },
  {
    label: "For Fun",
    href: "/for-fun",
    accent: ACCENTS.sky,
    children: [
      { label: "Make a Wider Tim", href: "/for-fun/make-a-wider-tim" },
      { label: "Being Wide (2024)", href: "/for-fun/being-wide-2024" },
    ],
  },
  { label: "Contact", href: "/contact", accent: ACCENTS.teal },
  {
    label: "Shop",
    href: "https://www.redbubble.com/people/marge-z-art/shop?artistUserName=Marge-Z-Art&collections=2480587&iaCode=all-departments&sortOrder=top%20selling",
    external: true,
    accent: ACCENTS.pink,
  },
];
