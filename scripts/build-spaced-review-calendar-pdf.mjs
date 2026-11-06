#!/usr/bin/env node
/**
 * Build the one-page "Review calendar" printable (Mind Explorers palette,
 * A4 landscape) in English and Croatian. Goes with the spaced-practice-for-kids
 * article.
 *
 * Usage: node scripts/build-spaced-review-calendar-pdf.mjs      (both languages)
 *        node scripts/build-spaced-review-calendar-pdf.mjs en   (one language)
 *
 * Print-styled HTML is rendered through headless Chrome to public/downloads/.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HOST = "stemlittleexplorers.com";
const requestedLang = process.argv[2];
const languages = requestedLang ? [requestedLang] : ["en", "hr"];

const PDF_FILE = {
  en: "spaced-review-calendar.pdf",
  hr: "kalendar-ponavljanja.pdf",
};

const ROWS = 8;

const copy = {
  en: {
    brand: "Mind Explorers · STEM Little Explorers",
    title: "My Review Calendar",
    subtitle: "Learn it once, then come back to it four times. Each time: close the book, try to remember, then check.",
    example: "Example: Times table of 7, learned on 3 Nov → reviews on 4 Nov, 6 Nov, 10 Nov and 17 Nov.",
    cols: ["What I learned", "Learned on", "Next day", "In 3 days", "In a week", "In 2 weeks"],
    hints: ["", "", "+1 day", "+3 days", "+7 days", "+14 days"],
    date: "date",
    legendTitle: "Tick the gold circle, then circle a face:",
    legend: ["remembered", "partly", "forgot"],
    rule: "Close the book first, then check.",
    forgot: "Forgot? Look again and add an extra review in a day or two.",
    article: `${HOST}/en/spaced-practice-for-kids`,
  },
  hr: {
    brand: "Mind Explorers · STEM Little Explorers",
    title: "Moj kalendar ponavljanja",
    subtitle: "Nauči jednom, a onda se gradivu vrati još četiri puta. Svaki put: zatvori knjigu, pokušaj se sjetiti, pa provjeri.",
    example: "Primjer: tablica množenja sa 7, naučeno 3. 11. → ponavljanja 4. 11., 6. 11., 10. 11. i 17. 11.",
    cols: ["Što sam naučio/la", "Datum", "Sutradan", "Za 3 dana", "Za tjedan dana", "Za 2 tjedna"],
    hints: ["", "", "+1 dan", "+3 dana", "+7 dana", "+14 dana"],
    date: "datum",
    legendTitle: "Označi zlatni kružić, pa zaokruži lice:",
    legend: ["sjetio/la sam se", "djelomično", "zaboravio/la"],
    rule: "Prvo zatvori knjigu, onda provjeri.",
    forgot: "Zaboravljeno? Pogledaj ponovno i dodaj još jedno ponavljanje za dan-dva.",
    article: `${HOST}/hr/rasporedeno-ucenje`,
  },
};

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Outline faces the child circles: remembered (smile), partly (flat), forgot (frown).
const MOUTH = ["M7 13.2 Q11 17 15 13.2", "M7.2 14.4 L14.8 14.4", "M7 15.6 Q11 11.8 15 15.6"];
const face = (i, cls = "face") =>
  `<svg class="${cls}" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.2" fill="#fff" stroke="#9C8C80" stroke-width="1.3"/><circle cx="7.9" cy="8.6" r="1.15" fill="#7A6A60"/><circle cx="14.1" cy="8.6" r="1.15" fill="#7A6A60"/><path d="${MOUTH[i]}" fill="none" stroke="#7A6A60" stroke-width="1.3" stroke-linecap="round"/></svg>`;
const tick = `<svg class="tick" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.2" fill="#FBF3E0" stroke="#C99B3F" stroke-width="1.4"/></svg>`;

function reviewCell(t) {
  return `<td class="rev"><div class="dline"><small>${esc(t.date)}</small><span></span></div><div class="marks">${tick}<span class="faces">${face(0)}${face(1)}${face(2)}</span></div></td>`;
}

function html(lang) {
  const t = copy[lang];
  const head = t.cols
    .map((c, i) => `<th class="c${i}">${esc(c)}${t.hints[i] ? `<small>${esc(t.hints[i])}</small>` : ""}</th>`)
    .join("");
  const rows = Array.from(
    { length: ROWS },
    () => `<tr><td class="what"></td><td class="when"><div class="dline"><span></span></div></td>${Array.from({ length: 4 }, () => reviewCell(t)).join("")}</tr>`,
  ).join("");
  const legend = t.legend.map((label, i) => `<span class="lg">${face(i, "face big")}${esc(label)}</span>`).join("");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(t.title)}</title><style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", Arial, sans-serif; color: #5C4A42; }
    .page { width: 297mm; height: 210mm; position: relative; overflow: hidden; background: #FAF6EE; padding: 9mm 12mm 13mm; }
    .top { display: flex; justify-content: space-between; align-items: flex-end; gap: 8mm; }
    .brand { color: #C99B3F; font-size: 8pt; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; }
    h1 { font-family: Georgia, "Times New Roman", serif; color: #4C3A72; margin: 1mm 0 1mm; font-size: 24pt; line-height: 1.05; }
    .subtitle { margin: 0; font-size: 9.6pt; line-height: 1.35; max-width: 175mm; }
    .example { margin: 1.2mm 0 0; font-size: 8.3pt; color: #8A7A70; font-style: italic; }
    .legend { background: #fff; border: .45mm solid #E5DCCB; border-radius: 3mm; padding: 2.2mm 3.5mm; font-size: 8.5pt; white-space: nowrap; }
    .legend b { display: block; color: #4C3A72; font-size: 8pt; margin-bottom: 1.2mm; }
    .lg { display: inline-flex; align-items: center; gap: 1.3mm; margin-right: 3.5mm; }
    .lg:last-child { margin-right: 0; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 4mm; background: #fff; border: .45mm solid #E5DCCB; border-radius: 3mm; overflow: hidden; table-layout: fixed; }
    th { background: #4C3A72; color: #FAF6EE; text-align: left; padding: 2mm 2.5mm; font-size: 9pt; font-weight: 800; vertical-align: bottom; }
    th small { display: block; font-weight: 600; color: #E8B454; font-size: 7pt; margin-top: .4mm; }
    th.c0 { width: 68mm; } th.c1 { width: 25mm; }
    td { height: 18.2mm; border-bottom: .3mm solid #E5DCCB; border-right: .3mm solid #F0E9DC; padding: 1.6mm 2.2mm; vertical-align: top; }
    tr:last-child td { border-bottom: 0; } td:last-child { border-right: 0; }
    td.rev { background: #FFFDF8; }
    .dline { display: flex; align-items: flex-end; gap: 1.2mm; height: 5mm; }
    .dline small { font-size: 6.5pt; color: #A99C90; }
    .dline span { flex: 1; border-bottom: .3mm dotted #B7A99A; }
    .marks { display: flex; align-items: center; justify-content: space-between; margin-top: 2.2mm; }
    .tick { width: 5.4mm; height: 5.4mm; }
    .faces { display: inline-flex; gap: 1.3mm; }
    .face { width: 5.4mm; height: 5.4mm; }
    .face.big { width: 5mm; height: 5mm; }
    footer { position: absolute; left: 12mm; right: 12mm; bottom: 5mm; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 6mm; font-size: 7.5pt; color: #8A7A70; }
    footer .rule { background: #4C3A72; color: #FAF6EE; font-weight: 800; font-size: 10pt; padding: 1.8mm 5mm; border-radius: 10mm; }
    footer .url { color: #A99C90; font-size: 7pt; }
    footer .forgot { text-align: right; }
  </style></head><body>
    <div class="page">
      <div class="top">
        <div>
          <div class="brand">${esc(t.brand)}</div>
          <h1>${esc(t.title)}</h1>
          <p class="subtitle">${esc(t.subtitle)}</p>
          <p class="example">${esc(t.example)}</p>
        </div>
        <div class="legend"><b>${esc(t.legendTitle)}</b>${legend}</div>
      </div>
      <table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
      <footer><span class="url">${esc(t.article)}</span><span class="rule">${esc(t.rule)}</span><span class="forgot">${esc(t.forgot)}</span></footer>
    </div>
  </body></html>`;
}

if (!fs.existsSync(CHROME)) {
  console.error(`Chrome not found at: ${CHROME}\nSet CHROME_PATH to your Chrome binary.`);
  process.exit(1);
}

for (const lang of languages) {
  if (!copy[lang] || !PDF_FILE[lang]) {
    console.error(`Unknown language: ${lang}`);
    process.exitCode = 1;
    continue;
  }
  const htmlPath = path.join(os.tmpdir(), `spaced-review-calendar-${lang}.html`);
  const outputPath = path.join(ROOT, "public/downloads", PDF_FILE[lang]);
  fs.writeFileSync(htmlPath, html(lang), "utf8");
  console.log(`Rendering ${lang} -> ${path.relative(ROOT, outputPath)} ...`);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=5000",
      `--print-to-pdf=${outputPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  fs.unlinkSync(htmlPath);
  console.log(`  done (${Math.round(fs.statSync(outputPath).size / 1024)} KB)`);
}
