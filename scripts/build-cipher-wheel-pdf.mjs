#!/usr/bin/env node
/**
 * build-cipher-wheel-pdf.mjs — renders the printable Caesar cipher wheel
 * template to PDF for each language (EN: 26-letter alphabet, HR: the full
 * 30-letter gajica incl. DŽ/LJ/NJ digraphs — same alphabets as the online
 * tool in src/components/tools/CaesarCipher.tsx, so the paper wheel and the
 * web encoder always agree).
 *
 * Pipeline (same as build-summer-pdf.mjs): print-styled standalone HTML →
 * headless Google Chrome `--print-to-pdf` → public/downloads/.
 *
 * Usage:  node scripts/build-cipher-wheel-pdf.mjs        (both languages)
 *         node scripts/build-cipher-wheel-pdf.mjs en     (one language)
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

// Must match ALPHABETS in src/components/tools/CaesarCipher.tsx.
const ALPHABETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  hr: "A B C Č Ć D DŽ Đ E F G H I J K L LJ M N NJ O P R S Š T U V Z Ž".split(" "),
};

const PDF_FILE = {
  en: "downloads/cipher-wheel-template.pdf",
  hr: "downloads/kotac-za-sifriranje-predlozak.pdf",
};

const copy = {
  en: {
    brand: "STEM Little Explorers",
    title: "Cipher Wheel",
    subtitle: "Printable template — cut out both wheels and write secret codes!",
    outerLabel: "Wheel 1 of 2 — the OUTER wheel (cipher letters)",
    innerLabel: "Wheel 2 of 2 — the INNER wheel (message letters)",
    stepsTitle: "How to put it together",
    steps: [
      "Print both pages (thicker paper works best) and cut out both wheels along the outer circles.",
      "Glue each wheel onto cardboard and trim, so they last longer.",
      "Place the small wheel on top of the big one and push a split pin (paper fastener) through both center dots.",
      "Spin the small wheel — your cipher wheel is ready!",
    ],
    useTitle: "How to write a secret code",
    use: [
      "Pick a secret key number with your friend, for example 3.",
      "Turn the inner wheel so its A points at the outer letter with the little number 3 (that's D).",
      "To encode: find each letter of your message on the INNER wheel and write down the OUTER letter above it.",
      "To decode: find each letter on the OUTER wheel and write down the INNER letter under it.",
    ],
    example: "Example with key 3: HELLO becomes KHOOR.",
    more: "Full guide + online cipher:",
    moreUrl: `${HOST}/en/how-to-make-cipher-wheel`,
    scissors: "✂ cut along the outer edge",
    pin: "pierce here",
  },
  hr: {
    brand: "STEM Little Explorers",
    title: "Kotač za šifriranje",
    subtitle:
      "Predložak za ispis — izrežite oba kotača i pišite tajne poruke! S punom hrvatskom abecedom od 30 slova (uključujući DŽ, LJ i NJ).",
    outerLabel: "Kotač 1 od 2 — VANJSKI kotač (šifrirana slova)",
    innerLabel: "Kotač 2 od 2 — UNUTARNJI kotač (slova poruke)",
    stepsTitle: "Kako ga sastaviti",
    steps: [
      "Ispišite obje stranice (najbolje na deblji papir) i izrežite oba kotača po vanjskim kružnicama.",
      "Zalijepite kotače na karton i obrežite, tako će dulje trajati.",
      "Stavite mali kotač na veliki i probušite rascjepku (spajalicu za papir) kroz obje središnje točke.",
      "Zavrtite mali kotač — vaš kotač za šifriranje je spreman!",
    ],
    useTitle: "Kako napisati tajnu poruku",
    use: [
      "S prijateljem dogovorite tajni ključ, na primjer 3.",
      "Okrenite unutarnji kotač tako da njegovo A pokazuje na vanjsko slovo s brojčićem 3 (to je Č).",
      "Za šifriranje: pronađite svako slovo poruke na UNUTARNJEM kotaču i zapišite VANJSKO slovo iznad njega.",
      "Za dešifriranje: pronađite slovo na VANJSKOM kotaču i zapišite UNUTARNJE slovo ispod njega.",
    ],
    example: "Primjer s ključem 3: TAJNA postaje ZČLJPČ.",
    more: "Cijeli vodič + online šifra:",
    moreUrl: `${HOST}/hr/kako-napraviti-kotac-za-sifriranje`,
    scissors: "✂ izrežite po vanjskom rubu",
    pin: "probušite ovdje",
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * One cut-out wheel as SVG. All radii in mm (the SVG uses a 1 unit = 1 mm
 * viewBox). Letters sit upright-along-the-radius: each glyph is rotated so
 * its baseline is tangent to the circle, the standard cipher-wheel layout.
 */
function wheelSvg({ letters, radius, letterR, numberR, fontMm, color, pinLabel }) {
  const n = letters.length;
  const size = radius * 2 + 6; // 3mm bleed for the cut line + shadow
  const c = size / 2;
  const step = 360 / n;

  let inner = "";

  // Sector divider lines (from just inside the letter ring to the cut edge).
  for (let i = 0; i < n; i++) {
    const a = ((i - 0.5) * step * Math.PI) / 180;
    const r1 = letterR - fontMm * 0.9;
    inner += `<line x1="${c + r1 * Math.sin(a)}" y1="${c - r1 * Math.cos(a)}" x2="${c + radius * Math.sin(a)}" y2="${c - radius * Math.cos(a)}" stroke="#d8d2c4" stroke-width="0.25"/>`;
  }

  // Letters (and optional key numbers below them on the outer wheel).
  for (let i = 0; i < n; i++) {
    const angle = i * step;
    inner += `<g transform="rotate(${angle} ${c} ${c})">
      <text x="${c}" y="${c - letterR}" text-anchor="middle" dominant-baseline="central"
        font-size="${fontMm}" font-weight="700" fill="#2c2940" font-family="Trebuchet MS, Segoe UI, sans-serif">${esc(letters[i])}</text>
      ${
        numberR
          ? `<text x="${c}" y="${c - numberR}" text-anchor="middle" dominant-baseline="central"
        font-size="${fontMm * 0.42}" fill="#9b97a8" font-family="Trebuchet MS, Segoe UI, sans-serif">${i}</text>`
          : ""
      }
    </g>`;
  }

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}mm" height="${size}mm" role="img">
    <circle cx="${c}" cy="${c}" r="${radius}" fill="#FFFDF7" stroke="${color}" stroke-width="0.9"/>
    <circle cx="${c}" cy="${c}" r="${letterR - fontMm * 0.9}" fill="none" stroke="#d8d2c4" stroke-width="0.25"/>
    ${inner}
    <circle cx="${c}" cy="${c}" r="1.4" fill="#2c2940"/>
    <text x="${c}" y="${c + 5}" text-anchor="middle" font-size="2.6" fill="#9b97a8" font-family="Trebuchet MS, Segoe UI, sans-serif">${esc(pinLabel)}</text>
  </svg>`;
}

function buildHtml(lang) {
  const t = copy[lang];
  const letters = ALPHABETS[lang];
  // The HR wheel has 30 sectors and two-character digraphs — a slightly
  // smaller font keeps DŽ/LJ/NJ inside their sector.
  const fontOuter = lang === "hr" ? 5.2 : 6;
  const fontInner = lang === "hr" ? 4.4 : 5;

  const outer = wheelSvg({
    letters,
    radius: 76,
    letterR: 68,
    numberR: 58, // key numbers stay visible outside the Ø105mm inner wheel
    fontMm: fontOuter,
    color: "#FB6F52",
    pinLabel: t.pin,
  });
  const inner = wheelSvg({
    letters,
    radius: 52,
    letterR: 45,
    numberR: null,
    fontMm: fontInner,
    color: "#14A098",
    pinLabel: t.pin,
  });

  const list = (items) =>
    items.map((s) => `<li>${esc(s)}</li>`).join("");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 14mm 18mm; }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: #FB6F52; font-weight: 700; }
    h1 { font-size: 26pt; font-weight: 800; color: #2c2940; margin: 2mm 0 1.5mm; }
    .sub { font-size: 11pt; line-height: 1.45; color: #56536b; max-width: 165mm; margin: 0 0 4mm; }
    .wheel-label { font-size: 10.5pt; font-weight: 700; color: #2c2940; margin: 2mm 0 1mm; }
    .scissors { font-size: 9pt; color: #9b97a8; margin: 0 0 2mm; }
    .wheel-wrap { text-align: center; }
    h2 { font-size: 14pt; font-weight: 800; color: #FB6F52; margin: 5mm 0 2mm; }
    ol { margin: 0; padding-left: 6mm; font-size: 10.5pt; line-height: 1.55; color: #4a4760; }
    li { margin-bottom: 1.2mm; }
    .example { margin-top: 3mm; background: #FFEFE8; border-radius: 3mm; padding: 3mm 5mm; font-size: 10.5pt; font-weight: 700; color: #2c2940; display: inline-block; }
    .foot { position: absolute; bottom: 9mm; left: 18mm; right: 18mm; font-size: 9pt; color: #b3ad9c; text-align: center; }
    .more { font-weight: 700; color: #7a778c; }
  </style></head><body>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <h1>${esc(t.title)}</h1>
    <p class="sub">${esc(t.subtitle)}</p>
    <div class="wheel-label">${esc(t.outerLabel)}</div>
    <div class="scissors">${esc(t.scissors)}</div>
    <div class="wheel-wrap">${outer}</div>
    <div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>
  </div>
  <div class="page">
    <div class="brand">${esc(t.brand)}</div>
    <div class="wheel-label">${esc(t.innerLabel)}</div>
    <div class="scissors">${esc(t.scissors)}</div>
    <div class="wheel-wrap">${inner}</div>
    <h2>${esc(t.stepsTitle)}</h2>
    <ol>${list(t.steps)}</ol>
    <h2>${esc(t.useTitle)}</h2>
    <ol>${list(t.use)}</ol>
    <div class="example">${esc(t.example)}</div>
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
  const htmlPath = path.join(os.tmpdir(), `cipher-wheel-${lang}.html`);
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
