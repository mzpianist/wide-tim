// =============================================================================
// SITE-WIDE CONFIGURATION
// Edit anything here to change things across the whole site.
// =============================================================================

export const site = {
  title: "Wide Tim",
  tagline: "Hello world, I'm Wide Tim!",
  description:
    "The official home of Wide Tim — a plump, happy beaver character created by Margaret Zheng, spreading joy, love, and art in and around the MIT community.",
  copyrightName: "Margaret Zheng",
  copyrightStart: 2021,
};

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
};

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about/wide-tim",
    children: [
      { label: "About Wide Tim", href: "/about/wide-tim" },
      { label: "About the Creator", href: "/about/creator" },
      { label: "Past Collaborators", href: "/about/collaborators" },
      { label: "Wide Tim in the Press", href: "/about/press" },
      { label: "Selected Projects", href: "/about/projects" },
    ],
  },
  {
    label: "For Fun",
    href: "/for-fun",
    children: [
      { label: "Make a Wider Tim", href: "/for-fun/make-a-wider-tim" },
      { label: "Being Wide (2024)", href: "/for-fun/being-wide-2024" },
    ],
  },
  { label: "Contact", href: "/contact" },
  {
    label: "Shop",
    href: "https://www.redbubble.com/people/marge-z-art/shop?artistUserName=Marge-Z-Art&collections=2480587&iaCode=all-departments&sortOrder=top%20selling",
    external: true,
  },
];
