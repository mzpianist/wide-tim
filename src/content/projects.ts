// =============================================================================
// "SELECTED PROJECTS" PAGE
// Add projects as entries in the array. Newest first is the convention.
// =============================================================================

export type Project = {
  name: string;
  date: string; // e.g. "3.14.2025" or "2022, 2023, 2024"
  url?: string;
  description?: string;
  image?: string; // e.g. "/projects-images/foo.jpg" — create /public/projects-images/ for this page
  imageAlt?: string;
  // Optional supplementary links (press coverage, photo galleries, etc.).
  // `url` above is the project's primary link; these render as a small
  // "see more" row beneath the description. Projects without an `image`
  // automatically collapse to a compact list at the bottom of the page.
  links?: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    name: "Pie with Wide Tim",
    date: "3.14.2025",
    url: "https://artfinity.mit.edu/event/bright-spot-pie-with-wide-tim",
    description: "",
  },
  {
    name: "Coloring with Wide Tim",
    date: "3.4.2025 - 3.13.2025",
    url: "https://artfinity.mit.edu/event/coloring-with-wide-tim",
    description: "",
  },
  {
    name: "MIT Campus Preview Weekend",
    date: "2022-2026",
    url: "https://admitted.mit.edu/cpw",
    description:
      "",
  },
  {
    name: "MIT Infinite Possibilities",
    date: "4.27.2024",
    description: "Featured a Wide Tim cutout and exhibition at the Marriott Hotel.",
    // Example of attaching supplementary links:
    // links: [
    //   { label: "Photos", url: "https://example.com/photos" },
    //   { label: "Event page", url: "https://example.com/event" },
    // ],
  },
];
