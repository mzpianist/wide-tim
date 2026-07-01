// Center-crops sources in images-src/ to 1:1 (square) and resizes to TARGET_W x TARGET_H,
// writing to public/home-page-images/ in the source's original format.
// Square output matches the home page card thumbnails (aspect-ratio: 1/1, object-fit: cover).
// Idempotent: skips outputs newer than their source.

import { readdir, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const SRC_DIR = "images-src";
const OUT_DIR = "public/home-page-images";
const TARGET_W = 1200;
const TARGET_H = 1200;
const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function processOne(srcPath, outPath) {
  const img = sharp(srcPath, { failOn: "error" });
  const ext = extname(outPath).toLowerCase();

  let pipeline = img.resize({
    width: TARGET_W,
    height: TARGET_H,
    fit: "cover",
    position: "center",
    withoutEnlargement: false,
  });

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 82 });
  } else if (ext === ".avif") {
    pipeline = pipeline.avif({ quality: 60 });
  }

  await pipeline.toFile(outPath);
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`[images] no ${SRC_DIR}/ — nothing to do`);
    return;
  }
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(SRC_DIR);
  let processed = 0;
  let skipped = 0;

  for (const name of entries) {
    const ext = extname(name).toLowerCase();
    if (!SUPPORTED.has(ext)) continue;

    const srcPath = join(SRC_DIR, name);
    const outName = basename(name, ext) + ext;
    const outPath = join(OUT_DIR, outName);

    const srcStat = await stat(srcPath);
    if (existsSync(outPath)) {
      const outStat = await stat(outPath);
      if (outStat.mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        continue;
      }
    }

    try {
      await processOne(srcPath, outPath);
      console.log(`[images] ${name} → ${outPath} (${TARGET_W}x${TARGET_H})`);
      processed++;
    } catch (err) {
      console.error(`[images] failed ${name}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  console.log(`[images] done — ${processed} processed, ${skipped} up-to-date`);
}

main();
