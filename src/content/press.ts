// =============================================================================
// "WT IN THE PRESS" PAGE
// Add each press mention as a new object in the array.
// =============================================================================

export type PressMention = {
  source: string; // e.g. "The Tech"
  title: string;
  date?: string; // e.g. "2025-03-13"
  url?: string;
  excerpt?: string; // optional pull-quote
};

export const press: PressMention[] = [
  {
    source: "MIT News",
    title: "Scene at MIT: Artfinity brings artistic celebration to campus",
    date: "2025-03-25",
    url: "https://news.mit.edu/2025/scene-mit-artfinity-brings-artistic-celebration-campus-0325",
    excerpt:
      "MIT's new festival celebrating creativity and community featured interactive experiences, exhibitions, and performances across campus — including Pie with Wide Tim and Coloring with Wide Tim.",
  },

  {
    source: "MIT Technology Review",
    title: "The beaver with the infinite smile",
    date: "2023-02-21",
    url: "https://www.technologyreview.com/2023/02/21/1067587/the-beaver-with-the-infinite-smile/",
    excerpt:
      "Despite a busy schedule packed with eating and sleeping, Wide Tim makes time for the vital work of spreading happiness.",
  },


  {
    source: "MIT News",
    title: "Spreading joy with Wide Tim",
    date: "2022-11-29",
    url: "https://news.mit.edu/2022/spreading-joy-with-wide-tim-1129",
    excerpt:
      "MIT senior Tianyuan (Margaret) Zheng uses art as a bonding enzyme to join STEM, culture, and community.",
  },

  {
    source: "Council for the Arts at MIT",
    title: "The 2023 Wiesner Student Art Awards",
    date: "2023",
    url: "https://arts.mit.edu/wiesner-student-art-award-2023/",
    excerpt:
      "Get to know the student artists receiving the Laya and Jerome B. Wiesner Student Art Award at MIT (with a shoutout to Wide Tim!)",
  },

  {
    source: "MIT Campus Planning",
    title: "MIT Welcome Center opens in Kendall Square",
    date: "2021-10-01",
    url: "https://campusplanning.mit.edu/highlights-and-initiatives/mit-welcome-center-opens-in-kendall-square/",
    excerpt:
      "Get to know the student artists receiving the Laya and Jerome B. Wiesner Student Art Award at MIT (with a shoutout to Wide Tim!)",
  },
];
