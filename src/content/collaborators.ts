// =============================================================================
// "PAST COLLABORATORS" PAGE
// Data lives in `collaborators.csv` (columns: collaborator, event, month, year,
// day, group, url, note). Edit that file in Excel / Numbers / any text editor.
//
// `collaborator` is the org/group/office you worked with. `event` is the
// specific project or event name, if any (leave blank when the collaborator
// IS the thing, e.g. "MIT Figure Skating Club").
//
// Date fields:
//   - year: required (4 digits, e.g. 2025)
//   - month: optional (1-12, or name like "Feb" or "February")
//   - day: optional — leave blank for multi-day collabs or when unknown
// If you only know the year, leave month and day blank.
//
// Repeat collaborators (anyone appearing on more than one row) are rendered
// bold on the website automatically — no manual marking needed.
//
// The page derives two views from this data: by date (year → month) and by
// collaborator (grouped by name, most-recent first).
// =============================================================================

import csvText from "./collaborators.csv?raw";

export type Collaboration = {
  collaborator: string;
  event?: string; // specific event / project name, if distinct from collaborator
  date: string; // "YYYY-MM-DD" | "YYYY-MM" | "YYYY"
  group?: string; // MIT student group or office
  url?: string;
  note?: string;
};

// ---------- CSV parsing ----------

// Minimal RFC 4180-ish parser: handles quoted fields, embedded commas,
// and escaped quotes (""). Good enough for hand-edited collaborator data.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/\r\n?/g, "\n");

  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

// Accepts "1"-"12", "01"-"12", month name ("Feb", "February"), or blank.
// Returns 1-12, or undefined if missing/invalid.
function parseMonth(s: string): number | undefined {
  const v = s.trim();
  if (!v) return undefined;
  const n = parseInt(v, 10);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return n;
  const lower = v.toLowerCase();
  const names = [
    ["jan", "january"],
    ["feb", "february"],
    ["mar", "march"],
    ["apr", "april"],
    ["may", "may"],
    ["jun", "june"],
    ["jul", "july"],
    ["aug", "august"],
    ["sep", "sept", "september"],
    ["oct", "october"],
    ["nov", "november"],
    ["dec", "december"],
  ];
  for (let i = 0; i < names.length; i++) {
    if (names[i].some((n) => lower === n || lower.startsWith(n))) return i + 1;
  }
  return undefined;
}

// Build "YYYY-MM-DD" / "YYYY-MM" / "YYYY" from separate columns.
function buildDate(yearStr: string, monthStr: string, dayStr: string): string {
  const year = parseInt(yearStr.trim(), 10);
  if (!Number.isFinite(year)) return "";
  const month = parseMonth(monthStr);
  const day = parseInt(dayStr.trim(), 10);
  if (month && Number.isFinite(day) && day >= 1 && day <= 31) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  if (month) return `${year}-${String(month).padStart(2, "0")}`;
  return String(year);
}

function loadCollaborations(): Collaboration[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {
    collaborator: header.indexOf("collaborator"),
    event: header.indexOf("event"),
    month: header.indexOf("month"),
    year: header.indexOf("year"),
    day: header.indexOf("day"),
    group: header.indexOf("group"),
    url: header.indexOf("url"),
    note: header.indexOf("note"),
  };
  if (idx.collaborator < 0 || idx.year < 0) {
    throw new Error(
      "collaborators.csv must have at least `collaborator` and `year` columns",
    );
  }
  const out: Collaboration[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const collaborator = (row[idx.collaborator] ?? "").trim();
    const yearStr = (row[idx.year] ?? "").trim();
    const monthStr = idx.month >= 0 ? (row[idx.month] ?? "").trim() : "";
    const dayStr = idx.day >= 0 ? (row[idx.day] ?? "").trim() : "";
    const date = buildDate(yearStr, monthStr, dayStr);
    if (!collaborator || !date) continue;
    const event = idx.event >= 0 ? (row[idx.event] ?? "").trim() : "";
    const group = idx.group >= 0 ? (row[idx.group] ?? "").trim() : "";
    const url = idx.url >= 0 ? (row[idx.url] ?? "").trim() : "";
    const note = idx.note >= 0 ? (row[idx.note] ?? "").trim() : "";
    out.push({
      collaborator,
      date,
      ...(event ? { event } : {}),
      ...(group ? { group } : {}),
      ...(url ? { url } : {}),
      ...(note ? { note } : {}),
    });
  }
  return out;
}

export const collaborations: Collaboration[] = loadCollaborations();

// ---------- Derived views ----------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type ParsedDate = {
  year: number;
  month?: number; // 1-12
  day?: number;   // 1-31
  raw: string;
};

export function parseDate(s: string): ParsedDate {
  const [y, m, d] = s.split("-").map((p) => parseInt(p, 10));
  return {
    year: y,
    month: Number.isFinite(m) ? m : undefined,
    day: Number.isFinite(d) ? d : undefined,
    raw: s,
  };
}

export function formatDate(s: string): string {
  const { year, month, day } = parseDate(s);
  if (month && day) return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
  if (month) return `${MONTH_NAMES[month - 1]} ${year}`;
  return String(year);
}

// Same as formatDate but uses three-letter month abbreviations — used
// where many dates appear side-by-side and need to stay compact.
export function formatDateShort(s: string): string {
  const { year, month, day } = parseDate(s);
  if (month && day) return `${SHORT_MONTH_NAMES[month - 1]} ${day}, ${year}`;
  if (month) return `${SHORT_MONTH_NAMES[month - 1]} ${year}`;
  return String(year);
}

// Sort key: larger = more recent. Missing month/day sort to end of their year.
function sortKey(s: string): number {
  const { year, month, day } = parseDate(s);
  return year * 10000 + (month ?? 0) * 100 + (day ?? 0);
}

export type ByDateGroup = {
  year: number;
  months: {
    month: number | null; // null = year-only entries
    monthLabel: string;
    items: Collaboration[];
  }[];
};

export function groupByDate(entries: Collaboration[]): ByDateGroup[] {
  const byYear = new Map<number, Map<number | null, Collaboration[]>>();
  for (const e of entries) {
    const { year, month } = parseDate(e.date);
    const mKey = month ?? null;
    if (!byYear.has(year)) byYear.set(year, new Map());
    const yearMap = byYear.get(year)!;
    if (!yearMap.has(mKey)) yearMap.set(mKey, []);
    yearMap.get(mKey)!.push(e);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => {
          // Jan → Dec ascending; "undated" (null) sorts to the end.
          if (a[0] === null) return 1;
          if (b[0] === null) return -1;
          return a[0] - b[0];
        })
        .map(([month, items]) => ({
          month,
          monthLabel: month ? MONTH_NAMES[month - 1] : "Undated",
          items: items.sort((a, b) => sortKey(a.date) - sortKey(b.date)),
        })),
    }));
}

export type ByCollaboratorGroup = {
  collaborator: string;
  items: Collaboration[];
  mostRecent: number; // sort key of latest entry
};

// Names of collaborators that appear on more than one row — these render bold.
export function repeatCollaborators(entries: Collaboration[]): Set<string> {
  const counts = new Map<string, number>();
  for (const e of entries) {
    counts.set(e.collaborator, (counts.get(e.collaborator) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
}

export function groupByCollaborator(
  entries: Collaboration[],
): ByCollaboratorGroup[] {
  const map = new Map<string, Collaboration[]>();
  for (const e of entries) {
    if (!map.has(e.collaborator)) map.set(e.collaborator, []);
    map.get(e.collaborator)!.push(e);
  }
  return [...map.entries()]
    .map(([collaborator, items]) => ({
      collaborator,
      items: items.sort((a, b) => sortKey(a.date) - sortKey(b.date)),
      mostRecent: Math.max(...items.map((i) => sortKey(i.date))),
    }))
    .sort((a, b) =>
      a.collaborator.localeCompare(b.collaborator, undefined, {
        sensitivity: "base",
      }),
    );
}
