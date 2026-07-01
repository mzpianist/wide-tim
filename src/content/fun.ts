// =============================================================================
// "FOR FUN" LANDING PAGE
// Each entry becomes a card on /for-fun.
// To add a new fun item (e.g. a new little game), add an entry here AND
// create a matching page under src/pages/for-fun/<slug>.astro.
// =============================================================================

export type FunItem = {
  name: string;
  description: string;
  href: string; // internal path or external url
  external?: boolean;
  image?: string;
  imageAlt?: string;
};

export const funItems: FunItem[] = [
  {
    name: "Make a Wider Tim!",
    description: "Simple web game, circa Feb 2023.",
    href: "/for-fun/make-a-wider-tim",
    image: "/make-a-wider-tim-src/wider-tim-preview.png",
    imageAlt: "Screenshot of the Make a Wider Tim game",
  },
  {
    name: "Being WIDE",
    description: "A little video about me & why I want to be wide <3",
    href: "/for-fun/being-wide-2024",
    image: "https://img.youtube.com/vi/cglrEGjWdvg/maxresdefault.jpg",
    imageAlt: "Being WIDE (2024) video thumbnail",
  },
  // Add new games/fun items here as you build them:
  // { name: "New Game", description: "...", href: "/for-fun/new-game" },
];
