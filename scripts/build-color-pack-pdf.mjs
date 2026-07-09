#!/usr/bin/env node
/**
 * build-color-pack-pdf.mjs — renders the printable "Color mixing lab"
 * worksheet pack to PDF for each language. Two A4 pages:
 *   1. Mixing equations (color the two named circles, mix crayons in the
 *      blank one), a 6-wedge color wheel to complete, and a tint/shade ladder.
 *   2. My mixing lab notebook — a prediction/result log for the bottle
 *      experiment in the learning-colors article (the paper version of the
 *      online mix mode in src/components/tools/ColorMixer.tsx).
 *
 * Outline circles on purpose: they print on any black-and-white printer and
 * the coloring-in IS the activity, matching the pattern starter pack.
 *
 * Pipeline (same as build-pattern-pack-pdf.mjs): print-styled standalone HTML →
 * headless Google Chrome `--print-to-pdf` → public/downloads/.
 *
 * Usage:  node scripts/build-color-pack-pdf.mjs        (both languages)
 *         node scripts/build-color-pack-pdf.mjs en     (one language)
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
  en: "downloads/color-mixing-lab.pdf",
  hr: "downloads/laboratorij-boja.pdf",
};

// Stroke colors match the pots in ColorMixer.tsx so screen and paper agree.
const COLORS = {
  red: { hex: "#E24B4A", name: { en: "red", hr: "crvena" } },
  yellow: { hex: "#D9B211", name: { en: "yellow", hr: "žuta" } }, // darker stroke so the label stays readable
  blue: { hex: "#378ADD", name: { en: "blue", hr: "plava" } },
  orange: { hex: "#EF8A2B", name: { en: "orange", hr: "narančasta" } },
  green: { hex: "#639922", name: { en: "green", hr: "zelena" } },
  violet: { hex: "#8A5BC4", name: { en: "violet", hr: "ljubičasta" } },
};

// Page-1 equations: the three secondary classics, one tertiary, one mud surprise.
const EQUATIONS = [
  ["red", "yellow"],
  ["yellow", "blue"],
  ["blue", "red"],
  ["red", "orange"],
  ["blue", "green"],
  ["red", "green"],
];

// Color-wheel order; primaries get their name, secondaries get a "?".
const WHEEL = ["red", "orange", "yellow", "green", "blue", "violet"];
const PRIMARIES = new Set(["red", "yellow", "blue"]);

const copy = {
  en: {
    brand: "STEM Little Explorers",
    title: "Color mixing lab",
    subtitle:
      "Color each circle with the color written in it. Then mix those two crayons in the empty circle - what new color appears?",
    wheelTitle: "Complete the color wheel",
    wheelSub: "Color the three primary wedges, then mix your crayons to fill in the ? wedges.",
    ladderTitle: "Tints and shades",
    ladderSub:
      "Pick one color. Paint it pure in the middle box, add more black toward the left, more white toward the right.",
    black: "+ black",
    white: "+ white",
    pure: "pure color",
    page2Title: "My mixing lab notebook",
    page2Sub:
      "Do the bottle experiment from the article: pick two colors and color them in, guess the mix (your prediction!), then really mix them and record what you got.",
    th: ["Color 1", "Color 2", "My prediction", "What I got", "Its name"],
    tip: "Mud alert! Complementary pairs - red + green, blue + orange, yellow + violet - cancel out into brown. Try one!",
    more: "Play the online version:",
    moreUrl: `${HOST}/en/tools/color-mixer`,
  },
  hr: {
    brand: "STEM Little Explorers",
    title: "Laboratorij za miješanje boja",
    subtitle:
      "Oboji svaki krug bojom koja u njemu piše. Zatim pomiješaj te dvije bojice u praznom krugu - koja nova boja nastaje?",
    wheelTitle: "Dovrši krug boja",
    wheelSub: "Oboji tri primarna polja, zatim miješaj bojice i popuni polja s upitnikom.",
    ladderTitle: "Svjetliji i tamniji tonovi",
    ladderSub:
      "Odaberi jednu boju. U srednje polje oboji je čistu, prema lijevo dodaj više crne, prema desno više bijele.",
    black: "+ crna",
    white: "+ bijela",
    pure: "čista boja",
    page2Title: "Moja bilježnica miješanja",
    page2Sub:
      "Izvedi pokus s bočicama iz članka: odaberi dvije boje i oboji ih, pogodi što će nastati (tvoje predviđanje!), zatim ih stvarno pomiješaj i zabilježi što je nastalo.",
    th: ["1. boja", "2. boja", "Moje predviđanje", "Što je nastalo", "Ime boje"],
    tip: "Pazi, blato! Komplementarni parovi - crvena + zelena, plava + narančasta, žuta + ljubičasta - ponište se u smeđu. Isprobaj jedan!",
    more: "Igraj online verziju:",
    moreUrl: `${HOST}/hr/alati/mijesanje-boja`,
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Outline circle with the color's name inside (child colors it in). */
function namedCircle(key, lang) {
  const c = COLORS[key];
  return `<div class="pot" style="border-color:${c.hex}"><span style="color:${c.hex}">${esc(c.name[lang])}</span></div>`;
}

function blankCircle(mark = "?") {
  return `<div class="pot blank"><span>${mark}</span></div>`;
}

function equationRow(pair, lang) {
  return `<div class="eq">${namedCircle(pair[0], lang)}<span class="op">+</span>${namedCircle(pair[1], lang)}<span class="op">=</span>${blankCircle()}</div>`;
}

/** 6-wedge color wheel as inline SVG (viewBox 200x200, wedge radius 80). */
function wheelSvg(lang) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const labelR = 54;
  const pt = (deg, rad) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [
      Math.round((cx + rad * Math.cos(a)) * 100) / 100,
      Math.round((cy + rad * Math.sin(a)) * 100) / 100,
    ];
  };
  const parts = WHEEL.map((key, i) => {
    const a0 = i * 60 - 30;
    const a1 = i * 60 + 30;
    const [x0, y0] = pt(a0, r);
    const [x1, y1] = pt(a1, r);
    const [lx, ly] = pt(i * 60, labelR);
    const c = COLORS[key];
    const primary = PRIMARIES.has(key);
    const label = primary
      ? `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="${c.hex}">${esc(c.name[lang])}</text>`
      : `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="#9b97a8">?</text>`;
    return (
      `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z" fill="#FFFDF7" stroke="#c7c0b0" stroke-width="1.2"/>` +
      label
    );
  });
  return `<svg viewBox="0 0 200 200" width="82mm" height="82mm">${parts.join("")}</svg>`;
}

function ladder(t) {
  const boxes = Array.from({ length: 5 }, () => `<div class="lbox"></div>`).join("");
  return `
  <div class="ladder">${boxes}</div>
  <div class="ladder-labels"><span>◀ ${esc(t.black)}</span><span>${esc(t.pure)}</span><span>${esc(t.white)} ▶</span></div>`;
}

function logTable(t) {
  const header = `<tr>${t.th.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>`;
  const row = `<tr>
    <td>${blankCircle("")}</td><td>${blankCircle("")}</td>
    <td>${blankCircle("?")}</td><td>${blankCircle("!")}</td>
    <td><div class="writein"></div></td>
  </tr>`;
  return `<table class="log">${header}${Array.from({ length: 6 }, () => row).join("")}</table>`;
}

function buildHtml(lang) {
  const t = copy[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 13mm 16mm; }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: #FB6F52; font-weight: 700; }
    h1 { font-size: 24pt; font-weight: 800; color: #2c2940; margin: 2mm 0 1.5mm; }
    h2 { font-size: 15pt; font-weight: 800; color: #FB6F52; margin: 4mm 0 1mm; }
    .sub { font-size: 10.5pt; line-height: 1.4; color: #56536b; max-width: 176mm; margin: 0 0 4mm; }
    .pot { width: 16mm; height: 16mm; border-radius: 50%; border: 0.6mm solid #c7c0b0; background: #FFFDF7;
           display: flex; align-items: center; justify-content: center; }
    .pot span { font-size: 7pt; font-weight: 700; }
    .pot.blank { border-style: dashed; }
    .pot.blank span { color: #9b97a8; font-size: 11pt; }
    .eq { display: flex; align-items: center; gap: 2.5mm; }
    .eq .op { font-size: 13pt; font-weight: 800; color: #9b97a8; }
    .eq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 10mm; margin: 0 0 2mm; }
    .duo { display: flex; align-items: flex-start; gap: 8mm; }
    .duo-col { flex: 1; }
    .wheel-wrap { text-align: center; }
    .ladder { display: flex; gap: 2mm; margin: 2mm 0 1.5mm; }
    .lbox { width: 14mm; height: 14mm; border-radius: 2mm; border: 0.5mm dashed #c7c0b0; background: #FFFDF7; }
    .lbox:nth-child(3) { border-style: solid; }
    .ladder-labels { display: flex; justify-content: space-between; width: 78mm; font-size: 8pt; color: #56536b; font-weight: 700; }
    table.log { border-collapse: separate; border-spacing: 0 3mm; margin-top: 2mm; }
    table.log th { font-size: 9.5pt; color: #56536b; text-align: center; padding: 0 4mm; }
    table.log td { text-align: center; padding: 0 4mm; vertical-align: middle; }
    .writein { width: 38mm; border-bottom: 0.4mm solid #9b97a8; height: 9mm; }
    .tip { margin-top: 5mm; border: 0.5mm solid #EF8A2B; border-radius: 3mm; background: #FFFDF7;
           padding: 3.5mm 5mm; font-size: 10pt; line-height: 1.4; color: #56536b; max-width: 176mm; }
    .foot { position: absolute; bottom: 9mm; left: 16mm; right: 16mm; font-size: 9pt; color: #b3ad9c; text-align: center; }
    .more { font-weight: 700; color: #7a778c; }
  </style></head><body>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.title)}</h1>
    <p class="sub">${esc(t.subtitle)}</p>
    <div class="eq-grid">${EQUATIONS.map((p) => equationRow(p, lang)).join("")}</div>
    <div class="duo">
      <div class="duo-col wheel-wrap">
        <h2>${esc(t.wheelTitle)}</h2>
        <p class="sub">${esc(t.wheelSub)}</p>
        ${wheelSvg(lang)}
      </div>
      <div class="duo-col">
        <h2>${esc(t.ladderTitle)}</h2>
        <p class="sub">${esc(t.ladderSub)}</p>
        ${ladder(t)}
      </div>
    </div>
    <div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>
  </div>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.page2Title)}</h1>
    <p class="sub">${esc(t.page2Sub)}</p>
    ${logTable(t)}
    <div class="tip">${esc(t.tip)}</div>
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
  const htmlPath = path.join(os.tmpdir(), `color-pack-${lang}.html`);
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
