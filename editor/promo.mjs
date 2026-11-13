// =============================================================================
// WIDE TIM EDITOR — promo materials
// Turns a promo design (one entry of promo/designs.json: a headline, a photo,
// a few choices) into a page at an exact print size, and saves it as a
// print-ready CMYK PDF in promo/print/.
//
// The page is plain HTML + CSS, so the editor's preview and the printed file
// are the same thing. Printing uses two programs already on this Mac: Chrome
// lays the page out as a PDF, then Ghostscript converts its colors to CMYK.
// Nothing in promo/ is part of the website.
// =============================================================================

import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, rm, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import QRCode from "qrcode";
import { ACCENTS } from "../src/content/palette.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);

export const PROMO_DIR = "promo";
export const PRINT_DIR = "promo/print";

// Trim sizes in inches, portrait. Landscape swaps the two.
export const SIZES = {
  "3x5": { label: "3 × 5 in", w: 3, h: 5 },
  "4x6": { label: "4 × 6 in", w: 4, h: 6 },
  "5x7": { label: "5 × 7 in", w: 5, h: 7 },
  a4: { label: "A4", w: 210 / 25.4, h: 297 / 25.4 },
};
// Extra artwork past each edge that the print shop trims off.
export const BLEED = 0.125;

// The darker "ink" shades of the accents, for accent-colored text on the
// cream background (same values as the light theme in src/styles/global.css).
const INKS = { coral: "#cd3714", teal: "#2c796f", mustard: "#8e6711", lavender: "#7a5ec3", sky: "#2076a5", pink: "#d52156" };
const DARK = "#0d0d0d";
const CREAM = "#faf7f0";
const INK = "#1a1a1a";

// The page's size in inches, without bleed.
export function trimSize(design) {
  const { w, h } = SIZES[design.size] ?? SIZES["5x7"];
  return design.orientation === "landscape" ? { w: h, h: w } : { w, h };
}

// paper/ink: the background and main text. hi: the highlight fill (tags,
// bullets), hiInk: text on it, hiText: highlight-colored text on the paper.
function theme({ background = "dark", accent = "coral" }) {
  const fill = ACCENTS[accent] ?? ACCENTS.coral;
  if (background === "dark") return { paper: DARK, ink: "#f4efe6", soft: "#d4cec6", hi: fill, hiInk: INK, hiText: fill };
  if (background === "cream") return { paper: CREAM, ink: INK, soft: "#3a3733", hi: fill, hiInk: INK, hiText: INKS[accent] ?? INK };
  return { paper: ACCENTS[background] ?? DARK, ink: INK, soft: INK, hi: INK, hiInk: CREAM, hiText: INK };
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const text = (v) => (typeof v === "string" ? v.trim() : "");

// Where a design's photo really is: uploads live in promo/photos, and a path
// like /projects-images/x.webp borrows a photo from the site.
export function photoFile(photo) {
  const p = text(photo);
  if (!p.startsWith("/") || p.includes("..")) return null;
  return p.startsWith("/promo-files/") ? path.join(ROOT, PROMO_DIR, p.slice(13)) : path.join(ROOT, "public", p);
}

// How the page refers to fonts and photos: by the editor's own addresses in
// the preview, and straight from disk when printing.
const WEB = { fonts: "/promo-fonts/", photo: (p) => (p.startsWith("/promo-files/") ? p : "/public" + p) };
const DISK = {
  fonts: pathToFileURL(path.join(ROOT, "editor/fonts")).href + "/",
  photo: (p) => pathToFileURL(photoFile(p) ?? "").href,
};

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page {
  position: relative; overflow: hidden; display: flex; flex-direction: column;
  background: var(--paper); color: var(--ink); font-family: "Open Sans", sans-serif;
  /* --u is 1% of the page's short side, so a design keeps its proportions at
     every size. --k scales all the text; the script below turns it down
     until everything fits. --edge keeps text clear of the trimmed edge. */
  --edge: calc(var(--u) * 7 + var(--bleed));
}
.photo { position: relative; overflow: hidden; background: var(--hi); }
.photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.stripes { display: flex; flex: none; }
.stripes i { flex: 1; }
.copy { display: flex; flex-direction: column; min-height: 0; overflow: hidden; gap: calc(var(--u) * 3.2 * var(--k)); }
.head { display: flex; flex-direction: column; gap: calc(var(--u) * 3 * var(--k)); }
.eyebrow {
  align-self: flex-start; background: var(--hi); color: var(--hi-ink); border-radius: 99em;
  padding: calc(var(--u) * 0.7 * var(--k)) calc(var(--u) * 2.4 * var(--k));
  font: 600 calc(var(--u) * 3 * var(--k)) / 1.3 "Oswald", sans-serif; letter-spacing: 0.1em; text-transform: uppercase;
}
.headline {
  font-size: calc(var(--u) * var(--hs) * var(--k)); text-transform: uppercase; white-space: pre-line; text-wrap: balance;
  font-weight: 400; font-family: "Rubik Mono One", "Oswald", sans-serif; line-height: 1.1; letter-spacing: -0.02em;
}
.font-tall .headline { font-family: "Oswald", sans-serif; font-weight: 700; line-height: 1.08; letter-spacing: 0.005em; }
.body { font-size: calc(var(--u) * 3.6 * var(--k)); line-height: 1.45; color: var(--soft); white-space: pre-line; }
.bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: calc(var(--u) * 4); margin-top: auto; }
.info { display: flex; flex-direction: column; gap: calc(var(--u) * 2.4 * var(--k)); min-width: 0; }
.details { list-style: none; display: flex; flex-direction: column; gap: calc(var(--u) * 1 * var(--k)); }
.details li {
  font: 500 calc(var(--u) * 4.4 * var(--k)) / 1.25 "Oswald", sans-serif; letter-spacing: 0.01em;
  padding-left: 1em; position: relative;
}
.details li::before { content: ""; position: absolute; left: 0; top: 0.4em; width: 0.5em; height: 0.5em; background: var(--hi); }
.footer { font-size: calc(var(--u) * 3 * var(--k)); font-weight: 600; line-height: 1.3; color: var(--soft); }
.qr {
  flex: none; width: calc(var(--u) * 21); padding: calc(var(--u) * 1.6); border-radius: calc(var(--u) * 1.8);
  background: ${CREAM}; color: ${INK}; text-align: center;
}
.qr svg { display: block; width: 100%; height: auto; }
.qr span {
  display: block; margin-top: calc(var(--u) * 1); font: 600 calc(var(--u) * 2.3) / 1.2 "Oswald", sans-serif;
  letter-spacing: 0.08em; text-transform: uppercase;
}

/* Photo on top: the photo fills whatever the text leaves. */
.layout-photo-top .photo { flex: 1 1 0; min-height: 32%; }
.layout-photo-top .stripes { height: calc(var(--u) * 1.6); }
.layout-photo-top .copy { flex: 0 1 auto; padding: calc(var(--u) * 6) var(--edge) var(--edge); }
.layout-photo-top.no-photo .copy { flex: 1; padding-top: var(--edge); }
.layout-photo-top.no-photo .head { margin-block: auto; }
.landscape.layout-photo-top { flex-direction: row; }
.landscape.layout-photo-top .photo { min-height: 0; }
.landscape.layout-photo-top .stripes { height: auto; width: calc(var(--u) * 1.6); flex-direction: column; }
.landscape.layout-photo-top .copy { flex: 0 0 52%; padding: var(--edge); padding-left: calc(var(--u) * 6); }
.landscape.layout-photo-top .head { margin-block: auto; }

/* Photo all over: the text sits on a fade of the background color. */
.layout-full-photo .photo { position: absolute; inset: 0; }
.layout-full-photo .copy {
  position: absolute; left: 0; right: 0; bottom: 0; max-height: 82%;
  padding: calc(var(--u) * 26) var(--edge) var(--edge);
  background: linear-gradient(to bottom, transparent, var(--scrim) calc(var(--u) * 24));
}
.layout-full-photo .body, .layout-full-photo .footer { color: var(--ink); }

/* Big words: the headline is the picture; a photo, if any, sits in a frame. */
.layout-big-type .copy { flex: 1 1 0; padding: var(--edge) var(--edge) calc(var(--u) * 6); }
.layout-big-type .photo {
  flex: 1 1 0; min-height: 24%; border: calc(var(--u) * 0.7) solid var(--ink); border-radius: calc(var(--u) * 3.5);
}
.layout-big-type.no-photo .head { margin-block: auto; }
.layout-big-type .stripes { height: calc(var(--u) * 2.4 + var(--bleed)); }
`;

// Runs inside the page: shrinks the headline until no word is cut off and it
// fits its lines, then shrinks all the text until nothing spills.
const FIT = `
(async () => {
  await Promise.all(['400 10px "Open Sans"', '600 10px "Open Sans"', '600 10px "Oswald"', '700 10px "Oswald"', '10px "Rubik Mono One"']
    .map((f) => document.fonts.load(f).catch(() => {})));
  const page = document.querySelector(".page");
  const flow = document.querySelector(".copy");
  const hl = document.querySelector(".headline");
  if (hl) {
    const max = Number(hl.dataset.max);
    const lines = Number(hl.dataset.lines);
    const tooBig = () =>
      hl.scrollWidth > hl.clientWidth + 1 ||
      hl.getBoundingClientRect().height > parseFloat(getComputedStyle(hl).lineHeight) * lines + 1;
    for (let s = max; s > max * 0.3 && tooBig(); s *= 0.96) hl.style.setProperty("--hs", s);
  }
  let k = Number(page.style.getPropertyValue("--k"));
  while (k > 0.45 && flow.scrollHeight > flow.clientHeight + 1) page.style.setProperty("--k", (k -= 0.02));
  // "Photo all over": the photo stops halfway down the words, behind the
  // solid part of the fade, so its subject isn't hidden under them.
  const under = document.querySelector(".layout-full-photo .photo");
  if (under) under.style.bottom = flow.offsetHeight * 0.5 + "px";
  document.documentElement.dataset.ready = "1";
})();
`;

const TEXT_SIZES = { small: 0.86, normal: 1, large: 1.15 };
// Per layout: the headline's biggest size (in --u) and most lines.
const HEADLINE = { "photo-top": [12, 3], "full-photo": [12.5, 3], "big-type": [24, 5] };

// The whole page as an HTML document. `bleed` adds the trim-off margin.
export async function renderPromo(design, { bleed = false, forPrint = false } = {}) {
  const urls = forPrint ? DISK : WEB;
  const trim = trimSize(design);
  const b = bleed ? BLEED : 0;
  const W = trim.w + 2 * b;
  const H = trim.h + 2 * b;
  const t = theme(design);
  const layout = Object.hasOwn(HEADLINE, design.layout) ? design.layout : "photo-top";
  const photo = text(design.photo);
  const focus = ["top", "bottom", "left", "right"].includes(design.photoFocus) ? design.photoFocus : "center";
  const headline = text(design.headline);
  const details = (Array.isArray(design.details) ? design.details : []).map(text).filter(Boolean);
  const qrUrl = text(design.qrUrl);
  const [maxSize, maxLines] = HEADLINE[layout];

  const photoHtml = photo
    ? `<div class="photo"><img src="${esc(/^https?:/.test(photo) ? photo : urls.photo(photo))}" style="object-position:${focus}" alt=""></div>`
    : "";
  // The six accents in a row; the one matching the background turns cream so it still shows.
  const stripes = `<div class="stripes">${Object.values(ACCENTS).map((c) => `<i style="background:${c === t.paper ? CREAM : c}"></i>`).join("")}</div>`;
  const head = `<div class="head">
    ${text(design.eyebrow) ? `<div class="eyebrow">${esc(text(design.eyebrow))}</div>` : ""}
    ${headline ? `<h1 class="headline" data-max="${maxSize}" data-lines="${headline.includes("\n") ? headline.split("\n").length : maxLines}" style="--hs:${maxSize}">${esc(headline)}</h1>` : ""}
    ${text(design.body) ? `<p class="body">${esc(text(design.body))}</p>` : ""}
  </div>`;
  const qr = qrUrl
    ? `<div class="qr">${await QRCode.toString(qrUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: INK, light: "#0000" } })}${
        text(design.qrCaption) ? `<span>${esc(text(design.qrCaption))}</span>` : ""}</div>`
    : "";
  const info = details.length || text(design.footer)
    ? `<div class="info">
        ${details.length ? `<ul class="details">${details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
        ${text(design.footer) ? `<div class="footer">${esc(text(design.footer))}</div>` : ""}
      </div>`
    : "";
  const bottom = info || qr ? `<div class="bottom">${info || "<div></div>"}${qr}</div>` : "";

  const inner = {
    "photo-top": `${photoHtml}${photo ? stripes : ""}<div class="copy">${head}${bottom}</div>`,
    "full-photo": `${photoHtml}<div class="copy">${head}${bottom}</div>`,
    "big-type": `<div class="copy">${head}${photoHtml}${bottom}</div>${stripes}`,
  }[layout];

  const classes = [
    "page", `layout-${layout}`, design.orientation === "landscape" ? "landscape" : "portrait",
    design.headlineFont === "tall" ? "font-tall" : "font-chunky", photo ? "has-photo" : "no-photo",
  ].join(" ");
  const vars = {
    "--u": `${Math.min(trim.w, trim.h) / 100}in`, "--bleed": `${b}in`, "--k": TEXT_SIZES[design.textSize] ?? 1,
    "--paper": t.paper, "--ink": t.ink, "--soft": t.soft, "--hi": t.hi, "--hi-ink": t.hiInk, "--hi-text": t.hiText,
    "--scrim": t.paper + "f0",
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(text(design.name) || "Promo")}</title>
<style>
@font-face { font-family: "Open Sans"; font-weight: 300 800; src: url("${urls.fonts}open-sans.woff2") format("woff2"); }
@font-face { font-family: "Oswald"; font-weight: 200 700; src: url("${urls.fonts}oswald.woff2") format("woff2"); }
@font-face { font-family: "Rubik Mono One"; src: url("${urls.fonts}rubik-mono-one.woff2") format("woff2"); }
@page { size: ${W}in ${H}in; margin: 0; }
html, body, .page { width: ${W}in; height: ${H}in; }
body { background: ${t.paper}; }
${CSS}
</style>
</head>
<body>
<div class="${classes}" style="${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}">${inner}</div>
<script>${FIT}</script>
</body>
</html>
`;
}

// ---------- Print files ----------

const exists = (p) => access(p).then(() => true, () => false);

async function findProgram(candidates) {
  for (const p of candidates) if (await exists(p)) return p;
  return null;
}

const findChrome = () =>
  findProgram(["Google Chrome", "Chromium", "Microsoft Edge", "Brave Browser"].map((n) => `/Applications/${n}.app/Contents/MacOS/${n}`));

// The Desktop shortcut doesn't always get the shell's PATH, so look in
// Homebrew's usual spots too.
const findGhostscript = () =>
  findProgram([...(process.env.PATH ?? "").split(":"), "/opt/homebrew/bin", "/usr/local/bin"].filter(Boolean).map((d) => path.join(d, "gs")));

// Saves one PDF per size into promo/print/, named <baseName>-<size>.pdf.
// Returns { files, cmyk }; cmyk is false if Ghostscript is missing, in which
// case the PDFs are left in RGB.
export async function exportPromo(design, { sizes, bleed = true, baseName = "promo" }) {
  const chrome = await findChrome();
  if (!chrome) throw Object.assign(new Error("Making print files needs Google Chrome, and it isn't in the Applications folder."), { status: 500 });
  const gs = await findGhostscript();
  const outDir = path.join(ROOT, PRINT_DIR);
  await mkdir(outDir, { recursive: true });
  const tmp = await mkdtemp(path.join(tmpdir(), "wide-tim-promo-"));
  const files = [];
  try {
    for (const size of sizes.filter((s) => Object.hasOwn(SIZES, s))) {
      const sized = { ...design, size };
      const html = path.join(tmp, `${size}.html`);
      const rgb = path.join(tmp, `${size}-rgb.pdf`);
      await writeFile(html, await renderPromo(sized, { bleed, forPrint: true }));
      await run(chrome, [
        "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files",
        `--user-data-dir=${path.join(tmp, "chrome")}`, "--virtual-time-budget=20000",
        `--print-to-pdf=${rgb}`, pathToFileURL(html).href,
      ], { timeout: 90_000 });

      const name = [baseName, size, design.orientation === "landscape" && "landscape", bleed && "with-bleed"].filter(Boolean).join("-") + ".pdf";
      const out = path.join(outDir, name);
      if (gs) {
        // The TrimBox tells the print shop where the finished edge is.
        const trim = trimSize(sized);
        const b = bleed ? BLEED * 72 : 0;
        const box = [b, b, b + trim.w * 72, b + trim.h * 72].map((n) => n.toFixed(2)).join(" ");
        await run(gs, [
          "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/prepress", "-dCompatibilityLevel=1.6",
          "-sColorConversionStrategy=CMYK", "-dProcessColorModel=/DeviceCMYK", "-dFirstPage=1", "-dLastPage=1",
          `-sOutputFile=${out}`, "-c", `[/TrimBox [${box}] /PAGES pdfmark`, "-f", rgb,
        ], { timeout: 120_000 });
      } else {
        await copyFile(rgb, out);
      }
      files.push(path.join(PRINT_DIR, name));
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
  return { files, cmyk: !!gs };
}
