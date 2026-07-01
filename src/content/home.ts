// =============================================================================
// HOME PAGE
// The hero greeting + quick-link buttons shown on "/".
// =============================================================================

export const home = {
  heading: "Hello world, I'm Wide Tim!",
  intro: "", // Optional paragraph under the heading. Leave empty for none.

  // Quick-link cards. Add or reorder freely.
  // `image` is the path to a card thumbnail (e.g. "/home-page-images/about-tim.jpg").
  // Drop the raw image in /images-src/ — the build script crops to 16:9 and outputs to /public/home-page-images/.
  // Leave blank to show a labeled placeholder box.
  // `accent` is a per-card color used for the top stripe + hover border/label
  // — a small dose of playfulness without overwhelming the photos.
  quickLinks: [
    { label: "About Wide Tim", href: "/about/wide-tim", image: "/home-page-images/about-wide-tim.png", imageAlt: "", accent: "#f08066" },
    { label: "About the Creator", href: "/about/creator", image: "/home-page-images/about-the-creator.png", imageAlt: "", accent: "#4dbeb0" },
    { label: "Selected Projects", href: "/about/projects", image: "/home-page-images/selected-projects.png", imageAlt: "", accent: "#e8b441" },
    { label: "Collaborations", href: "/about/collaborators", image: "/home-page-images/collaborations.png", imageAlt: "", accent: "#a896d8" },
    { label: "Just Here for Fun", href: "/for-fun", image: "/home-page-images/just-here-for-fun.png", imageAlt: "", accent: "#5fb3e0" },
    {
      label: "Redbubble Shop",
      href: "https://www.redbubble.com/people/marge-z-art/shop?artistUserName=Marge-Z-Art&collections=2480587&iaCode=all-departments&sortOrder=top%20selling",
      external: true,
      image: "/home-page-images/redbubble-shop.png",
      imageAlt: "",
      accent: "#ec84a3",
    },
  ],

  // Contact CTA shown as a wide bar below the card grid.
  contactBar: {
    label: "Say Hi to Wide Tim",
    href: "/contact",
  },
};
