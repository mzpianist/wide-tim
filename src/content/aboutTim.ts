// =============================================================================
// "ABOUT WIDE TIM" PAGE
// The text lives in `aboutTim.json`; edit it with the local editor
// (`npm run editor`, or the "Wide Tim Editor" shortcut on the Desktop).
//
// The page is a slide deck — each section is its own slide, in order:
//   1. Intro (titled with `heading`, with `introSubheading` under it)
//   2. The Birth of Wide Tim
//   3. Becoming Wider
//   4. What they said...
//   5. Wider in person
//   6. What's Next?
// Keep each section short enough to fit on one screen; longer slides scroll
// inside their card.
//
// Paragraph strings are rendered with set:html, so inline <a>, <b>, etc. work.
// Images: leave `image: ""` to keep the placeholder box.
//
// A few facts are computed at build time so they don't go stale. Write these
// placeholders anywhere in the text and they're filled in here:
//   - {collaborators}: collaborator count, from the collaborators page data
//   - {age}: Wide Tim's age, in years since his debut (Feb 13, 2021)
//   - {latestCpwYear}: the most recent April's CPW that has passed
// =============================================================================

import data from "./aboutTim.json";
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

const PLACEHOLDERS: Record<string, string> = {
  collaborators: String(groupByCollaborator(collaborations).length),
  age: String(yearsSince(TODAY, DEBUT)),
  latestCpwYear: String(latestCpwYear(TODAY)),
};

// Replaces {placeholders} in every string of the JSON, however deeply nested.
function fill<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (m, key) => PLACEHOLDERS[key] ?? m) as T;
  }
  if (Array.isArray(value)) return value.map(fill) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v)])) as T;
  }
  return value;
}

export const aboutTim = fill(data);
