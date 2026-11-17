#!/usr/bin/env node
/**
 * build-multiplication-practice-pdf.mjs — renders the printable multiplication
 * practice pack that goes with how-to-learn-multiplication-tables (HR
 * kako-nauciti-tablicu-mnozenja) and the multiplication visualizer tool:
 *
 *   page 1  a blank 10 × 10 times table to fill in family by family, with the
 *           square facts on the diagonal tinted and three patterns to spot
 *   page 2  see it, flip it, break it apart: dot grids to circle arrays on,
 *           three arrays to split (one worked), doubling chains and a box
 *           to draw and split your own hardest fact
 *   page 3  the 15 target facts left after the shortcuts (the triangle from
 *           the article) plus a "my route" tracker for the hard ones
 *   page 4  mixed practice: facts, missing factors and division, with an
 *           upside-down answer key
 *
 * The pages follow the article's path (see it → flip it → break it apart →
 * retrieve), and the coral/teal split matches the 7 × 8 break-apart figure.
 * The whole pack speaks to the child, so the Croatian copy uses "ti".
 *
 * Pipeline (same as build-clock-face-pdf.mjs): print-styled standalone HTML →
 * headless Google Chrome `--print-to-pdf` → public/downloads/.
 *
 * Usage:  node scripts/build-multiplication-practice-pdf.mjs        (both)
 *         node scripts/build-multiplication-practice-pdf.mjs en     (one)
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
  en: "downloads/multiplication-practice-pack.pdf",
  hr: "downloads/tablica-mnozenja-listovi-za-vjezbu.pdf",
};

const INK = "#2c2940";
const CORAL = "#FB6F52";
const TEAL = "#0F9D94";
const DOT = "#b9b4a6";
const SQUARE_TINT = "#FFE9B8";

// The order the article teaches the families in.
const FAMILY_ORDER = [1, 10, 2, 5, 4, 8, 3, 6, 7, 9];
// The 15 facts left after the shortcuts (article triangle).
const TARGETS = [3, 4, 6, 7, 8];

// Page 4. `a × b = ?`, `? × b = c` / `a × ? = c` (0 marks the blank), `c ÷ b = ?`.
const FACTS = [[3, 4], [6, 7], [8, 4], [7, 7], [3, 8], [6, 6], [4, 7], [8, 8]];
const MISSING = [[0, 6, 24], [8, 0, 56], [0, 7, 42], [6, 0, 48], [4, 0, 16], [0, 3, 18], [8, 0, 24], [0, 8, 32]];
const DIVIDE = [[28, 4], [64, 8], [21, 3], [36, 6], [32, 8], [49, 7], [12, 3], [18, 6]];

const copy = {
  en: {
    brand: "STEM Little Explorers",
    name: "Name",
    p1Title: "My Times Table",
    p1Sub: "Fill it in one family at a time, starting with the easy ones. Tick each family when its row and its column are full.",
    p1Order: "Fill in this order:",
    p1Flip: "Flip trick: when you know 3 × 7, you also know 7 × 3. Write both!",
    p1Squares: "Yellow squares are the square facts, like 6 × 6.",
    spotTitle: "Patterns to spot when it is full",
    spots: [
      "Look at the ×5 column. Which digits do the answers end in?",
      "Look at the ×9 column. Add the two digits of each answer. What do you notice?",
      "Find 24 in the table. How many times does it appear?",
    ],
    p2Title: "See It, Flip It, Break It Apart",
    seeTitle: "1. See it and flip it",
    seeLeft: "Circle 3 rows of 4 dots.",
    seeRight: "Now circle 4 rows of 3 dots.",
    seeAsk: "What changed? What stayed the same?",
    breakTitle: "2. Break it apart",
    breakSub: "A hard fact is two easy facts joined together.",
    breakExample: "Example: 7 rows of 8 are 5 rows and 2 rows.",
    breakLine: "Draw a line under row 5.",
    breakOwn: "Split the 8 rows your own way.",
    doubleTitle: "3. Double, and double again",
    doubleSub: "For ×4, double twice. For ×8, double three times.",
    ownTitle: "4. Your turn",
    ownSub: "Draw your hardest fact as rows of dots. Split it with a line and write the two easy facts.",
    starsTip: "Three stars? That fact is yours now. Pick a new one!",
    p3Title: "My 15 Target Facts",
    p3Sub: "After the shortcuts, only these 15 facts are left. Fill in the answers you know. Circle the ones that still feel hard.",
    routeTitle: "My routes",
    routeSub: "Pick 3 to 5 facts that still feel hard. Write the easier facts that help you, then color a star each day you get it right without counting.",
    colFact: "Fact",
    colRoute: "My route (how I think)",
    colDays: "Day 1 · Day 2 · Day 3",
    routeExample: "5 × 8 + 2 × 8 = 40 + 16",
    p4Title: "Mix It Up",
    p4Sub: "Hide your times table first. If you get stuck, find a route: flip it, double it or break it apart.",
    aTitle: "A. Multiply",
    bTitle: "B. Find the missing number",
    cTitle: "C. Divide",
    family: "One fact family: 7 × 8 = 56, 8 × 7 = 56, 56 ÷ 7 = 8, 56 ÷ 8 = 7. Know one and you know all four.",
    answers: "Answers",
    more: "All 12 shortcuts + interactive visualizer:",
    moreUrl: `${HOST}/en/how-to-learn-multiplication-tables`,
  },
  hr: {
    brand: "STEM Little Explorers",
    name: "Ime",
    p1Title: "Moja tablica množenja",
    p1Sub: "Popunjavaj je skupinu po skupinu i kreni od lakših. Označi skupinu kad joj popuniš i redak i stupac.",
    p1Order: "Popunjavaj ovim redom:",
    p1Flip: "Trik s okretanjem: ako znaš 3 × 7, znaš i 7 × 3. Upiši oba!",
    p1Squares: "Žuta polja su kvadratne činjenice, na primjer 6 × 6.",
    spotTitle: "Uoči uzorke kad je tablica puna",
    spots: [
      "Pogledaj stupac ×5. Kojim znamenkama završavaju rezultati?",
      "Pogledaj stupac ×9. Zbroji dvije znamenke svakog rezultata. Što primjećuješ?",
      "Pronađi 24 u tablici. Koliko se puta pojavljuje?",
    ],
    p2Title: "Vidi, okreni, rastavi",
    seeTitle: "1. Vidi i okreni",
    seeLeft: "Zaokruži 3 retka po 4 točke.",
    seeRight: "Sada zaokruži 4 retka po 3 točke.",
    seeAsk: "Što se promijenilo? Što je ostalo isto?",
    breakTitle: "2. Rastavi",
    breakSub: "Teška činjenica može se rastaviti na dvije lakše činjenice.",
    breakExample: "Primjer: 7 redaka po 8 je 5 redaka i 2 retka.",
    breakLine: "Povuci crtu ispod 5. retka.",
    breakOwn: "Rastavi 8 redaka na svoj način.",
    doubleTitle: "3. Udvostruči, pa opet udvostruči",
    doubleSub: "Za ×4 udvostruči dvaput. Za ×8 udvostruči triput.",
    ownTitle: "4. Sad ti",
    ownSub: "Nacrtaj svoju najtežu činjenicu kao retke točaka. Rastavi je crtom i zapiši dvije lake činjenice.",
    starsTip: "Tri zvjezdice? Ta je činjenica sada tvoja. Odaberi novu!",
    p3Title: "Mojih 15 ciljnih činjenica",
    p3Sub: "Nakon prečaca ostaje samo ovih 15 činjenica. Upiši rezultate koje znaš. Zaokruži one koje su ti još teške.",
    routeTitle: "Moji putevi",
    routeSub: "Odaberi 3 do 5 činjenica koje su ti još teške. Zapiši lakše činjenice koje ti pomažu, a zatim oboji zvjezdicu svaki dan kad točno odgovoriš bez brojanja.",
    colFact: "Činjenica",
    colRoute: "Moj put (kako razmišljam)",
    colDays: "1. dan · 2. dan · 3. dan",
    routeExample: "5 × 8 + 2 × 8 = 40 + 16",
    p4Title: "Sve pomiješano",
    p4Sub: "Najprije sakrij svoju tablicu množenja. Ako zapneš, pronađi put: okreni, udvostruči ili rastavi.",
    aTitle: "A. Pomnoži",
    bTitle: "B. Pronađi broj koji nedostaje",
    cTitle: "C. Podijeli",
    family: "Jedna obitelj činjenica: 7 × 8 = 56, 8 × 7 = 56, 56 ÷ 7 = 8, 56 ÷ 8 = 7. Ako znaš jednu, znaš sve četiri.",
    answers: "Rješenja",
    more: "Svih 12 prečaca + interaktivni vizualizator:",
    moreUrl: `${HOST}/hr/kako-nauciti-tablicu-mnozenja`,
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const BLANK = `<span class="b"></span>`;

/** Page 1: the empty 10 × 10 table. */
function timesTable() {
  let rows = `<tr><th class="corner">×</th>${Array.from({ length: 10 }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr>`;
  for (let r = 1; r <= 10; r++) {
    rows += `<tr><th>${r}</th>${Array.from({ length: 10 }, (_, i) => `<td${i + 1 === r ? ' class="sq"' : ""}></td>`).join("")}</tr>`;
  }
  return `<table class="tt">${rows}</table>`;
}

/**
 * A grid of dots, 1 SVG unit = 1 mm. `split` colours the first `split` rows
 * coral and the rest teal, with a dashed line between them.
 */
function dots(rows, cols, { step = 5, r = 1.25, split = 0, color = DOT } = {}) {
  const w = cols * step;
  const h = rows * step;
  let g = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const fill = split ? (y < split ? CORAL : TEAL) : color;
      g += `<circle cx="${x * step + step / 2}" cy="${y * step + step / 2}" r="${r}" fill="${fill}"/>`;
    }
  }
  if (split) {
    g += `<line x1="0" y1="${split * step}" x2="${w}" y2="${split * step}" stroke="${INK}" stroke-width="0.4" stroke-dasharray="1.4 1.2"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}mm" height="${h}mm" role="img">${g}</svg>`;
}

const star = `<svg viewBox="0 0 24 24" width="6.5mm" height="6.5mm"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" fill="#FFFDF7" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/></svg>`;

function buildHtml(lang) {
  const t = copy[lang];
  const foot = `<div class="foot"><span class="more">${esc(t.more)}</span> ${esc(t.moreUrl)}</div>`;
  const head = (title) =>
    `<div class="brand">${esc(t.brand)}</div>
     <div class="head"><h1>${esc(title)}</h1><div class="name">${esc(t.name)}: __________________</div></div>`;

  const chips = FAMILY_ORDER.map((n) => `<span class="chip"><i></i>×${n}</span>`).join("");

  // Page 3: the triangle of 15 target facts.
  let tri = `<tr><th class="corner">×</th>${TARGETS.map((n) => `<th>${n}</th>`).join("")}</tr>`;
  TARGETS.forEach((a, i) => {
    tri += `<tr><th>${a}</th>${TARGETS.map((b, j) =>
      j < i ? `<td class="none"></td>` : `<td${a === b ? ' class="sq"' : ""}>${a} × ${b} = ${BLANK}</td>`,
    ).join("")}</tr>`;
  });

  const routeRow = (fact, route) =>
    `<tr><td class="fact">${fact}</td><td class="route">${route}</td><td class="stars">${star}${star}${star}</td></tr>`;
  const routes =
    routeRow("7 × 8", `<span class="eg">${esc(t.routeExample)}</span>`) +
    Array.from({ length: 5 }, () => routeRow(`${BLANK} × ${BLANK}`, "")).join("");

  // Page 4.
  const q = (n, body) => `<li><span class="n">${n}.</span> ${body}</li>`;
  let n = 0;
  const colA = FACTS.map(([a, b]) => q(++n, `${a} × ${b} = ${BLANK}`)).join("");
  const colB = MISSING.map(([a, b, c]) => q(++n, `${a || BLANK} × ${b || BLANK} = ${c}`)).join("");
  const colC = DIVIDE.map(([c, b]) => q(++n, `${c} ÷ ${b} = ${BLANK}`)).join("");
  const answerList = [
    ...FACTS.map(([a, b]) => a * b),
    ...MISSING.map(([a, b, c]) => c / (a || b)),
    ...DIVIDE.map(([c, b]) => c / b),
  ]
    .map((v, i) => `${i + 1}) ${v}`)
    .join("   ");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: ${INK}; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 13mm 18mm; }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: ${CORAL}; font-weight: 700; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 6mm; }
    h1 { font-size: 23pt; font-weight: 800; color: ${INK}; margin: 1.5mm 0 1mm; }
    .name { font-size: 10.5pt; color: #56536b; padding-bottom: 2mm; white-space: nowrap; }
    .sub { font-size: 10.5pt; line-height: 1.45; color: #56536b; margin: 0 0 3mm; }
    h2 { font-size: 13.5pt; font-weight: 800; color: ${CORAL}; margin: 5mm 0 1.2mm; }
    .hint { font-size: 10pt; line-height: 1.4; color: #56536b; margin: 0 0 2mm; }
    .b { display: inline-block; width: 9mm; border-bottom: 0.35mm solid #8d899c; height: 4.5mm; vertical-align: baseline; }
    .tip { margin-top: 3mm; background: #FFEFE8; border-radius: 3mm; padding: 2.5mm 5mm; font-size: 10pt; color: ${INK}; }
    .foot { position: absolute; bottom: 8mm; left: 18mm; right: 18mm; font-size: 9pt; color: #b3ad9c; text-align: center; }
    .more { font-weight: 700; color: #7a778c; }

    table.tt { border-collapse: collapse; margin: 0 auto; }
    table.tt th, table.tt td { width: 15.4mm; height: 15.4mm; border: 0.3mm solid #8d899c; text-align: center; }
    table.tt th { background: ${CORAL}; color: #fff; font-size: 15pt; font-weight: 800; }
    table.tt th.corner { background: ${INK}; }
    table.tt td { background: #FFFDF7; }
    table.tt td.sq { background: ${SQUARE_TINT}; }
    .order { display: flex; flex-wrap: wrap; align-items: center; gap: 2mm 3.2mm; margin-top: 4.5mm; font-size: 10.5pt; }
    .order b { color: ${INK}; margin-right: 1mm; }
    .chip { display: inline-flex; align-items: center; gap: 1.3mm; font-weight: 700; color: ${INK}; }
    .chip i { display: inline-block; width: 4mm; height: 4mm; border: 0.35mm solid ${INK}; border-radius: 0.8mm; background: #FFFDF7; }
    .key { font-size: 9.5pt; color: #56536b; margin-top: 2.5mm; }
    .key i { display: inline-block; width: 3.4mm; height: 3.4mm; background: ${SQUARE_TINT}; border: 0.25mm solid #8d899c; vertical-align: -0.5mm; margin-right: 1.5mm; }

    ul.spots { margin: 0; padding-left: 5.5mm; font-size: 10.5pt; line-height: 1.6; color: #4a4760; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
    .three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
    .box { background: #FFFDF7; border: 0.3mm solid #e3dccb; border-radius: 3mm; padding: 3mm; text-align: center; }
    .box svg { display: block; margin: 1.5mm auto; }
    .box .task { font-size: 9.5pt; color: #56536b; min-height: 8.5mm; line-height: 1.3; }
    .eq { font-size: 11pt; font-weight: 700; color: ${INK}; line-height: 2; }
    .eq .c { color: ${CORAL}; } .eq .t { color: ${TEAL}; }
    .eq .b { width: 7mm; }
    .ask { font-size: 10pt; color: #56536b; text-align: center; margin: 2mm 0 0; font-style: italic; }
    .chain { font-size: 12pt; font-weight: 700; line-height: 2; }
    .own { background: #FFFDF7; border: 0.3mm solid #e3dccb; border-radius: 3mm; height: 29mm; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1.5mm; }
    .chain .arrow { color: ${CORAL}; margin: 0 2mm; }

    table.tri { border-collapse: collapse; margin: 0 auto; }
    table.tri th, table.tri td { height: 11.5mm; border: 0.3mm solid #8d899c; text-align: center; }
    table.tri th { width: 11.5mm; background: ${CORAL}; color: #fff; font-size: 13pt; font-weight: 800; }
    table.tri th.corner { background: ${INK}; }
    table.tri td { width: 31mm; background: #FFFDF7; font-size: 10.5pt; font-weight: 700; }
    table.tri td.sq { background: ${SQUARE_TINT}; }
    table.tri td.none { background: transparent; border-color: #e3dccb; }
    table.tri .b { width: 8mm; }
    table.routes { border-collapse: collapse; width: 100%; margin-top: 1mm; }
    table.routes th { font-size: 9.5pt; text-align: left; color: #7a778c; font-weight: 700; padding: 0 2mm 1mm; }
    table.routes td { border: 0.3mm solid #8d899c; background: #FFFDF7; height: 14.5mm; padding: 0 2.5mm; font-size: 11.5pt; font-weight: 700; }
    table.routes td.fact { width: 34mm; text-align: center; }
    table.routes td.stars { width: 46mm; text-align: center; }
    table.routes th { white-space: nowrap; }
    table.routes td.stars svg { margin: 1mm 1mm 0; }
    table.routes .eg { font-weight: 400; color: ${TEAL}; }
    table.routes .b { width: 7mm; }

    .cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 2mm; }
    .col { background: #FFFDF7; border: 0.3mm solid #e3dccb; border-radius: 3mm; padding: 3mm 4mm 2mm; }
    .col h3 { font-size: 11pt; font-weight: 800; color: ${TEAL}; margin: 0 0 1mm; min-height: 10mm; line-height: 1.2; }
    .col ol { list-style: none; margin: 0; padding: 0; font-size: 13pt; font-weight: 700; }
    .col li { line-height: 2.75; white-space: nowrap; }
    .col .n { display: inline-block; width: 8mm; font-size: 9pt; font-weight: 400; color: #9b97a8; }
    .answers { position: absolute; bottom: 16mm; left: 18mm; right: 18mm; text-align: center; font-size: 8pt; line-height: 1.5; color: #b3ad9c; transform: rotate(180deg); }
  </style></head><body>

  <div class="page">
    ${head(t.p1Title)}
    <p class="sub">${esc(t.p1Sub)}</p>
    ${timesTable()}
    <div class="order"><b>${esc(t.p1Order)}</b>${chips}</div>
    <div class="key"><i></i>${esc(t.p1Squares)}</div>
    <div class="tip">${esc(t.p1Flip)}</div>
    <h2>${esc(t.spotTitle)}</h2>
    <ul class="spots">${t.spots.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    ${foot}
  </div>

  <div class="page">
    ${head(t.p2Title)}
    <h2 style="margin-top:2mm">${esc(t.seeTitle)}</h2>
    <div class="two">
      <div class="box"><div class="task">${esc(t.seeLeft)}</div>${dots(5, 7, { step: 6, r: 1.4 })}<div class="eq">3 × 4 = ${BLANK}</div></div>
      <div class="box"><div class="task">${esc(t.seeRight)}</div>${dots(5, 7, { step: 6, r: 1.4 })}<div class="eq">4 × 3 = ${BLANK}</div></div>
    </div>
    <p class="ask">${esc(t.seeAsk)}</p>

    <h2>${esc(t.breakTitle)}</h2>
    <p class="hint">${esc(t.breakSub)}</p>
    <div class="three">
      <div class="box"><div class="task">${esc(t.breakExample)}</div>${dots(7, 8, { split: 5 })}
        <div class="eq">7 × 8 = <span class="c">5 × 8</span> + <span class="t">2 × 8</span><br>= <span class="c">40</span> + <span class="t">16</span> = 56</div></div>
      <div class="box"><div class="task">${esc(t.breakLine)}</div>${dots(6, 7)}
        <div class="eq">6 × 7 = 5 × 7 + 1 × 7<br>= ${BLANK} + ${BLANK} = ${BLANK}</div></div>
      <div class="box"><div class="task">${esc(t.breakOwn)}</div>${dots(8, 6)}
        <div class="eq">8 × 6 = ${BLANK} × 6 + ${BLANK} × 6<br>= ${BLANK} + ${BLANK} = ${BLANK}</div></div>
    </div>

    <h2>${esc(t.doubleTitle)}</h2>
    <p class="hint">${esc(t.doubleSub)}</p>
    <div class="chain">2 × 6 = ${BLANK}<span class="arrow">→</span>4 × 6 = ${BLANK}</div>
    <div class="chain">2 × 7 = ${BLANK}<span class="arrow">→</span>4 × 7 = ${BLANK}<span class="arrow">→</span>8 × 7 = ${BLANK}</div>

    <h2>${esc(t.ownTitle)}</h2>
    <p class="hint">${esc(t.ownSub)}</p>
    <div class="own"><div class="eq">${BLANK} × ${BLANK} = ${BLANK} × ${BLANK} + ${BLANK} × ${BLANK} = ${BLANK}</div></div>
    ${foot}
  </div>

  <div class="page">
    ${head(t.p3Title)}
    <p class="sub">${esc(t.p3Sub)}</p>
    <table class="tri">${tri}</table>
    <h2>${esc(t.routeTitle)}</h2>
    <p class="hint">${esc(t.routeSub)}</p>
    <table class="routes">
      <tr><th>${esc(t.colFact)}</th><th>${esc(t.colRoute)}</th><th style="text-align:center">${esc(t.colDays)}</th></tr>
      ${routes}
    </table>
    <div class="tip">${esc(t.starsTip)}</div>
    ${foot}
  </div>

  <div class="page">
    ${head(t.p4Title)}
    <p class="sub">${esc(t.p4Sub)}</p>
    <div class="cols">
      <div class="col"><h3>${esc(t.aTitle)}</h3><ol>${colA}</ol></div>
      <div class="col"><h3>${esc(t.bTitle)}</h3><ol>${colB}</ol></div>
      <div class="col"><h3>${esc(t.cTitle)}</h3><ol>${colC}</ol></div>
    </div>
    <div class="tip">${esc(t.family)}</div>
    <div class="answers">${esc(t.answers)}: ${esc(answerList)}</div>
    ${foot}
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
  const htmlPath = path.join(os.tmpdir(), `multiplication-practice-${lang}.html`);
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
