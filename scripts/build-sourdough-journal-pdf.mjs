#!/usr/bin/env node
/**
 * build-sourdough-journal-pdf.mjs — renders the printable "My sourdough
 * starter journal", a 7-day observation log for the sourdough-starter article,
 * to PDF for each language. Two A4 pages:
 *   1. Intro + a prediction box + day cards for Days 1–4.
 *   2. Day cards for Days 5–7 (Day 7 is the float test) + a look-back
 *      reflection box (what surprised you, name your starter).
 *
 * Each day card has a little jar to draw the rise line in, checkboxes for
 * "checked / fed", a bubbles scale to circle, a one-word smell line, and a
 * different observation question each day. Outline art on purpose so it prints
 * on any black-and-white printer and the filling-in IS the activity — matching
 * build-color-pack-pdf.mjs / build-pattern-pack-pdf.mjs.
 *
 * Pipeline: print-styled standalone HTML → headless Google Chrome
 * `--print-to-pdf` → public/downloads/.
 *
 * Usage:  node scripts/build-sourdough-journal-pdf.mjs        (both languages)
 *         node scripts/build-sourdough-journal-pdf.mjs en     (one language)
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
  en: "downloads/sourdough-starter-journal.pdf",
  hr: "downloads/dnevnik-kvasca-za-kiselo-tijesto.pdf",
};

const copy = {
  en: {
    brand: "STEM Little Explorers",
    title: "My sourdough starter journal",
    subtitle:
      "Seven days of watching wild yeast come to life. Fill in one card each day: draw how high your starter rose, sniff it, and write down what you notice.",
    page2Sub: "Keep going. Your starter is really waking up now.",
    predTitle: "Before you begin: my prediction",
    predText:
      "What will happen to the flour and water after a week of feeding it every day? Draw or write your guess here, then check on day 7.",
    day: "Day",
    date: "Date:",
    checked: "Checked",
    fed: "Fed",
    bubbles: "Bubbles:",
    bubbleScale: "none · some · lots",
    circle: "(circle one)",
    smell: "Smells like:",
    jarHint: "draw the top",
    startLine: "start",
    floats: "Floats",
    sinks: "Sinks",
    alive: "My starter is alive!",
    questions: [
      "Draw and describe the fresh mix. What does it smell like right now?",
      "Look very closely. Any tiny bubbles yet? What do you think is waking up in the jar?",
      "First feeding! We throw half away, then add flour and water. What changed since yesterday?",
      "How high did it rise after feeding? Mark the top line in the jar.",
      "Give it a good sniff. Is the smell getting more sour? Describe it in a few words.",
      "How many hours until it doubled today? Is it getting faster than before?",
      "Float test! Drop a spoonful in water. Did it float or sink? Is your starter ready?",
    ],
    reflectTitle: "Look back at your week",
    reflectQ1: "What surprised you the most?",
    reflectQ2: "My starter rose the most on day…",
    nameIt: "Name your starter:",
    more: "Full activity and the science behind it:",
    moreUrl: `${HOST}/en/how-to-make-sourdough-starter`,
  },
  hr: {
    brand: "STEM Little Explorers",
    title: "Moj dnevnik kvasca za kiselo tijesto",
    subtitle:
      "Sedam dana promatranja kako divlji kvasac oživljava. Popuni jednu karticu svaki dan: nacrtaj koliko se kvasac digao, pomiriši ga i zapiši što primjećuješ.",
    page2Sub: "Samo nastavi. Tvoj se kvasac sada zaista budi.",
    predTitle: "Prije početka: moje predviđanje",
    predText:
      "Što će se dogoditi s brašnom i vodom nakon tjedan dana svakodnevnog hranjenja? Nacrtaj ili napiši svoju pretpostavku, a onda provjeri 7. dan.",
    day: "Dan",
    date: "Datum:",
    checked: "Pregledano",
    fed: "Nahranjeno",
    bubbles: "Mjehurići:",
    bubbleScale: "nema · nešto · puno",
    circle: "(zaokruži)",
    smell: "Miriše na:",
    jarHint: "nacrtaj vrh",
    startLine: "početak",
    floats: "Pluta",
    sinks: "Tone",
    alive: "Moj kvasac je živ!",
    questions: [
      "Nacrtaj i opiši svježu smjesu. Kako miriše upravo sada?",
      "Pogledaj izbliza. Ima li već sitnih mjehurića? Što misliš da se budi u staklenci?",
      "Prvo hranjenje! Bacamo pola, pa dodajemo brašno i vodu. Što se promijenilo od jučer?",
      "Koliko se digao nakon hranjenja? Označi gornju crtu u staklenci.",
      "Dobro pomiriši. Postaje li miris sve kiseliji? Opiši ga s nekoliko riječi.",
      "Koliko je sati trebalo da se danas udvostruči? Ide li sve brže nego prije?",
      "Test plutanja! Ubaci žličicu u vodu. Je li plutala ili potonula? Je li kvasac spreman?",
    ],
    reflectTitle: "Osvrni se na svoj tjedan",
    reflectQ1: "Što te najviše iznenadilo?",
    reflectQ2: "Kvasac se najviše digao na dan…",
    nameIt: "Daj ime svom kvascu:",
    more: "Cijela aktivnost i znanost iza nje:",
    moreUrl: `${HOST}/hr/kako-napraviti-kvasac-za-kiselo-tijesto`,
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A jar the child draws the rise line into. Dashed coral "start" mark near
 *  the bottom, faint ticks up the side. viewBox 60x92. */
function jarSvg(t) {
  const ticks = [30, 42, 54, 66]
    .map(
      (y) =>
        `<line x1="10" y1="${y}" x2="15" y2="${y}" stroke="#d9d2c4" stroke-width="1"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 60 92" width="15mm" height="23mm" aria-hidden="true">
    <rect x="9" y="18" width="42" height="66" rx="6" fill="#FFFDF7" stroke="#c7c0b0" stroke-width="1.6"/>
    <rect x="7" y="9" width="46" height="10" rx="3.5" fill="#FFFDF7" stroke="#c7c0b0" stroke-width="1.6"/>
    ${ticks}
    <line x1="9" y1="72" x2="51" y2="72" stroke="#FB6F52" stroke-width="1.3" stroke-dasharray="3 2"/>
    <text x="30" y="80" text-anchor="middle" font-size="7" fill="#c99a8f">${esc(t.startLine)}</text>
  </svg>`;
}

const check = `<span class="chk"></span>`;

function dayCard(n, t, { floatTest = false } = {}) {
  const q = t.questions[n - 1];
  const extra = floatTest
    ? `<div class="floatrow">${check}${esc(t.floats)} &nbsp; ${check}${esc(t.sinks)}
       <span class="alive">${esc(t.alive)}</span></div>`
    : "";
  return `<div class="card${floatTest ? " float" : ""}">
    <div class="card-main">
      <div class="chead"><span class="day">${esc(t.day)} ${n}</span><span class="date">${esc(t.date)} __________</span></div>
      <div class="row">${check}${esc(t.checked)} &nbsp;&nbsp; ${check}${esc(t.fed)}</div>
      <div class="row">${esc(t.bubbles)} <b>${esc(t.bubbleScale)}</b> <span class="hint">${esc(t.circle)}</span></div>
      <div class="row">${esc(t.smell)} <span class="wline"></span></div>
      ${extra}
      <div class="q">${esc(q)}</div>
      <div class="qline"></div><div class="qline"></div>
    </div>
    <div class="card-jar">${jarSvg(t)}<div class="jarhint">${esc(t.jarHint)}</div></div>
  </div>`;
}

function buildHtml(lang) {
  const t = copy[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 12mm 15mm; }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: #FB6F52; font-weight: 700; }
    h1 { font-size: 23pt; font-weight: 800; color: #2c2940; margin: 1.5mm 0 1.5mm; }
    .sub { font-size: 10.5pt; line-height: 1.4; color: #56536b; max-width: 180mm; margin: 0 0 3mm; }
    .pred { border: 0.5mm dashed #FB6F52; border-radius: 3mm; background: #FFFDF7; padding: 3mm 5mm; margin: 0 0 4mm; }
    .pred h2 { font-size: 12pt; font-weight: 800; color: #FB6F52; margin: 0 0 1mm; }
    .pred p { font-size: 9.5pt; line-height: 1.4; color: #56536b; margin: 0 0 2mm; }
    .predbox { height: 15mm; border: 0.35mm solid #d9d2c4; border-radius: 2mm; background: #fff; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .card { border: 0.5mm solid #d9d2c4; border-radius: 3mm; background: #FFFDF7; padding: 3mm 3.5mm; display: flex; gap: 2.5mm; }
    .card.float { grid-column: 1 / -1; border-color: #FB6F52; }
    .card-main { flex: 1; min-width: 0; }
    .card-jar { width: 16mm; text-align: center; flex: none; }
    .jarhint { font-size: 6.5pt; color: #b3ad9c; margin-top: 0.5mm; }
    .chead { display: flex; align-items: baseline; justify-content: space-between; }
    .day { font-size: 13pt; font-weight: 800; color: #FB6F52; }
    .date { font-size: 8pt; color: #9b97a8; }
    .row { font-size: 9pt; color: #2c2940; margin: 1.4mm 0; }
    .row b { font-weight: 700; letter-spacing: .3px; }
    .hint { font-size: 7.5pt; color: #b3ad9c; }
    .chk { display: inline-block; width: 3.2mm; height: 3.2mm; border: 0.4mm solid #9b97a8; border-radius: 0.8mm; vertical-align: -0.3mm; margin-right: 1.2mm; }
    .wline { display: inline-block; width: 34mm; border-bottom: 0.35mm solid #c7c0b0; height: 3.6mm; vertical-align: -0.3mm; }
    .q { font-size: 8.7pt; line-height: 1.3; color: #56536b; margin: 1.5mm 0 1.5mm; }
    .qline { border-bottom: 0.35mm solid #c7c0b0; height: 4.4mm; }
    .floatrow { font-size: 9pt; margin: 1.4mm 0; }
    .alive { display: inline-block; margin-left: 3mm; font-weight: 800; color: #FB6F52; }
    .reflect { border: 0.5mm solid #d9d2c4; border-radius: 3mm; background: #FFFDF7; padding: 4mm 5mm; margin-top: 5mm; }
    .reflect h2 { font-size: 13pt; font-weight: 800; color: #FB6F52; margin: 0 0 2mm; }
    .reflect .rq { font-size: 10pt; color: #2c2940; font-weight: 700; margin: 2.5mm 0 1mm; }
    .reflect .rline { border-bottom: 0.35mm solid #c7c0b0; height: 5mm; }
    .nameit { font-size: 10pt; font-weight: 700; color: #2c2940; margin-top: 3mm; }
    .nameit .wline { width: 70mm; }
    .foot { position: absolute; bottom: 8mm; left: 15mm; right: 15mm; font-size: 9pt; color: #b3ad9c; text-align: center; }
    .more { font-weight: 700; color: #7a778c; }
  </style></head><body>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.title)}</h1>
    <p class="sub">${esc(t.subtitle)}</p>
    <div class="pred">
      <h2>${esc(t.predTitle)}</h2>
      <p>${esc(t.predText)}</p>
      <div class="predbox"></div>
    </div>
    <div class="grid">
      ${dayCard(1, t)}${dayCard(2, t)}${dayCard(3, t)}${dayCard(4, t)}
    </div>
    <div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>
  </div>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.title)}</h1>
    <p class="sub">${esc(t.page2Sub)}</p>
    <div class="grid">
      ${dayCard(5, t)}${dayCard(6, t)}${dayCard(7, t, { floatTest: true })}
    </div>
    <div class="reflect">
      <h2>${esc(t.reflectTitle)}</h2>
      <div class="rq">${esc(t.reflectQ1)}</div>
      <div class="rline"></div><div class="rline"></div>
      <div class="rq">${esc(t.reflectQ2)} <span class="wline"></span></div>
      <div class="nameit">${esc(t.nameIt)} <span class="wline"></span></div>
    </div>
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
  const htmlPath = path.join(os.tmpdir(), `sourdough-journal-${lang}.html`);
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
