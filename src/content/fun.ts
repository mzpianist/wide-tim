// =============================================================================
// "FOR FUN" LANDING PAGE
// Each entry in `fun.json` becomes a card on /for-fun; edit them with the
// local editor (`npm run editor`, or the "Wide Tim Editor" shortcut on the
// Desktop). A card for a new little game on this site also needs a matching
// page under src/pages/for-fun/<slug>.astro.
// =============================================================================

import data from "./fun.json";
import pageData from "./funPage.json";

// The page's heading and intro, from `funPage.json`.
export const funPage = pageData;

export type FunItem = {
  name: string;
  description: string;
  href: string; // internal path or external url
  external?: boolean;
  image?: string;
  imageAlt?: string;
};

export const funItems: FunItem[] = data;
