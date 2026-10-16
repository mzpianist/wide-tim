// =============================================================================
// "MERCH RUN" PAGE
// The catalog for the Merch Run, the pop-up merch shop that runs a few days a
// year. The items live in `merchRun.json`, in catalog order, and the page's
// heading, dates, place and "closed" message in `merchRunPage.json`. Edit them
// with the local editor (`npm run editor`, or the "Wide Tim Editor" shortcut
// on the Desktop), which also resizes photos into /public/merch-run-images/.
//
// The page is hidden most of the year: set it to "Off" (visitors get the
// closed message) or "Link only" (open to anyone with the link or QR code,
// but not in the menu) under Every page → Show & hide pages. See pages.ts.
// =============================================================================

import itemsData from "./merchRun.json";
import pageData from "./merchRunPage.json";

export const merchRunPage: {
  heading: string;
  intro?: string;
  when?: string; // e.g. "Oct 24–26"
  where?: string; // e.g. "Lobby 10"
  payment?: string; // e.g. "Cash or Venmo"
  closedHeading: string;
  closedText?: string; // may contain links (HTML)
} = pageData;

export type MerchItem = {
  name: string;
  price: string; // written the way it should appear, e.g. "$5" or "3 for $10"
  category?: string; // items are grouped under these, in order of first use
  soldOut?: boolean;
  description?: string;
  options?: string[]; // sizes, colors or designs, shown as small tags
  image?: string; // e.g. "/merch-run-images/foo.webp"
  imageAlt?: string;
};

export const merchItems: MerchItem[] = itemsData;

// The catalog's sections: items without a category first (no heading), then
// one per category in the order each first appears in the list.
export const merchSections = (() => {
  const sections = new Map<string, MerchItem[]>();
  for (const item of merchItems) {
    const name = item.category?.trim() ?? "";
    if (!sections.has(name)) sections.set(name, []);
    sections.get(name)!.push(item);
  }
  return [...sections]
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => Number(!!a.name) - Number(!!b.name));
})();
