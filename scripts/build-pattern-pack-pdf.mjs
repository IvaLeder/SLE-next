#!/usr/bin/env node
/**
 * build-pattern-pack-pdf.mjs — renders the printable "Pattern maker" starter
 * pack to PDF for each language. Two A4 pages:
 *   1. Complete the pattern — rows that start a repeating shape pattern and
 *      leave blank boxes to continue by hand.
 *   2. Cut and make your own — a sheet of shape tiles to cut out, plus blank
 *      strips to arrange them on (the paper version of the online Build mode
 *      in src/components/tools/PatternMaker.tsx).
 *
 * Outline shapes on purpose: they print on any black-and-white printer and can
 * be coloured in, matching the felt-shape activity in the article.
 *
 * Pipeline (same as build-cipher-wheel-pdf.mjs): print-styled standalone HTML →
 * headless Google Chrome `--print-to-pdf` → public/downloads/.
 *
 * Usage:  node scripts/build-pattern-pack-pdf.mjs        (both languages)
 *         node scripts/build-pattern-pack-pdf.mjs en     (one language)
 *
 * Requires Google Chrome installed.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "stemlittleexplorers.com";

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const langArg = process.argv[2];
const langs = langArg ? [langArg] : ["en", "hr"];

const PDF_FILE = {
  en: "downloads/pattern-starter-pack.pdf",
  hr: "downloads/predlozak-uzoraka.pdf",
};

const copy = {
  en: {
    brand: "STEM Little Explorers",
    title: "Pattern maker starter pack",
    subtitle:
      "Look at how each row begins, then draw or place the shape that comes next. Colour them in any way you like.",
    page2Title: "Cut out and make your own",
    page2Sub:
      "Cut out the shapes below, then arrange them on the empty strips to build your own repeating pattern.",
    stripsLabel: "Your own pattern strips",
    scissors: "cut along the lines",
    more: "Play the online version:",
    moreUrl: `${HOST}/en/tools/pattern-maker`,
  },
  hr: {
    brand: "STEM Little Explorers",
    title: "Slagalica uzoraka - predložak",
    subtitle:
      "Pogledaj kako svaki red počinje, zatim nacrtaj ili postavi oblik koji slijedi. Oboji ih kako god želiš.",
    page2Title: "Izreži i složi svoj uzorak",
    page2Sub:
      "Izreži oblike dolje, zatim ih posloži na prazne trake da složiš svoj uzorak koji se ponavlja.",
    stripsLabel: "Tvoje trake za uzorke",
    scissors: "reži po crtama",
    more: "Igraj online verziju:",
    moreUrl: `${HOST}/hr/alati/slagalica-uzoraka`,
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Outline shapes in a 24x24 viewBox. Distinct forms so they read in black and
// white; a coloured stroke helps on colour printers without needing a fill.
const SHAPES = {
  circle: { color: "#378ADD", svg: '<circle cx="12" cy="12" r="9"/>' },
  square: { color: "#D85A30", svg: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
  triangle: { color: "#639922", svg: '<polygon points="12,3 21.5,21 2.5,21"/>' },
  star: {
    color: "#7F77DD",
    svg: '<polygon points="12,2 14.7,9.2 22,9.6 16.2,14.3 18.2,21.5 12,17.3 5.8,21.5 7.8,14.3 2,9.6 9.3,9.2"/>',
  },
  heart: {
    color: "#E24B4A",
    svg: '<path d="M12 21 C 3 14, 4 5, 9 5 C 11 5, 12 7, 12 8 C 12 7, 13 5, 15 5 C 20 5, 21 14, 12 21 Z"/>',
  },
  diamond: { color: "#EF9F27", svg: '<polygon points="12,2 22,12 12,22 2,12"/>' },
};

// The repeating "core" of each row on page 1, listed by shape name.
const ROWS = [
  ["circle", "square"],
  ["circle", "square", "triangle"],
  ["circle", "circle", "square", "square"],
  ["triangle", "star", "star"],
  ["heart", "circle", "triangle"],
  ["square", "square", "star"],
  ["circle", "square", "triangle", "star"],
  ["diamond", "heart"],
];

// One shape tile: `filled` draws the shape, otherwise a dashed box to fill in.
function cell(shapeName, { filled = true } = {}) {
  if (!filled) {
    return `<div class="box blank"></div>`;
  }
  const s = SHAPES[shapeName];
  return `<div class="box"><svg viewBox="0 0 24 24" width="12mm" height="12mm">
    <g fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linejoin="round">${s.svg}</g>
  </svg></div>`;
}

function completeRow(core) {
  const cols = 9;
  const show = Math.min(core.length * 2, 6); // ~2 cycles, then blanks to continue
  const cells = [];
  for (let c = 0; c < cols; c++) {
    cells.push(c < show ? cell(core[c % core.length]) : cell(null, { filled: false }));
  }
  return `<div class="row">${cells.join("")}</div>`;
}

function buildHtml(lang) {
  const t = copy[lang];

  const page1Rows = ROWS.map(completeRow).join("");

  // Page 2: a grid of loose tiles to cut out (each shape repeated across a row).
  const tileNames = Object.keys(SHAPES);
  const cutGrid = tileNames
    .flatMap((name) => Array.from({ length: 6 }, () => cell(name)))
    .join("");
  // Three empty strips to arrange the cut tiles on.
  const blankStrip = `<div class="row">${Array.from({ length: 9 }, () => cell(null, { filled: false })).join("")}</div>`;
  const strips = [blankStrip, blankStrip, blankStrip].join("");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 14mm 16mm; }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: #FB6F52; font-weight: 700; }
    h1 { font-size: 24pt; font-weight: 800; color: #2c2940; margin: 2mm 0 1.5mm; }
    h2 { font-size: 16pt; font-weight: 800; color: #FB6F52; margin: 2mm 0 1.5mm; }
    .sub { font-size: 11pt; line-height: 1.45; color: #56536b; max-width: 175mm; margin: 0 0 5mm; }
    .row { display: flex; gap: 3mm; margin: 0 0 4.5mm; }
    .box { width: 16mm; height: 16mm; border-radius: 2mm; display: flex; align-items: center; justify-content: center; background: #FFFDF7; border: 0.4mm solid #e7e1d3; }
    .box.blank { border: 0.5mm dashed #c7c0b0; background: transparent; }
    .grid { display: flex; flex-wrap: wrap; gap: 3mm; margin: 0 0 6mm; }
    .grid .box { border: 0.3mm solid #ded7c7; }
    .scissors { font-size: 9pt; color: #9b97a8; margin: 0 0 2mm; }
    .strips-label { font-size: 11pt; font-weight: 700; color: #2c2940; margin: 2mm 0 2mm; }
    .foot { position: absolute; bottom: 9mm; left: 16mm; right: 16mm; font-size: 9pt; color: #b3ad9c; text-align: center; }
    .more { font-weight: 700; color: #7a778c; }
  </style></head><body>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.title)}</h1>
    <p class="sub">${esc(t.subtitle)}</p>
    ${page1Rows}
    <div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>
  </div>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h2>${esc(t.page2Title)}</h2>
    <p class="sub">${esc(t.page2Sub)}</p>
    <div class="scissors">${esc(t.scissors)}</div>
    <div class="grid">${cutGrid}</div>
    <div class="strips-label">${esc(t.stripsLabel)}</div>
    ${strips}
    <div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>
  </div>
  </body></html>`;
}

if (!fs.existsSync(CHROME)) {
  console.error(`Chrome not found at: ${CHROME}\nSet CHROME_PATH to your Chrome binary.`);
  process.exit(1);
}

for (const lang of langs) {
  if (!PDF_FILE[lang]) {
    console.error(`Unknown language: ${lang}`);
    continue;
  }
  const html = buildHtml(lang);
  const htmlPath = path.join(os.tmpdir(), `pattern-pack-${lang}.html`);
  fs.writeFileSync(htmlPath, html, "utf8");

  const outPath = path.join(ROOT, "public", PDF_FILE[lang]);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log(`Rendering ${lang} → ${path.relative(ROOT, outPath)} …`);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=6000",
      `--print-to-pdf=${outPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`  done (${kb} KB)`);
}
