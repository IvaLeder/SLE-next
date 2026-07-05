#!/usr/bin/env node
/**
 * generate-leaps-cover.mjs — draws the cover illustration for the
 * "Developmental Leaps / Skokovi u razvoju" pillar article and renders it to
 * public/images/posts/developmental-leaps-cover.png (16:9, 1600x900).
 *
 * Language-neutral (numbers/units only) so one PNG serves both en + hr.
 * A rising staircase of the 10 Wonder-Weeks leaps: step i = leap i+1, labelled
 * with its onset week. Editable SVG source is written to asset/, the PNG to
 * public/images/posts/. Run once, then `npm run images` to pick it up:
 *   node scripts/generate-leaps-cover.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Brand palette (see svg-image-overhaul-workflow).
const BRAND = "#4f46e5";
const BRAND_DARK = "#3730a3";
const SOFT = "#eef2ff";
const PAPER = "#c7d2fe";
const FONT = "Helvetica, Arial, sans-serif";

const W = 1600;
const H = 900;

// The 10 leaps: onset week per The Wonder Weeks (counted from due date).
const WEEKS = [5, 8, 12, 19, 26, 37, 46, 55, 64, 75];

// Staircase geometry.
const marginX = 120;
const usableW = W - marginX * 2;
const stepW = usableW / WEEKS.length; // 10 columns
const gap = 20;
const baseY = 792;
const minH = 96;
const inc = 56;

// Step the crawling baby sits on (0-based); its badge is skipped so the figure
// stands in for that step's marker.
const babyBar = 1;

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const bars = [];
const centers = [];
for (let i = 0; i < WEEKS.length; i++) {
  const h = minH + i * inc;
  const x = marginX + i * stepW + gap / 2;
  const w = stepW - gap;
  const top = baseY - h;
  const cx = x + w / 2;
  const badgeCy = top - 46;
  centers.push({ cx, cy: badgeCy });

  bars.push(`
    <g>
      <rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"
            rx="16" fill="url(#bar)"/>
      <rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="18"
            rx="9" fill="#ffffff" opacity="0.28"/>
      <text x="${cx.toFixed(1)}" y="${(top + 56).toFixed(1)}" font-family="${FONT}"
            font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle">${WEEKS[i]}</text>
    </g>`);
}

// Dashed progression path linking the badge centres.
const pathD = centers.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ");

// Numbered leap badges on top of each step.
const badges = centers
  .map((c, i) =>
    i === babyBar
      ? ""
      : `
    <g>
      <circle cx="${c.cx.toFixed(1)}" cy="${c.cy.toFixed(1)}" r="34" fill="#ffffff"
              stroke="${BRAND}" stroke-width="4"/>
      <text x="${c.cx.toFixed(1)}" y="${(c.cy + 12).toFixed(1)}" font-family="${FONT}"
            font-size="34" font-weight="700" fill="${BRAND_DARK}" text-anchor="middle">${i + 1}</text>
    </g>`,
  )
  .join("");

// A side-view baby crawling up the steps (faces right / uphill). Local origin
// sits where the hands and knees meet the step surface; +x points uphill.
function baby(tx, ty, s) {
  const skin = "#f4c6a1";
  const skinD = "#e0a982";
  const suit = "#fb923c";
  const suitD = "#ea7c1b";
  const hair = "#7c5230";
  const cheek = "#fca5a5";
  return `
    <g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${s})">
      <!-- limbs behind the body -->
      <path d="M -26,-40 q -20,8 -22,38" fill="none" stroke="${suitD}" stroke-width="26" stroke-linecap="round"/>
      <path d="M 16,-50 q -8,26 -4,48" fill="none" stroke="${skinD}" stroke-width="16" stroke-linecap="round"/>
      <circle cx="12" cy="-2" r="10" fill="${skinD}"/>
      <!-- onesie torso, arched back -->
      <path d="M 34,-50 C 32,-92 -36,-96 -56,-56 C -64,-38 -56,-24 -40,-30 C -14,-40 16,-42 32,-42 Z" fill="${suit}"/>
      <!-- front leg + foot -->
      <path d="M -36,-38 q 22,4 32,36" fill="none" stroke="${suit}" stroke-width="28" stroke-linecap="round"/>
      <ellipse cx="-2" cy="-3" rx="13" ry="9" fill="${skin}"/>
      <!-- front arm + hand -->
      <path d="M 30,-48 q 16,24 22,46" fill="none" stroke="${suit}" stroke-width="19" stroke-linecap="round"/>
      <circle cx="52" cy="-3" r="11" fill="${skin}"/>
      <!-- head -->
      <circle cx="50" cy="-72" r="30" fill="${skin}"/>
      <circle cx="34" cy="-68" r="7" fill="${skin}"/>
      <!-- hair -->
      <path d="M 26,-84 q 24,-24 48,-4 q -12,-10 -26,-8 q -16,0 -22,12 Z" fill="${hair}"/>
      <path d="M 50,-100 q 8,-3 9,7 q -7,2 -9,-7 Z" fill="${hair}"/>
      <!-- face -->
      <circle cx="58" cy="-64" r="6" fill="${cheek}" opacity="0.85"/>
      <circle cx="56" cy="-75" r="3.4" fill="#3b2a20"/>
      <path d="M 53,-62 q 7,6 13,0" fill="none" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round"/>
    </g>`;
}

// Place the baby crawling on top of its step, facing uphill.
const babyG = baby(centers[babyBar].cx - 6, baseY - (minH + babyBar * inc) + 2, 0.92);

// A friendly star at the summit (top of the last, tallest step).
const last = centers[centers.length - 1];
function star(cx, cy, rOuter, rInner, points) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f8ff"/>
      <stop offset="1" stop-color="${SOFT}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BRAND}"/>
      <stop offset="1" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- soft decorative bubbles -->
  <circle cx="200" cy="150" r="70" fill="${PAPER}" opacity="0.35"/>
  <circle cx="1420" cy="120" r="46" fill="${PAPER}" opacity="0.35"/>
  <circle cx="1500" cy="300" r="26" fill="${PAPER}" opacity="0.5"/>

  <!-- ground line -->
  <rect x="${marginX - 20}" y="${baseY}" width="${usableW + 40}" height="6" rx="3" fill="${PAPER}"/>

  ${bars.join("")}

  <!-- progression path -->
  <path d="${pathD}" fill="none" stroke="${BRAND}" stroke-width="4"
        stroke-linecap="round" stroke-dasharray="2 14" opacity="0.55"/>

  ${badges}

  <!-- baby crawling up the steps -->
  ${babyG}

  <!-- summit star -->
  <polygon points="${star(last.cx, last.cy - 78, 30, 13, 5)}" fill="#facc15"
           stroke="#eab308" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const svgPath = path.join(ROOT, "asset", "developmental-leaps-cover.svg");
const pngPath = path.join(ROOT, "public", "images", "posts", "developmental-leaps-cover.png");

fs.writeFileSync(svgPath, svg);

await sharp(Buffer.from(svg))
  .resize(W, H)
  .png({ compressionLevel: 9, palette: true })
  .toFile(pngPath);

console.log("wrote", path.relative(ROOT, svgPath));
console.log("wrote", path.relative(ROOT, pngPath));
