// =============================================================================
// "PROJECT GALLERY" PAGE
// The projects themselves live in `projects.json`, newest first by
// convention, and the page's heading and intro in `projectsPage.json`. Edit
// them with the local editor (`npm run editor`, or the "Wide Tim Editor"
// shortcut on the Desktop), which also takes care of resizing photos into
// /public/projects-images/. Visitors can flip between a carousel (one project
// at a time, photo + short text) and a list (a grid of cards); both views are
// built from that list.
//
// A project with no `image` still gets a card/slide, just without a photo,
// and sorts after the ones with photos. `url` is the project's main link;
// `links` holds extras (press coverage, photo galleries, or one link per
// event when a series has no single page).
// =============================================================================

import projectsData from "./projects.json";
import pageData from "./projectsPage.json";

export const projectsPage = {
  heading: pageData.heading,
  intro: pageData.intro,
  // Which view a first-time visitor sees: "carousel" or "list". After that,
  // the page remembers whichever view they last picked.
  defaultView: pageData.defaultView as "carousel" | "list",
};

export type Project = {
  name: string;
  date: string; // e.g. "3.14.2025" or "2022, 2023, 2024"
  url?: string;
  description?: string;
  image?: string; // e.g. "/projects-images/foo.webp" — photos for this page live in /public/projects-images/
  imageAlt?: string;
  // Optional supplementary links (press coverage, photo galleries, etc.).
  // `url` above is the project's primary link; these render as a small
  // "see more" row beneath the description. Projects with an `image` are
  // shown first; ones without still get a card/slide, just with no photo.
  links?: { label: string; url: string }[];
};

export const projects: Project[] = projectsData;
