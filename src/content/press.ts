// =============================================================================
// "WT IN THE PRESS" PAGE
// Data lives in `press.csv` (columns: source, title, date, url, excerpt), one
// row per press mention. Edit it with the local editor (`npm run editor`, or
// the "Wide Tim Editor" shortcut on the Desktop), or in Excel / Numbers / any
// text editor.
//
// `date` is "YYYY-MM-DD", "YYYY-MM" or "YYYY". The page lists mentions
// newest-first by that date, so row order in the file doesn't matter.
// =============================================================================

import csvText from "./press.csv?raw";
import pageData from "./pressPage.json";
import { parseCsvRecords } from "./csv";

// The page's heading, from `pressPage.json`.
export const pressPage = pageData;

export type PressMention = {
  source: string; // e.g. "The Tech"
  title: string;
  date?: string; // e.g. "2025-03-13"
  url?: string;
  excerpt?: string; // optional pull-quote
};

export const press: PressMention[] = parseCsvRecords(csvText)
  .filter((r) => r.source && r.title)
  .map((r) => ({
    source: r.source,
    title: r.title,
    ...(r.date ? { date: r.date } : {}),
    ...(r.url ? { url: r.url } : {}),
    ...(r.excerpt ? { excerpt: r.excerpt } : {}),
  }));
