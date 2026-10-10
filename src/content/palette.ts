// The site's six accent colors, defined once. Everything else (page card
// cycles, nav buttons, home quick-links, the wide-tim slide deck) pulls from
// here, so a hex only ever needs changing in this file. If you change one,
// update the matching --ink-* value in src/styles/global.css too.
export const ACCENTS = {
  coral: "#f08066",
  teal: "#4dbeb0",
  mustard: "#e8b441",
  lavender: "#a896d8",
  sky: "#5fb3e0",
  pink: "#ec84a3",
} as const;

// The accents in the order pages cycle through them. Reordering this changes
// which card/year/slide gets which color on every page.
export const PALETTE = [
  ACCENTS.coral,
  ACCENTS.teal,
  ACCENTS.mustard,
  ACCENTS.lavender,
  ACCENTS.sky,
  ACCENTS.pink,
];

// Maps each bright accent fill to its theme-aware "ink" token (defined in
// src/styles/global.css). The fills are fine for backgrounds and borders,
// but too light as text on the light theme; pages set the result inline,
// e.g. `--card-ink: ${inkFor(accent)}`, and use it for text color only.
export const INK: Record<string, string> = {
  [ACCENTS.coral]: "var(--ink-coral)",
  [ACCENTS.teal]: "var(--ink-teal)",
  [ACCENTS.mustard]: "var(--ink-mustard)",
  [ACCENTS.lavender]: "var(--ink-lavender)",
  [ACCENTS.sky]: "var(--ink-sky)",
  [ACCENTS.pink]: "var(--ink-pink)",
};

export function inkFor(fill: string): string {
  return INK[fill.trim().toLowerCase()] ?? fill;
}
