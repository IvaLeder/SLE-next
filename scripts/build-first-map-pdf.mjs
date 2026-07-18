#!/usr/bin/env node
/**
 * build-first-map-pdf.mjs — renders "The First Map" / "Prva karta" print
 * keepsake to PDF for each language, from the hand-authored storybook HTML.
 *
 * Unlike build-summer-pdf.mjs (which generates HTML from a data module), the
 * First Map is authored by hand in storybook/the-first-map/*.html over a set of
 * illustrations in storybook/the-first-map/images-opt/. Those source images are
 * full-size (~2000px, ~9 MB total); serving them straight would make a ~10 MB
 * download, so this pipeline:
 *
 *   1. downscales the illustrations to a screen-weight set (sips, 1400px, q78),
 *   2. renders each HTML to A4 PDF via headless Chrome --print-to-pdf,
 *   3. re-cuts the cover thumbnail from page 1 (landing hero + OG image),
 *   4. checks every fixed-height A4 page for overflow (pages are overflow:hidden,
 *      so text that grew past the box would silently clip — this catches it).
 *
 * A text edit in the HTML only needs a re-render: the illustrations are
 * unchanged, so the same downscaled set is reused for both languages.
 *
 * Usage:  node scripts/build-first-map-pdf.mjs            (both languages)
 *         node scripts/build-first-map-pdf.mjs en         (one language)
 *         node scripts/build-first-map-pdf.mjs --no-cover (skip cover re-cut)
 *
 * Requires Google Chrome + sips (macOS). Set CHROME_PATH to override Chrome.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "storybook", "the-first-map");
const IMG_SRC = path.join(SRC_DIR, "images-opt");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Screen-weight targets (verified: ~6 MB PDFs, sharp at print size).
const MAX_W = 1400; // longest side, px
const JPEG_Q = 78; // illustration quality
const COVER_Q = 86; // cover thumbnail quality

const TARGETS = {
  en: {
    html: "the-first-map-web.html",
    pdf: "public/downloads/the-first-map.pdf",
    cover: "public/images/the-first-map-cover.jpg",
  },
  hr: {
    html: "the-first-map-hr.html",
    pdf: "public/downloads/prva-karta.pdf",
    cover: "public/images/prva-karta-cover.jpg",
  },
};

const args = process.argv.slice(2);
const noCover = args.includes("--no-cover");
const noCheck = args.includes("--no-check");
const langArg = args.find((a) => !a.startsWith("--"));
const langs = langArg ? [langArg] : ["en", "hr"];

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(CHROME))
  fail(`Chrome not found at: ${CHROME}\n  Set CHROME_PATH to your Chrome binary.`);
if (!fs.existsSync(IMG_SRC)) fail(`Illustrations not found at: ${IMG_SRC}`);

// 1. Downscale illustrations once into a shared work dir (reused across langs).
function compressImages(workImgDir) {
  fs.mkdirSync(workImgDir, { recursive: true });
  const files = fs.readdirSync(IMG_SRC).filter((f) => /\.jpe?g$/i.test(f));
  process.stdout.write(`Compressing ${files.length} illustrations → ${MAX_W}px q${JPEG_Q} … `);
  for (const f of files) {
    execFileSync(
      "sips",
      ["-Z", String(MAX_W), "-s", "format", "jpeg", "-s", "formatOptions", String(JPEG_Q),
        path.join(IMG_SRC, f), "--out", path.join(workImgDir, f)],
      { stdio: "ignore" },
    );
  }
  const kb = fs.readdirSync(workImgDir).reduce((n, f) => n + fs.statSync(path.join(workImgDir, f)).size, 0) / 1024;
  console.log(`done (${Math.round(kb)} KB total)`);
}

// 2. Render one HTML → PDF via headless Chrome.
function renderPdf(htmlPath, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  execFileSync(
    CHROME,
    ["--headless=new", "--disable-gpu", "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw", "--virtual-time-budget=8000",
      `--print-to-pdf=${outPath}`, `file://${htmlPath}`],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
}

// 3. Re-cut the cover thumbnail from page 1 of the rendered PDF.
function makeCover(pdfPath, coverPath) {
  fs.mkdirSync(path.dirname(coverPath), { recursive: true });
  execFileSync(
    "sips",
    ["-s", "format", "jpeg", "-s", "formatOptions", String(COVER_Q), pdfPath, "--out", coverPath],
    { stdio: "ignore" },
  );
}

// 4. Overflow check: load the HTML in headless Chrome, measure every .page, and
//    dump the result into the DOM (pages are overflow:hidden, so a page whose
//    content outgrew its A4 box would clip silently — this is the only signal).
function checkOverflow(htmlPath, workDir) {
  const src = fs.readFileSync(htmlPath, "utf8");
  const probe = `<script>
(function(){function m(){var ps=[].slice.call(document.querySelectorAll('.page'));
var o=ps.map(function(p,i){var pad=p.querySelector('.pad')||p;return{pg:i+1,over:Math.round(pad.scrollHeight-p.clientHeight)};}).filter(function(x){return x.over>4;});
var e=document.getElementById('__ov')||document.createElement('div');e.id='__ov';e.textContent=JSON.stringify(o);if(!e.parentNode)document.body.appendChild(e);}
m();if(document.fonts&&document.fonts.ready){document.fonts.ready.then(m);}setTimeout(m,3000);})();
</script>`;
  const probed = src.replace(/<\/body>/i, `${probe}</body>`);
  const probePath = path.join(workDir, `__probe-${path.basename(htmlPath)}`);
  fs.writeFileSync(probePath, probed, "utf8");
  const dom = execFileSync(
    CHROME,
    ["--headless=new", "--disable-gpu", "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=8000", "--dump-dom", `file://${probePath}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );
  fs.rmSync(probePath, { force: true });
  const m = dom.match(/<div id="__ov"[^>]*>([\s\S]*?)<\/div>/);
  if (!m) return { ok: null, pages: [] }; // couldn't measure; don't block
  const pages = JSON.parse(m[1] || "[]");
  return { ok: pages.length === 0, pages };
}

// --- run ---
const work = fs.mkdtempSync(path.join(os.tmpdir(), "first-map-"));
compressImages(path.join(work, "images-opt"));

let hadOverflow = false;
for (const lang of langs) {
  const t = TARGETS[lang];
  if (!t) { console.error(`Unknown language: ${lang}`); continue; }

  const htmlWork = path.join(work, t.html);
  fs.copyFileSync(path.join(SRC_DIR, t.html), htmlWork);

  const outPath = path.join(ROOT, t.pdf);
  process.stdout.write(`\n[${lang}] rendering → ${t.pdf} … `);
  renderPdf(htmlWork, outPath);
  console.log(`done (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(1)} MB)`);

  if (!noCheck) {
    const r = checkOverflow(htmlWork, work);
    if (r.ok === false) {
      hadOverflow = true;
      console.log(`  ⚠ OVERFLOW on page(s): ${r.pages.map((p) => `${p.pg} (+${p.over}px)`).join(", ")}`);
    } else if (r.ok === true) {
      console.log(`  ✓ 21 pages, no overflow`);
    } else {
      console.log(`  · overflow check skipped (could not measure)`);
    }
  }

  if (!noCover) {
    makeCover(outPath, path.join(ROOT, t.cover));
    console.log(`  ✓ cover → ${t.cover}`);
  }
}

fs.rmSync(work, { recursive: true, force: true });

if (hadOverflow) {
  console.error(`\n✗ Overflow detected — text clipped on a fixed A4 page. Trim copy or the PDF will cut off.`);
  process.exit(2);
}
console.log(`\n✓ Done.`);
