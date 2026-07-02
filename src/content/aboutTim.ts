// =============================================================================
// "ABOUT WIDE TIM" PAGE
// Section structure:
//   1. Intro (no heading)
//   2. The Birth of Wide Tim
//   3. Becoming Wider
//   4. What they said...
//   5. Wider in person
//   6. What's Next?
//
// Paragraph strings are rendered with set:html, so inline <a>, <b>, etc. work.
// Images: leave `image: ""` to keep the placeholder box.
//
// A few facts are computed at build time so they don't go stale:
//   - collaborator count: pulled from the collaborators page data
//   - Wide Tim's age: years since his debut (Feb 13, 2021)
//   - latest CPW year: most recent April that has passed
// =============================================================================

import { collaborations, groupByCollaborator } from "./collaborators";

const TODAY = new Date();
const DEBUT = new Date(2021, 1, 13); // Feb 13, 2021 (month is 0-indexed)

function yearsSince(today: Date, start: Date): number {
  let age = today.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() < start.getDate());
  if (beforeAnniversary) age -= 1;
  return age;
}

// CPW happens in April. Flip to this year on May 1 (just to be safe in case
// CPW is still ongoing in late April); otherwise the most recent CPW is last
// year's. (getMonth is 0-indexed: 4 = May.)
function latestCpwYear(today: Date): number {
  const year = today.getFullYear();
  return today.getMonth() >= 4 ? year : year - 1;
}

const totalCollaborators = groupByCollaborator(collaborations).length;
const wideTimAge = yearsSince(TODAY, DEBUT);
const cpwLatest = latestCpwYear(TODAY);

export const aboutTim = {
  heading: "About Wide Tim",


  // ---- INTRO (no heading on the old page) ----
  introParagraphs: [
    // TODO: make "300+ wholesome illustrations" dynamic once we have a source of truth for the count.
    `Wide Tim (<a href="https://www.instagram.com/wide_tim/" target="_blank" rel="noopener noreferrer">@wide_tim</a> on Instagram) is a beaver character created by <a href="/about/creator">Margaret Zheng (MIT '23, MEng '24)</a>. Plump, happy, and full of life, Wide Tim's biggest dream is to spread joy, share love, and promote the arts in and out of the MIT community. Since February 13th, 2021, he has collaborated with <a href="/about/collaborators">${totalCollaborators} MIT clubs, offices, and entities</a> to create 300+ wholesome illustrations.`,
    `Wide Tim's ubiquitous presence and engagement in the MIT communities have made him a beloved personality beyond the virtual space, leading to <a href="/about/projects">several larger projects</a> (including features in MIT's campus preview weekend 2022-${cpwLatest}, MIT Class of 2028's silver tube poster, and a mural in the MIT welcome center) along with a couple of <a href="/about/press">press reports</a>.`,
    `Wide Tim and Margaret are very honored and grateful for the unwavering support from the community. Though Margaret has graduated from MIT, she is staying in the Boston/Cambridge area and will continue to create Wide Tim illustrations (and perhaps bigger projects? Stay tuned!) If you ever have an idea for Wide Tim, please do not hesitate to reach out at @wide_tim!`,
  ],

    // ---- ABOUT WIDE TIM ----
  aboutHeading: "The Birth of Wide Tim",
  aboutPullQuote: `"Hello World, I'm Wide Tim!"`,
  aboutParagraphs: [ 
    `Wide Tim is a plump, joyful ${wideTimAge}-year-old beaver who double majors in eating and sleeping at MIT. Aside from his jam-packed schedule of eating and sleeping, he is constantly thinking about spreading happiness, sharing love, and becoming even wider, of course.`,
    `Wide Tim made his debut on February 13th, 2021 as a piece of fan art on <a href="https://www.instagram.com/mitadmissions" target="_blank" rel="noopener noreferrer">@mitadmissions</a> to welcome the class of 2024 onto campus during the height of COVID-19. During CP* 2021 (MIT's Virtual Campus Preview Weekend), students accidentally found out about his hidden ability to become as wide as he would like.`,
    `Yes, there were lots of memes about it, some of which are documented on these two blogs: <a href="https://mitadmissions.org/blogs/entry/13-theses-on-wide-tim/" target="_blank" rel="noopener noreferrer">[1]</a> <a href="https://mitadmissions.org/blogs/entry/a-journey-to-the-w-i-d-e/" target="_blank" rel="noopener noreferrer">[2]</a>.`,
  ],


  // ---- HOW DO I BECOME WIDER? ----
  widerHeading: "Becoming Wider",
  widerLeadParagraph: `Following a meme takeoff in the MIT CP* 2021 discord server, Wide Tim opened his own Instagram account to explore ways to become wider. He began this process by asking his friends everything from their favorite Friday night plans, lunch spots, places to study, and ice cream flavors, to what classes he should take, what on-campus dance shows to go to, what events to participate in, and little moments on campus that turn into core memories. Before he knew it, he had collaborated with <a href="/about/collaborators">${totalCollaborators} MIT student clubs, organizations, and offices</a>!`,

  // ---- WHAT THEY SAID... ----
  quotesHeading: "They Say:",
  quotes: [
    {
      text: `"This is Wide Tim, an adorable beaver character who loves MIT, obtaining width, and injecting some levity into MIT life. Rumor has it that Wide Tim double-majors in eating and sleeping, but his sole mission is to make people happy and smile. And by all accounts, he excels at his job."`,
      attribution: "MIT News",
      url: "https://news.mit.edu/2022/spreading-joy-with-wide-tim-1129",
    },
    {
      text: `"Originating from a cartoon image welcoming the Class of 2024 to campus, Wide Tim has become a widely recognized and beloved character who went on to collaborate with MIT Admissions, MIT Technology Review, and several other MIT departments."`,
      attribution: "Arts at MIT",
      url: "https://arts.mit.edu/wiesner-student-art-award-2023/",
    },
  ],

  // ---- WIDER IN PERSON ----
  inPersonHeading: "Wider in Person",
  inPersonLeadParagraph: `Eventually, words about Wide Tim went around wide enough that he started collaborating with MIT entities for bigger (and in-person) projects. Some of them include:`,
  inPersonBullets: [
    `being featured on the official photobooth and other material in Campus Preview Weekend from 2022 through ${cpwLatest}`,
    `being featured on the MIT admissions website and starring in <a href="https://www.instagram.com/p/C5ZSz_COeZT/?img_index=1" target="_blank" rel="noopener noreferrer">the MIT Class of 2028 Poster</a>`,
    `starring in a mural at MIT Welcome Center`,
    `starring in posters for MIT Press, MIT Health, MIT Activities Committee and MISTI, as well as postcards from the MIT Chancellor's Office`,
    `being recreated as an augmented-reality mural as a part of <a href="https://mitadmissions.org/blogs/entry/joint-post-welcoming-you-to-here-at-mit/" target="_blank" rel="noopener noreferrer">MIT Welcome Center Storywall Project (2021)</a> (p.s. it is still in the <a href="https://www.mit.edu/visitmit/" target="_blank" rel="noopener noreferrer">MIT Welcome Center</a>!)`,
  ],
  // Carousel of "Wider in person" photos. Drop new images in
  // /public/about-page-images/ and add an entry below. The carousel hides
  // its prev/next arrows + dots automatically when there's only one image.
  inPersonImages: [
    {src: "/about-page-images/in-person-cpw-2024.webp", alt: "CPW 2024"},
    {src: "/about-page-images/in-person-lunchbreak-with-wide-tim.webp", alt: "Lunch Break with Wide Tim"},
    {src: "/about-page-images/in-person-inf-possibilities.webp", alt: "Infinite Possibilities"},
    {src: "/about-page-images/in-person-mp4g.webp", alt: "MathPrize 4 Girls"},
    {src: "/about-page-images/in-person-pi-w-wt-1.webp", alt: "Pie with Wide Tim"},
    {src: "/about-page-images/in-person-wt-coop.webp", alt: "Wide Tim at the COOP"},
  ],

  // ---- WHAT'S NEXT? ----
  whatsNextHeading: "What's Next?",
  whatsNextParagraphs: [
    `While Margaret graduated from MIT in 2024, Wide Tim is still around and has continued to engage with the community. For example, on March 14, 2025, he held a standalone art event at the MIT Welcome Center called <a href="https://artfinity.mit.edu/event/bright-spot-pie-with-wide-tim" target="_blank" rel="noopener noreferrer">Pie with Wide Tim</a>. As of late 2024, he has also maintained a merchandize line in the <a href="https://thecoop.com/pages/shop-mit" target="_blank" rel="noopener noreferrer">MIT COOP</a>.`,
    `Follow <a href="https://www.instagram.com/wide_tim/" target="_blank" rel="noopener noreferrer">@wide_tim</a> for new updates and inquiries!!`,
  ],
};
