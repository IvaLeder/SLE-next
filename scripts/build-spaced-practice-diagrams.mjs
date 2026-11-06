#!/usr/bin/env node
/**
 * Build the bilingual forgetting-curve diagram for the spaced-practice article.
 *
 * Usage: node scripts/build-spaced-practice-diagrams.mjs
 *
 * Editable SVG sources are written to asset/ and 1500x1000 PNGs to
 * public/images/posts/, matching the site's hand-authored diagram workflow.
 * The curves are a schematic (exponential decay towards a floor, slower after
 * every review), labelled on the image as an illustration, not real data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "asset");
const OUT = path.join(ROOT, "public/images/posts");

const W = 1500;
const H = 1000;
const FONT = "Helvetica, Arial, sans-serif";
const INK = "#2A2440";
const MUTE = "#8A7A70";
const PLUM = "#4C3A72";
const GOLD = "#E8B454";
const GOLD_DEEP = "#C99B3F";
const GREY = "#B7A99A";
const GRID = "#EEE7DA";
const PANEL = "#FBF8F2";

// Plot box
const X0 = 170;
const X1 = 1400;
const Y_TOP = 230; // 100 %
const Y_BOT = 800; // 0 %
const DAYS = 15;
const REVIEWS = [1, 3, 7, 14];
const FLOOR = 0.18;
const STRENGTH = [1.3, 3, 7, 15, 30]; // decay constant before review 1, after review 1, ...

const x = (day) => X0 + (day / DAYS) * (X1 - X0);
const y = (r) => Y_BOT - r * (Y_BOT - Y_TOP);
const decay = (dt, s) => FLOOR + (1 - FLOOR) * Math.exp(-dt / s);
const f = (n) => n.toFixed(1);

const copy = {
  en: {
    title: "Each review slows down forgetting",
    sub: "How much a child remembers in the two weeks after learning something new",
    yAxis: "How much is remembered",
    xAxis: "Days after learning",
    ticks: [
      [0, "Day 0", ""],
      [1, "Day 1", ""],
      [3, "Day 3", ""],
      [7, "Day 7", ""],
      [14, "Day 14", ""],
    ],
    keyLearn: "Learning",
    keyReview: "Review",
    noReview: "No reviews",
    withReview: "With spaced reviews",
    slower: ["After every review,", "memory fades more slowly"],
    note: "Simplified illustration of the forgetting curve, not real data.",
  },
  hr: {
    title: "Svako ponavljanje usporava zaboravljanje",
    sub: "Koliko dijete pamti u dva tjedna nakon što nauči nešto novo",
    yAxis: "Koliko se pamti",
    xAxis: "Dani nakon učenja",
    ticks: [
      [0, "0. dan", ""],
      [1, "1. dan", ""],
      [3, "3. dan", ""],
      [7, "7. dan", ""],
      [14, "14. dan", ""],
    ],
    keyLearn: "Učenje",
    keyReview: "Ponavljanje",
    noReview: "Bez ponavljanja",
    withReview: "Uz raspoređena ponavljanja",
    slower: ["Nakon svakog ponavljanja", "sjećanje blijedi sporije"],
    note: "Pojednostavljen prikaz krivulje zaboravljanja, a ne stvarni podaci.",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function noReviewPath() {
  const pts = [];
  for (let i = 0; i <= 150; i++) {
    const d = (i / 150) * DAYS;
    pts.push(`${f(x(d))},${f(y(decay(d, STRENGTH[0])))}`);
  }
  return `M ${pts.join(" L ")}`;
}

function reviewPath() {
  const edges = [0, ...REVIEWS, DAYS];
  let d = `M ${f(x(0))},${f(y(1))}`;
  for (let seg = 0; seg < edges.length - 1; seg++) {
    const a = edges[seg];
    const b = edges[seg + 1];
    const steps = Math.max(8, Math.round((b - a) * 12));
    for (let i = 1; i <= steps; i++) {
      const t = a + ((b - a) * i) / steps;
      d += ` L ${f(x(t))},${f(y(decay(t - a, STRENGTH[seg])))}`;
    }
    if (b !== DAYS) d += ` L ${f(x(b))},${f(y(1))}`; // the review lifts memory back up
  }
  return d;
}

function diagram(t) {
  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((r) => `<line x1="${X0}" y1="${f(y(r))}" x2="${X1}" y2="${f(y(r))}" stroke="${GRID}" stroke-width="2"/>
      <text x="${X0 - 16}" y="${f(y(r) + 7)}" font-size="20" fill="${MUTE}" text-anchor="end">${Math.round(r * 100)}%</text>`)
    .join("");

  const reviewMarks = REVIEWS.map((day, i) => {
    return `<circle cx="${f(x(day))}" cy="${f(y(1))}" r="17" fill="${GOLD}" stroke="#fff" stroke-width="3"/>
      <text x="${f(x(day))}" y="${f(y(1) + 7)}" font-size="19" font-weight="700" fill="${INK}" text-anchor="middle">${i + 1}</text>`;
  }).join("");

  const ticks = t.ticks
    .map(([day, a, b]) => `<line x1="${f(x(day))}" y1="${Y_BOT}" x2="${f(x(day))}" y2="${Y_BOT + 10}" stroke="${MUTE}" stroke-width="2"/>
      <text x="${f(x(day))}" y="${Y_BOT + 38}" font-size="21" font-weight="700" fill="${INK}" text-anchor="middle">${esc(a)}</text>
      ${b ? `<text x="${f(x(day))}" y="${Y_BOT + 64}" font-size="18" fill="${GOLD_DEEP}" font-weight="700" text-anchor="middle">${esc(b)}</text>` : ""}`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <text x="80" y="92" font-size="44" font-weight="700" fill="${PLUM}">${esc(t.title)}</text>
  <text x="80" y="138" font-size="24" fill="${MUTE}">${esc(t.sub)}</text>

  <rect x="${X0}" y="${Y_TOP - 30}" width="${X1 - X0}" height="${Y_BOT - Y_TOP + 30}" fill="${PANEL}" rx="10"/>
  ${grid}
  <text transform="translate(66 ${(Y_TOP + Y_BOT) / 2}) rotate(-90)" font-size="22" font-weight="700" fill="${INK}" text-anchor="middle">${esc(t.yAxis)}</text>

  <path d="${noReviewPath()}" fill="none" stroke="${GREY}" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/>
  <path d="${reviewPath()}" fill="none" stroke="${PLUM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
  ${reviewMarks}
  <circle cx="${f(x(0))}" cy="${f(y(1))}" r="10" fill="${PLUM}"/>

  <text x="${f(x(4.2))}" y="${f(y(0.27))}" font-size="24" font-weight="700" fill="${MUTE}">${esc(t.noReview)}</text>
  <text x="${f(x(8.6))}" y="${f(y(1.035))}" font-size="24" font-weight="700" fill="${PLUM}">${esc(t.withReview)}</text>
  <text x="${f(x(10.6))}" y="${f(y(0.47))}" font-size="21" font-style="italic" fill="${PLUM}" text-anchor="middle">
    <tspan x="${f(x(10.6))}">${esc(t.slower[0])}</tspan><tspan x="${f(x(10.6))}" dy="28">${esc(t.slower[1])}</tspan>
  </text>

  <g transform="translate(${X0 + 34} ${f(y(0.07))})">
    <circle cx="0" cy="-7" r="10" fill="${PLUM}"/>
    <text x="20" y="0" font-size="20" fill="${INK}">${esc(t.keyLearn)}</text>
    <circle cx="160" cy="-7" r="15" fill="${GOLD}" stroke="#fff" stroke-width="3"/>
    <text x="160" y="-1" font-size="16" font-weight="700" fill="${INK}" text-anchor="middle">1</text>
    <text x="185" y="0" font-size="20" fill="${INK}">${esc(t.keyReview)}</text>
  </g>
  <line x1="${X0}" y1="${Y_BOT}" x2="${X1}" y2="${Y_BOT}" stroke="${MUTE}" stroke-width="2.5"/>
  ${ticks}
  <text x="${(X0 + X1) / 2}" y="${Y_BOT + 84}" font-size="22" font-weight="700" fill="${INK}" text-anchor="middle">${esc(t.xAxis)}</text>

  <text x="80" y="${H - 34}" font-size="18" fill="${MUTE}">${esc(t.note)}</text>
  <text x="${W - 80}" y="${H - 34}" font-size="18" font-weight="700" fill="${GOLD_DEEP}" text-anchor="end">Mind Explorers · STEM Little Explorers</text>
</svg>`;
}

fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

for (const lang of ["en", "hr"]) {
  const svg = diagram(copy[lang]);
  const name = `spaced-practice-forgetting-curve-${lang}`;
  const svgPath = path.join(SRC, `${name}.svg`);
  const pngPath = path.join(OUT, `${name}.png`);
  fs.writeFileSync(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg), { density: 200 })
    .resize(W, H)
    .png({ palette: true, colours: 128 })
    .toFile(pngPath);
  console.log(`${path.relative(ROOT, svgPath)} -> ${path.relative(ROOT, pngPath)}`);
}
