#!/usr/bin/env node
/**
 * build-summer-pdf.mjs — renders the "Summer of curiosity" e-book to PDF for
 * each language, straight from the shared content module (src/lib/summer-ebook.ts),
 * so the download always matches the on-site landing page.
 *
 * Pipeline: build a print-styled standalone HTML → headless Google Chrome
 * `--print-to-pdf` (renders modern CSS + color emoji faithfully) → public/downloads/.
 *
 * Usage:  node scripts/build-summer-pdf.mjs            (both languages)
 *         node scripts/build-summer-pdf.mjs en         (one language)
 *
 * Requires Google Chrome installed. Node 22.18+ strips the TS types on import.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  summerCopy,
  summerSections,
  summerTips,
  rainyDayActivities,
  SUMMER_PDF,
  SUMMER_TIPS_COLOR,
} from "../src/lib/summer-ebook.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://stemlittleexplorers.com";
const HOST = "stemlittleexplorers.com";

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const langArg = process.argv[2];
const langs = langArg ? [langArg] : ["en", "hr"];

// Strings that only live in the PDF (cover, contents, bingo, back cover).
const pdf = {
  en: {
    coverAge: "activities for ages 1–12",
    welcome: "Welcome, summer explorers!",
    welcomeBody:
      "Long days, no homework, and a whole world to poke at. Inside are some of our favourite hands-on STEM activities — most use things you already have in the kitchen. Pick by your child's age, head outside, and let them get curious (and a little messy).",
    contents: "What's inside",
    findAt: "Full guide:",
    bingoTitle: "Summer science bingo",
    bingoBody:
      "Try one a day. Fill a row — or the whole card — for a proper summer of discovery!",
    backTitle: "Keep exploring all summer",
    backBody:
      "This is just a taste. Find every experiment, plus new ones each week, on the site.",
    tipsKicker: "for grown-ups",
  },
  hr: {
    coverAge: "aktivnosti za dob 1–12",
    welcome: "Dobrodošli, ljetni istraživači!",
    welcomeBody:
      "Dugi dani, nema zadaće i cijeli svijet za istraživati. Unutra su neke od naših najdražih STEM aktivnosti — većina koristi stvari koje već imate u kuhinji. Odaberite prema dobi djeteta, izađite van i pustite ih da budu znatiželjni (i pomalo neuredni).",
    contents: "Sadržaj",
    findAt: "Cijeli vodič:",
    bingoTitle: "Ljetni znanstveni bingo",
    bingoBody:
      "Pokušajte jednu na dan. Ispunite red — ili cijelu karticu — za pravo ljeto otkrića!",
    backTitle: "Istražujte cijelo ljeto",
    backBody:
      "Ovo je tek djelić. Sve pokuse, i nove svaki tjedan, pronađite na stranici.",
    tipsKicker: "za odrasle",
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Embed a cover image as a base64 data URI so the PDF is fully self-contained.
// Covers are downscaled to a print thumbnail (longest side 760px, JPEG) — the
// images print at ~44mm, so full-size sources just bloat the file. Cached so a
// cover reused on the rainy-day page isn't re-encoded.
const _imgCache = new Map();
function dataUri(coverPath) {
  if (!coverPath) return null;
  if (_imgCache.has(coverPath)) return _imgCache.get(coverPath);
  const f = path.join(ROOT, "public", coverPath);
  if (!fs.existsSync(f)) {
    _imgCache.set(coverPath, null);
    return null;
  }
  let uri;
  try {
    const tmp = path.join(os.tmpdir(), `seb-${Buffer.from(coverPath).toString("hex").slice(0, 48)}.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", "760", f, "--out", tmp], { stdio: "ignore" });
    uri = `data:image/jpeg;base64,${fs.readFileSync(tmp).toString("base64")}`;
  } catch {
    const ext = path.extname(f).slice(1).toLowerCase();
    const mime = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    uri = `data:${mime};base64,${fs.readFileSync(f).toString("base64")}`;
  }
  _imgCache.set(coverPath, uri);
  return uri;
}

// 3-dot mess rating: filled (section colour) up to `mess`, faded after.
function messDots(mess, color) {
  let out = "";
  for (let i = 1; i <= 3; i++)
    out += `<span class="dot" style="background:${i <= mess ? color : "#dcd6c8"}"></span>`;
  return out;
}

const sun = (size, cx, color = "#FFD166") => `
  <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <g stroke="${color}" stroke-width="${size * 0.05}" stroke-linecap="round">
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((a) => {
          const r1 = size * 0.4,
            r2 = size * 0.48,
            c = size / 2,
            rad = (a * Math.PI) / 180;
          return `<line x1="${c + r1 * Math.cos(rad)}" y1="${c + r1 * Math.sin(rad)}" x2="${c + r2 * Math.cos(rad)}" y2="${c + r2 * Math.sin(rad)}"/>`;
        })
        .join("")}
    </g>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.24}" fill="${color}"/>
  </svg>`;

function buildHtml(lang) {
  const c = summerCopy[lang];
  const p = pdf[lang];

  const coverPage = `
    <div class="page cover">
      <div class="sun-tr">${sun(220, 110)}</div>
      <div class="cover-inner">
        <div class="brand">STEM Little Explorers</div>
        <div class="cover-title">${esc(c.title)}</div>
        <div class="cover-sub">${esc(c.subtitle)}</div>
        <div class="cover-pill">${esc(p.coverAge)}</div>
      </div>
      <svg class="waves" viewBox="0 0 800 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C 140 76, 260 76, 400 40 S 660 4, 800 40 L800 80 L0 80 Z" fill="#FFF8EE"/>
      </svg>
    </div>`;

  const welcomePage = `
    <div class="page plain">
      <div class="welcome-emoji">🌞</div>
      <h1 class="plain-title">${esc(p.welcome)}</h1>
      <p class="plain-body">${esc(p.welcomeBody)}</p>
      <h2 class="contents-h">${esc(p.contents)}</h2>
      <div class="contents">
        ${summerSections
          .map(
            (s) =>
              `<div class="toc-row"><span class="toc-dot" style="background:${s.color}">${s.icon}</span><span class="toc-name">${esc(s.title[lang])}</span><span class="toc-age">${esc(s.age[lang])}</span></div>`,
          )
          .join("")}
        <div class="toc-row"><span class="toc-dot" style="background:${SUMMER_TIPS_COLOR}">🌞</span><span class="toc-name">${esc(c.tipsTitle)}</span><span class="toc-age">${esc(p.tipsKicker)}</span></div>
        <div class="toc-row"><span class="toc-dot" style="background:#8E54B5">🎯</span><span class="toc-name">${esc(p.bingoTitle)}</span><span class="toc-age"></span></div>
      </div>
    </div>`;

  const sectionPages = summerSections
    .map(
      (s) => `
    <div class="page section">
      <div class="band" style="background:${s.color}">
        <span class="band-emoji">${s.icon}</span>
        <div>
          <span class="band-pill">${esc(s.age[lang])}</span>
          <div class="band-title">${esc(s.title[lang])}</div>
        </div>
      </div>
      <div class="sec-body">
        ${s.activities
          .map((a) => {
            const img = dataUri(a.cover[lang]);
            return `
          <div class="act">
            ${
              img
                ? `<img class="act-photo" src="${img}" alt="">`
                : `<div class="act-photo fallback" style="background:${s.color}1f">${a.icon}</div>`
            }
            <div class="act-text">
              <div class="act-name">${esc(a.name[lang])}</div>
              <div class="act-meta">
                <span>⏱ ${esc(a.time[lang])}</span>
                <span class="mess"><span class="mess-label">${esc(c.messLabel)}</span> ${messDots(a.mess, s.color)}</span>
              </div>
              <div class="act-blurb">${esc(a.blurb[lang])}</div>
              <div class="act-need"><b>${esc(c.youllNeed)}:</b> ${esc(a.materials[lang])}</div>
              <a class="act-link" style="color:${s.color}" href="${BASE}/${lang}/${a.slug[lang]}">${esc(p.findAt)} ${HOST}/${lang}/${a.slug[lang]}</a>
            </div>
          </div>`;
          })
          .join("")}
      </div>
      <div class="foot">${esc(c.title)} · ${HOST}</div>
    </div>`,
    )
    .join("");

  const tipsPage = `
    <div class="page section">
      <div class="band" style="background:${SUMMER_TIPS_COLOR}">
        <span class="band-emoji">🌞</span>
        <div>
          <span class="band-pill">${esc(p.tipsKicker)}</span>
          <div class="band-title">${esc(c.tipsTitle)}</div>
        </div>
      </div>
      <div class="sec-body">
        ${summerTips
          .map(
            (tip) => `
          <div class="act">
            <span class="act-emoji" style="background:${SUMMER_TIPS_COLOR}1f">${tip.icon}</span>
            <div class="act-text">
              <div class="act-name">${esc(tip.title[lang])}</div>
              <div class="act-blurb">${esc(tip.body[lang])}</div>
            </div>
          </div>`,
          )
          .join("")}
      </div>
      <div class="foot">${esc(c.title)} · ${HOST}</div>
    </div>`;

  const allActivities = summerSections.flatMap((s) =>
    s.activities.map((a) => ({ ...a, color: s.color })),
  );
  const bingoPage = `
    <div class="page plain bingo">
      <div class="bingo-emoji">🎯</div>
      <h1 class="plain-title">${esc(p.bingoTitle)}</h1>
      <p class="plain-body">${esc(p.bingoBody)}</p>
      <div class="bingo-grid">
        ${allActivities
          .map(
            (a) => `
          <div class="bingo-cell">
            <span class="bingo-icon" style="background:${a.color}1f">${a.icon}</span>
            <span class="bingo-name">${esc(a.name[lang])}</span>
            <span class="bingo-check" style="border-color:${a.color}"></span>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;

  const backPage = `
    <div class="page back">
      <div class="sun-c">${sun(180, 90, "#FFD166")}</div>
      <div class="back-title">${esc(p.backTitle)}</div>
      <div class="back-body">${esc(p.backBody)}</div>
      <a class="back-btn" href="${BASE}/${lang}/activities">${esc(c.ctaButton)} ↗</a>
      <div class="back-url">${HOST}</div>
    </div>`;

  const rainyPage = `
    <div class="page section">
      <div class="band" style="background:#3FA7D6">
        <span class="band-emoji">🌧️</span>
        <div>
          <span class="band-pill">${esc(c.rainyKicker)}</span>
          <div class="band-title">${esc(c.rainyTitle)}</div>
        </div>
      </div>
      <div class="sec-body">
        <p class="rainy-body">${esc(c.rainyBody)}</p>
        <div class="rainy-grid">
          ${rainyDayActivities
            .map((a) => {
              const img = dataUri(a.cover[lang]);
              return `<div class="rainy-cell">${
                img
                  ? `<img class="rainy-img" src="${img}" alt="">`
                  : `<div class="rainy-img fallback">${a.icon}</div>`
              }<div class="rainy-name">${esc(a.name[lang])}</div></div>`;
            })
            .join("")}
        </div>
      </div>
      <div class="foot">${esc(c.title)} · ${HOST}</div>
    </div>`;

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; }
    .page:last-child { page-break-after: auto; }

    .cover { background: #FB6F52; color: #fff; }
    .sun-tr { position: absolute; top: -34mm; right: -28mm; }
    .cover-inner { position: absolute; top: 78mm; left: 22mm; right: 22mm; }
    .brand { font-size: 13pt; letter-spacing: .5px; color: #FFE3D6; margin-bottom: 12mm; }
    .cover-title { font-size: 52pt; font-weight: 800; line-height: 1.02; margin-bottom: 8mm; }
    .cover-sub { font-size: 16pt; line-height: 1.5; color: #FFEAE0; max-width: 150mm; }
    .cover-pill { display: inline-block; margin-top: 12mm; background: rgba(255,255,255,.22); color: #fff; font-size: 12pt; padding: 4mm 9mm; border-radius: 30px; }
    .waves { position: absolute; bottom: 0; left: 0; width: 100%; height: 22mm; display: block; }

    .plain { padding: 26mm 24mm; }
    .welcome-emoji, .bingo-emoji { font-size: 34pt; }
    .plain-title { font-size: 30pt; font-weight: 800; color: #FB6F52; margin: 4mm 0 6mm; }
    .plain-body { font-size: 13.5pt; line-height: 1.6; color: #4a4760; max-width: 160mm; }
    .contents-h { font-size: 16pt; color: #2c2940; margin: 14mm 0 6mm; }
    .toc-row { display: flex; align-items: center; gap: 5mm; padding: 4mm 0; border-bottom: 0.4mm solid #eadfce; }
    .toc-dot { width: 11mm; height: 11mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15pt; color: #fff; flex: none; }
    .toc-name { font-size: 13pt; font-weight: 700; color: #2c2940; flex: 1; }
    .toc-age { font-size: 10.5pt; color: #8a8699; }

    .band { display: flex; align-items: center; gap: 6mm; padding: 14mm 20mm; color: #fff; }
    .band-emoji { font-size: 26pt; }
    .band-pill { display: inline-block; background: rgba(255,255,255,.25); font-size: 10.5pt; font-weight: 700; padding: 2mm 6mm; border-radius: 30px; }
    .band-title { font-size: 21pt; font-weight: 800; margin-top: 3mm; line-height: 1.15; }
    .sec-body { padding: 6mm 20mm; }
    .act { display: flex; gap: 6mm; padding: 4.5mm 0; border-bottom: 0.4mm solid #eadfce; }
    .act:last-child { border-bottom: none; }
    .act-photo { width: 44mm; height: 31mm; border-radius: 3mm; object-fit: cover; flex: none; }
    .act-photo.fallback { display: flex; align-items: center; justify-content: center; font-size: 24pt; }
    .act-emoji { width: 13mm; height: 13mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15pt; flex: none; margin-top: 1mm; }
    .act-text { flex: 1; }
    .act-name { font-size: 14.5pt; font-weight: 800; color: #2c2940; }
    .act-meta { display: flex; gap: 6mm; align-items: center; font-size: 10pt; color: #7a778c; margin: 1.5mm 0; }
    .act-meta .mess { display: inline-flex; align-items: center; gap: 1.6mm; }
    .act-meta .mess-label { color: #9b97a8; }
    .dot { width: 2.6mm; height: 2.6mm; border-radius: 50%; display: inline-block; }
    .act-blurb { font-size: 11.5pt; line-height: 1.4; color: #56536b; margin-bottom: 1.5mm; }
    .act-need { font-size: 10.5pt; line-height: 1.4; color: #6b6880; margin-bottom: 1.5mm; }
    .act-need b { color: #2c2940; font-weight: 800; }
    .act-link { font-size: 10pt; font-weight: 700; text-decoration: none; }
    .rainy-body { font-size: 13pt; line-height: 1.55; color: #4a4760; margin: 0 0 8mm; }
    .rainy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
    .rainy-cell { text-align: center; }
    .rainy-img { width: 100%; height: 34mm; object-fit: cover; border-radius: 3mm; display: block; }
    .rainy-img.fallback { display: flex; align-items: center; justify-content: center; font-size: 26pt; background: #E1F0FA; }
    .rainy-name { font-size: 10.5pt; font-weight: 700; color: #2c2940; margin-top: 2.5mm; line-height: 1.2; }
    .foot { position: absolute; bottom: 12mm; left: 20mm; right: 20mm; font-size: 9.5pt; color: #b3ad9c; text-align: center; }

    .bingo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; margin-top: 10mm; }
    .bingo-cell { border: 0.5mm solid #eadfce; border-radius: 4mm; padding: 5mm 3mm; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2.5mm; min-height: 40mm; justify-content: center; }
    .bingo-icon { width: 13mm; height: 13mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16pt; }
    .bingo-name { font-size: 9.5pt; font-weight: 700; color: #2c2940; line-height: 1.25; }
    .bingo-check { width: 7mm; height: 7mm; border: 0.6mm solid; border-radius: 50%; margin-top: 1mm; }

    .back { background: #118AB2; color: #fff; text-align: center; padding: 60mm 24mm; }
    .sun-c { display: flex; justify-content: center; margin-bottom: 10mm; }
    .back-title { font-size: 30pt; font-weight: 800; margin-bottom: 6mm; }
    .back-body { font-size: 14pt; line-height: 1.6; color: #D5EEF6; max-width: 150mm; margin: 0 auto 12mm; }
    .back-btn { display: inline-block; background: #FFD166; color: #7a4a2a; font-size: 13pt; font-weight: 800; text-decoration: none; padding: 5mm 12mm; border-radius: 30px; }
    .back-url { margin-top: 12mm; font-size: 12pt; color: #BFE6F2; }
  </style></head><body>
  ${coverPage}${welcomePage}${sectionPages}${rainyPage}${tipsPage}${bingoPage}${backPage}
  </body></html>`;
}

if (!fs.existsSync(CHROME)) {
  console.error(`Chrome not found at: ${CHROME}\nSet CHROME_PATH to your Chrome binary.`);
  process.exit(1);
}

for (const lang of langs) {
  if (!SUMMER_PDF[lang]) {
    console.error(`Unknown language: ${lang}`);
    continue;
  }
  const html = buildHtml(lang);
  const htmlPath = path.join(os.tmpdir(), `summer-ebook-${lang}.html`);
  fs.writeFileSync(htmlPath, html, "utf8");

  const outPath = path.join(ROOT, "public", SUMMER_PDF[lang]);
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
