// =============================================================================
// WIDE TIM EDITOR — local server
// A dashboard for the site's content (lists like collaborations and projects,
// and the text of each page), so adding or changing something doesn't mean
// hunting through src/content/. Start it with `npm run editor` or the
// "Wide Tim Editor" shortcut on the Desktop (made by `npm run editor:shortcut`).
// It opens in the browser and saves straight into the data files below;
// nothing here is part of the published site, and it only answers requests
// from this computer.
//
// Saved changes show up in the local site preview right away. The Publish
// button commits them and pushes to `main`, which deploys widetim.com.
// =============================================================================

import http from "node:http";
import { createHash } from "node:crypto";
import { spawn, execFile } from "node:child_process";
import { readFile, writeFile, rename, access, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";
import { parseCsv, parseCsvRecords, stringifyCsv } from "../src/content/csv.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4400;
const SITE_PORT = 4321; // Astro's dev server, used for "View on site" links
const SITE_URL = `http://localhost:${SITE_PORT}`;
const NO_OPEN = process.argv.includes("--no-open");

const run = promisify(execFile);

// The files the editor may write, each read and saved as a whole. `title`
// names them on the Publish screen and in commit messages, and lists say how
// to name one entry (`label`).
const DATASETS = {
  home: { file: "src/content/home.json", title: "Home page" },
  carousel: { file: "src/content/carousel.json", title: "Home background photos", label: (s) => s.alt || s.file },
  aboutTim: { file: "src/content/aboutTim.json", title: "About Wide Tim" },
  aboutCreator: { file: "src/content/aboutCreator.json", title: "About the Creator" },
  collaborations: {
    file: "src/content/collaborators.csv", title: "Past Collaborators",
    label: (r) => [r.collaborator, r.event].filter(Boolean).join(" — "),
  },
  collaboratorsPage: { file: "src/content/collaboratorsPage.json", title: "Past Collaborators page" },
  press: { file: "src/content/press.csv", title: "Wide Tim in the Press", label: (p) => p.title },
  pressPage: { file: "src/content/pressPage.json", title: "Wide Tim in the Press page" },
  projects: { file: "src/content/projects.json", title: "Project Gallery", label: (p) => p.name },
  projectsPage: { file: "src/content/projectsPage.json", title: "Project Gallery page" },
  fun: { file: "src/content/fun.json", title: "For Fun", label: (f) => f.name },
  funPage: { file: "src/content/funPage.json", title: "For Fun page" },
  makeAWiderTim: { file: "src/content/makeAWiderTim.json", title: "Make a Wider Tim" },
  beingWide: { file: "src/content/beingWide.json", title: "Being Wide (2024)" },
  contact: { file: "src/content/contact.json", title: "Contact" },
  socials: { file: "src/content/socials.json", title: "Social links", label: (s) => `${s.platform} ${s.handle}` },
  site: { file: "src/content/site.json", title: "Site settings" },
};

// Where uploaded photos go, one folder per page. Photos are resized to fit
// inside PHOTO_MAX and saved as WebP. `url` is how the data files refer to a
// photo; carousel slides use the bare filename.
const PHOTO_FOLDERS = {
  projects: { dir: "public/projects-images", url: "/projects-images/" },
  about: { dir: "public/about-page-images", url: "/about-page-images/" },
  creator: { dir: "public/about-creator-images", url: "/about-creator-images/" },
  fun: { dir: "public/for-fun-images", url: "/for-fun-images/" },
  carousel: { dir: "src/assets/carousel", url: "" },
};
const PHOTO_MAX = 1600;

// ---------- Reading & writing data files ----------

const hash = (text) => createHash("sha1").update(text).digest("hex");
const str = (v) => (typeof v === "string" ? v.trim() : "");
const isCsv = (name) => DATASETS[name].file.endsWith(".csv");

// Column names are matched case-insensitively, like the site's loaders do.
const csvColumns = (text) => (parseCsv(text)[0] ?? []).map((h) => h.trim().toLowerCase());

// Parses a data file's text: CSVs become a list of row objects keyed by column.
function parse(name, text) {
  if (isCsv(name)) return text ? parseCsvRecords(text) : [];
  return text ? JSON.parse(text) : null;
}

async function load(name) {
  const text = await readFile(path.join(ROOT, DATASETS[name].file), "utf8");
  return { data: parse(name, text), version: hash(text) };
}

// Serializes `data` for the dataset's file. CSV columns and line endings
// come from the file as it is now, so a column added by hand in Excel
// survives a save, and an Excel-saved file keeps its Windows line endings.
async function serialize(name, data) {
  if (!isCsv(name)) return JSON.stringify(data, null, 2) + "\n";
  const current = await readFile(path.join(ROOT, DATASETS[name].file), "utf8");
  const header = parseCsv(current)[0] ?? [];
  const columns = csvColumns(current);
  const eol = current.includes("\r\n") ? "\r\n" : "\n";
  return stringifyCsv([header, ...data.map((row) => columns.map((c) => str(row[c])))], eol);
}

// Writes via a temp file + rename, so the site preview never reads a
// half-written file.
async function writeAtomic(file, text) {
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.tmp`);
  await writeFile(tmp, text);
  await rename(tmp, file);
}

const httpError = (status, message) => Object.assign(new Error(message), { status });

async function save(name, data, version) {
  const current = await load(name);
  if (current.version !== version) {
    throw httpError(
      409,
      `${DATASETS[name].file} was changed outside the editor since you opened it. ` +
        "The editor has reloaded the latest version; please make your change again.",
    );
  }
  if (!data || typeof data !== "object" || Array.isArray(data) !== Array.isArray(current.data)) {
    throw httpError(400, "That doesn't look like the right kind of data for this file.");
  }
  const text = await serialize(name, data);
  await writeAtomic(path.join(ROOT, DATASETS[name].file), text);
  return { version: hash(text) };
}

// ---------- Photos ----------

function slugify(s) {
  return (
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "photo"
  );
}

const exists = (p) => access(p).then(() => true, () => false);

// Saves an uploaded photo as <folder>/<name>.webp. Replacing an entry's own
// photo reuses its filename; otherwise a name already taken by another photo
// gets a -2, -3, ... suffix rather than being overwritten.
async function savePhoto({ folder, name, currentImage, dataUrl }) {
  const target = Object.hasOwn(PHOTO_FOLDERS, folder) && PHOTO_FOLDERS[folder];
  if (!target) throw httpError(400, "Unknown photo folder.");
  // Any file type is accepted here (browsers often don't label iPhone HEIC
  // photos as images); sharp or sips decides whether it really is one.
  const match = /^data:[^,]*;base64,(.+)$/s.exec(dataUrl ?? "");
  if (!match) throw httpError(400, "That file isn't an image.");

  const dir = path.join(ROOT, target.dir);
  await mkdir(dir, { recursive: true });
  const base = slugify(str(name));
  let file = `${base}.webp`;
  for (let n = 2; ; n++) {
    if (target.url + file === currentImage || !(await exists(path.join(dir, file)))) break;
    file = `${base}-${n}.webp`;
  }

  const toWebp = (input) =>
    sharp(input)
      .rotate() // respect the phone's orientation flag
      .resize({ width: PHOTO_MAX, height: PHOTO_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(dir, file));

  const input = Buffer.from(match[1], "base64");
  try {
    await toWebp(input);
  } catch {
    // sharp can't read iPhone HEIC photos; macOS's built-in `sips` can.
    try {
      await toWebp(await convertWithSips(input));
    } catch {
      throw httpError(400, "Couldn't read that image. Try a JPG, PNG, WebP or HEIC photo.");
    }
  }
  return { image: target.url + file };
}

async function convertWithSips(input) {
  const dir = await mkdtemp(path.join(tmpdir(), "wide-tim-editor-"));
  try {
    await writeFile(path.join(dir, "in"), input);
    await run("sips", ["-s", "format", "jpeg", path.join(dir, "in"), "--out", path.join(dir, "out.jpg")]);
    return await readFile(path.join(dir, "out.jpg"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ---------- Publishing ----------
// Publishing commits only the files the editor manages (the data files and
// photo folders above) and pushes them to GitHub, where the Deploy workflow
// rebuilds widetim.com. Anything else that's uncommitted is left alone.

const DATA_FILES = Object.values(DATASETS).map((d) => d.file);
const PHOTO_DIRS = Object.values(PHOTO_FOLDERS).map((f) => f.dir);
// The code that reads the data files. If it has unpublished changes, the
// data might depend on them, so publishing waits until they're committed.
const LOADERS = "src/content/*.ts";

const git = async (args, timeout = 20_000) =>
  (await run("git", args, { cwd: ROOT, timeout, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } })).stdout;

// `git status` entries for the given paths, as { code, file }.
async function gitChanges(paths) {
  const out = await git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...paths]);
  const parts = out.split("\0").filter(Boolean);
  const changes = [];
  for (let i = 0; i < parts.length; i++) {
    const code = parts[i].slice(0, 2);
    changes.push({ code, file: parts[i].slice(3) });
    if (code.includes("R") || code.includes("C")) i++; // skip a rename's old path
  }
  return changes;
}

// What changed in one data file since the last commit, in plain words.
async function describe(name) {
  const ds = DATASETS[name];
  if (!ds.label) return [{ title: ds.title, action: "update", label: "text" }];
  const before = parse(name, await git(["show", `HEAD:${ds.file}`]).catch(() => "")) ?? [];
  const after = (await load(name)).data;

  // Entries identical before and after are unchanged. Of the rest, an added
  // entry that shares at least half its fields with a removed one is the
  // same entry, edited.
  const sig = (x) => JSON.stringify(x);
  const similarity = (a, b) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].filter((k) => sig(a[k]) === sig(b[k])).length / keys.size;
  };
  const removed = [...before];
  const added = [];
  for (const x of after) {
    const i = removed.findIndex((r) => sig(r) === sig(x));
    if (i >= 0) removed.splice(i, 1);
    else added.push(x);
  }
  const lines = [];
  for (const x of added) {
    let i = -1;
    for (let j = 0, best = 0.5; j < removed.length; j++) {
      const score = similarity(x, removed[j]);
      if (score >= best) [i, best] = [j, score];
    }
    if (i >= 0) removed.splice(i, 1);
    lines.push({ title: ds.title, action: i >= 0 ? "update" : "add", label: ds.label(x) });
  }
  for (const x of removed) lines.push({ title: ds.title, action: "remove", label: ds.label(x) });
  if (!lines.length) {
    const sameOrder = sig(before) === sig(after);
    lines.push({ title: ds.title, action: sameOrder ? "tidy" : "reorder", label: sameOrder ? "formatting" : "the order" });
  }
  return lines;
}

async function publishStatus() {
  const problem = (message) => ({ problem: message, changes: [], pending: [], files: [] });
  try {
    await git(["rev-parse", "--git-dir"]);
  } catch {
    return problem("This folder isn't connected to GitHub (it's not a git repository).");
  }
  const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"])).trim();
  if (branch !== "main") {
    return problem(`This folder is on the “${branch}” branch, and only “main” goes live. Ask Claude to switch back to main.`);
  }
  const gitDir = path.resolve(ROOT, (await git(["rev-parse", "--git-dir"])).trim());
  for (const marker of ["MERGE_HEAD", "rebase-merge", "rebase-apply"]) {
    if (await exists(path.join(gitDir, marker))) {
      return problem("A git merge or rebase is in progress in this folder. Ask Claude to finish it first.");
    }
  }
  const all = await gitChanges([LOADERS, ...DATA_FILES, ...PHOTO_DIRS]);
  const loaders = all.filter((c) => c.file.startsWith("src/content/") && c.file.endsWith(".ts"));
  if (loaders.length) {
    return problem(
      `Some site code that reads this content hasn't been published yet (${loaders.map((c) => c.file).join(", ")}). ` +
        "Ask Claude to commit it first.",
    );
  }

  const changes = [];
  const files = [];
  for (const [name, ds] of Object.entries(DATASETS)) {
    if (all.some((c) => c.file === ds.file)) {
      changes.push(...(await describe(name)));
      files.push(ds.file);
    }
  }
  // Photos count only if some data file uses them (or they're being
  // replaced/removed); leftovers from a swapped-out upload stay unpublished.
  const dataText = (await Promise.all(DATA_FILES.map((f) => readFile(path.join(ROOT, f), "utf8")))).join("\n");
  for (const { code, file } of all.filter((c) => PHOTO_DIRS.some((d) => c.file.startsWith(d + "/")))) {
    const untracked = code === "??";
    if (untracked && !dataText.includes(path.basename(file))) continue;
    const action = code.includes("D") ? "remove" : untracked || code.includes("A") ? "add" : "update";
    changes.push({ title: "Photos", action, label: path.basename(file) });
    files.push(file);
  }

  let pending;
  try {
    pending = (await git(["log", "--format=%s", "@{u}..HEAD"])).split("\n").filter(Boolean);
  } catch {
    return problem("This branch isn't linked to GitHub yet. Ask Claude to set that up.");
  }
  return { changes, files, pending };
}

function commitMessage(changes) {
  const titles = [...new Set(changes.map((c) => c.title))];
  const count = (action) => changes.filter((c) => c.action === action).length;
  let subject;
  if (changes.length === 1) {
    const [c] = changes;
    subject = `${c.title}: ${c.action} ${c.label}`;
  } else if (titles.length === 1) {
    const parts = ["add", "update", "remove"].filter(count).map((a) => `${a} ${count(a)}`);
    subject = `${titles[0]}: ${parts.join(", ") || "update"}`;
  } else {
    subject = `Update ${titles.slice(0, -1).join(", ")} and ${titles.at(-1)}`;
  }
  const body = changes.map((c) => `- ${c.title}: ${c.action} ${c.label}`).join("\n");
  return { subject, body: `${body}\n\nPublished from the Wide Tim Editor.` };
}

async function publish() {
  const status = await publishStatus();
  if (status.problem) throw httpError(409, status.problem);
  if (!status.changes.length && !status.pending.length) throw httpError(409, "Everything is already published.");

  try {
    await git(["fetch", "--quiet", "origin"], 60_000);
  } catch {
    throw httpError(502, "Couldn't reach GitHub. Check the internet connection and try again. Nothing was published.");
  }
  if (Number(await git(["rev-list", "--count", "HEAD..@{u}"])) > 0) {
    throw httpError(
      409,
      "GitHub has changes that aren't on this computer yet (made somewhere else). " +
        "Ask Claude to bring them in, then publish again. Nothing was published.",
    );
  }

  if (status.changes.length) {
    const { subject, body } = commitMessage(status.changes);
    await git(["add", "-A", "--", ...status.files]);
    await git(["commit", "--quiet", "-m", subject, "-m", body, "--only", "--", ...status.files]);
  }
  try {
    await git(["push", "--quiet"], 120_000);
  } catch (err) {
    const reason = String(err.stderr || err.message).trim().split("\n")[0];
    throw httpError(
      502,
      `Saved a snapshot on this computer, but couldn't send it to GitHub (${reason}). Try Publish again in a moment.`,
    );
  }
  return { sha: (await git(["rev-parse", "HEAD"])).trim() };
}

// Deploy progress for a pushed commit, from the GitHub CLI if it's set up.
async function deployStatus(sha) {
  if (!/^[0-9a-f]{40}$/.test(sha ?? "")) throw httpError(400, "Bad commit id.");
  try {
    const { stdout } = await run("gh", ["run", "list", "--commit", sha, "--workflow", "deploy.yml", "--limit", "1",
      "--json", "status,conclusion,url"], { cwd: ROOT, timeout: 20_000 });
    const [runInfo] = JSON.parse(stdout);
    return runInfo ? { available: true, ...runInfo } : { available: true, status: "waiting" };
  } catch {
    return { available: false };
  }
}

// ---------- HTTP ----------

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

// Only answer this computer's own browser: the Host header must be ours (stops
// DNS-rebinding tricks), and writes must be same-origin JSON (stops other
// websites from posting to the editor while it's running).
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);

function isTrusted(req) {
  if (!ALLOWED_HOSTS.has(req.headers.host ?? "")) return false;
  if (req.method === "GET") return true;
  const origin = req.headers.origin;
  if (origin && !ALLOWED_HOSTS.has(origin.replace(/^http:\/\//, ""))) return false;
  return (req.headers["content-type"] ?? "").startsWith("application/json");
}

async function readJson(req, limit = 40 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw httpError(413, "That file is too big.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

// Serves a file from `dir` (relative to ROOT), refusing paths that escape it.
async function serveFrom(res, dir, rel) {
  const base = path.join(ROOT, dir);
  const file = path.join(base, decodeURIComponent(rel));
  if (!file.startsWith(base + path.sep)) return send(res, 404, "Not found", "text/plain");
  try {
    const body = await readFile(file);
    send(res, 200, body, TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream");
  } catch {
    send(res, 404, "Not found", "text/plain");
  }
}

async function handle(req, res) {
  if (!isTrusted(req)) return send(res, 403, { error: "Forbidden" });
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const route = `${req.method} ${pathname}`;

  if (route === "GET /") return serveFrom(res, "editor", "index.html");
  // Photos, for previews inside the editor.
  if (req.method === "GET" && pathname.startsWith("/public/")) return serveFrom(res, "public", pathname.slice(8));
  if (req.method === "GET" && pathname.startsWith("/carousel/")) return serveFrom(res, "src/assets/carousel", pathname.slice(10));

  if (route === "GET /api/data") {
    const out = { preview: SITE_URL };
    for (const name of Object.keys(DATASETS)) out[name] = { ...(await load(name)), file: DATASETS[name].file };
    return send(res, 200, out);
  }
  const dataset = /^\/api\/data\/(\w+)$/.exec(pathname)?.[1];
  if (req.method === "PUT" && dataset && Object.hasOwn(DATASETS, dataset)) {
    const { data, version } = await readJson(req);
    return send(res, 200, await save(dataset, data, version));
  }
  if (route === "POST /api/photo") return send(res, 200, await savePhoto(await readJson(req)));

  if (route === "GET /api/publish") {
    const { files, ...status } = await publishStatus();
    return send(res, 200, status);
  }
  if (route === "POST /api/publish") return send(res, 200, await publish());
  if (route === "GET /api/deploy") return send(res, 200, await deployStatus(url.searchParams.get("sha")));

  send(res, 404, { error: "Not found" });
}

// Saves, uploads and publishes run one at a time, so a save can't land
// halfway through a publish. Reads don't wait.
let writes = Promise.resolve();
const server = http.createServer((req, res) => {
  const respond = () =>
    handle(req, res).catch((err) => {
      if (!err.status) console.error(err);
      send(res, err.status ?? 500, { error: err.status ? err.message : `Something went wrong: ${err.message}` });
    });
  if (req.method === "GET") respond();
  else writes = writes.then(respond);
});

// ---------- Site preview ----------

// Starts Astro's dev server alongside the editor (unless one is already
// running) so "View on site" links show saved changes immediately.
let sitePreview = null;

async function ensureSitePreview() {
  try {
    await fetch(SITE_URL, { signal: AbortSignal.timeout(1500) });
    return; // already running, e.g. from `npm run dev`
  } catch {}
  sitePreview = spawn(path.join(ROOT, "node_modules", ".bin", "astro"), ["dev", "--port", String(SITE_PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });
  sitePreview.on("exit", (code) => {
    if (code) console.log(`  (The site preview stopped unexpectedly. Run \`npm run dev\` to see the error.)`);
    sitePreview = null;
  });
}

function shutdown() {
  sitePreview?.kill();
  process.exit(0);
}
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, shutdown);

const openInBrowser = (url) => !NO_OPEN && execFile("open", [url]);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    // Already open (e.g. the shortcut was double-clicked twice): just show it.
    console.log(`The editor is already running at http://localhost:${PORT}`);
    openInBrowser(`http://localhost:${PORT}`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, "127.0.0.1", async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  Wide Tim Editor is running at ${url}`);
  console.log(`  Site preview: ${SITE_URL}`);
  console.log(`\n  Keep this window open while you edit. Close it (or press Ctrl+C) to stop.\n`);
  openInBrowser(url);
  await ensureSitePreview();
});
