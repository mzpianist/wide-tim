// =============================================================================
// CSV HELPERS
// Shared by the content files that keep their data in a .csv
// (collaborators.csv, press.csv) and by the local editor (editor/server.mjs),
// so the site and the editor always read the files the same way.
// =============================================================================

// Minimal RFC 4180-ish parser: handles quoted fields, embedded commas,
// and escaped quotes (""). Good enough for hand-edited data.
export function parseCsv(text: string): string[][] {
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

// Parses a CSV whose first row is a header into one object per row, keyed
// by the lowercased, trimmed header names. Values are trimmed; missing
// trailing cells come back as "".
export function parseCsvRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((row) =>
    Object.fromEntries(header.map((h, i) => [h, (row[i] ?? "").trim()])),
  );
}

// The inverse of parseCsv. Fields are quoted only when they need to be, so
// a file written here stays as plain as one typed by hand. `eol` lets a file
// saved from Excel keep its Windows ("\r\n") line endings.
export function stringifyCsv(rows: string[][], eol = "\n"): string {
  const cell = (v: string) =>
    /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  return rows.map((r) => r.map(cell).join(",")).join(eol) + eol;
}
