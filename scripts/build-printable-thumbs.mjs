#!/usr/bin/env node
/**
 * Render a page-1 preview thumbnail for every PDF in public/downloads/, for the
 * printables hub (/en/printables, /hr/materijali-za-ispis).
 *
 * Usage: node scripts/build-printable-thumbs.mjs          (only missing/stale)
 *        node scripts/build-printable-thumbs.mjs --force  (re-render all)
 *
 * public/downloads/<name>.pdf → public/images/printables/<name>.jpg (600px wide).
 * macOS `sips` rasterises page 1 at the target size (crisp, not an upscale of a
 * 72-dpi render), then the repo's sharp re-encodes it as a small progressive
 * JPEG. JPEG rather than WebP so the same files can feed the OG card (next/og
 * doesn't read WebP). The thumbnails are committed, like the PDFs: run this
 * after any build-*-pdf.mjs script and commit both.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PDF_DIR = path.join(ROOT, "public/downloads");
const OUT_DIR = path.join(ROOT, "public/images/printables");
const WIDTH = 600;
const force = process.argv.includes("--force");

fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "printable-thumbs-"));

let built = 0;
let skipped = 0;
for (const file of fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf")).sort()) {
  const pdf = path.join(PDF_DIR, file);
  const out = path.join(OUT_DIR, file.replace(/\.pdf$/, ".jpg"));
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(pdf).mtimeMs) {
    skipped++;
    continue;
  }

  // Rasterise at 2× the final width so the downscale stays sharp.
  const png = path.join(tmp, file.replace(/\.pdf$/, ".png"));
  execFileSync("sips", ["-s", "format", "png", "--resampleHeightWidthMax", String(WIDTH * 2 * 1.42), pdf, "--out", png], {
    stdio: "ignore",
  });
  await sharp(png)
    .flatten({ background: "#ffffff" })
    .resize({ width: WIDTH })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(out);

  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`  ✓ ${path.relative(ROOT, out)} (${kb} KB)`);
  built++;
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${built} rendered, ${skipped} up to date.`);
