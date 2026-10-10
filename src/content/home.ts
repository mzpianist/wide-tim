// =============================================================================
// HOME PAGE
// The hero greeting + quick-link buttons shown on "/". The text and links
// live in `home.json`; edit them with the local editor (`npm run editor`, or
// the "Wide Tim Editor" shortcut on the Desktop).
//
// Link bars are shown under the hero as a staircase — each bar steps further
// right than the one above. Each bar's `color` names one of the site's shared
// accents in palette.ts (coral, teal, mustard, lavender, sky, pink), ideally
// matching the nav button color where the link goes to the same section (see
// `nav` in site.ts). Labels are shown uppercase; `arrow: false` hides the
// trailing →.
// =============================================================================

import data from "./home.json";
import { ACCENTS } from "./palette";

export type QuickLink = {
  label: string;
  href: string;
  color: string; // hex, resolved from the accent name in home.json
  external?: boolean;
  arrow?: boolean;
};

export const home = {
  heading: data.heading,
  intro: data.intro, // Optional paragraph under the heading. Empty for none.
  quickLinks: data.quickLinks.map(
    (l): QuickLink => ({ ...l, color: ACCENTS[l.color as keyof typeof ACCENTS] ?? l.color }),
  ),
};
