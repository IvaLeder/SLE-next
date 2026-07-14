#!/usr/bin/env node
/**
 * build-sourdough-diagrams.mjs — original SVG→PNG concept diagrams for the
 * sourdough-starter article, en/hr variants from one parametrized source.
 * Matches the site's SVG-overhaul pipeline (see the apple-oxidation diagrams):
 * draw SVG in code, render with sharp, save editable SVG to asset/ and the
 * PNG to public/images/posts/.
 *
 *   1. yeast-cell — "How yeast works": a 3-stage budding strip, then the
 *      sugar → carbon dioxide + alcohol equation that makes bread rise.
 *   2. ecosystem — "One jar, two tiny workers": a starter-jar cross-section
 *      with wild yeast (gas bubbles) and lactic acid bacteria (acid),
 *      plus a labelled panel for each.
 *
 * Language-specific text only; all art is shared. 1500x1000 to match the
 * <Figure width/height> in the MDX.
 *
 * Usage:  node scripts/build-sourdough-diagrams.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public", "images", "posts");
const ASSET = path.join(ROOT, "asset");
const W = 1500;
const H = 1000;

// palette
const C = {
  ink: "#2c2940",
  muted: "#56536b",
  coral: "#FB6F52",
  cream: "#FFF8EE",
  panel: "#FFFDF7",
  panelStroke: "#e4dcca",
  yeast: "#E6B24D",
  yeastStroke: "#B07C1E",
  yeastCore: "#C98A2E",
  bact: "#3AA98C",
  bactStroke: "#21785F",
  gas: "#BFE1F2",
  gasStroke: "#7FB4D4",
  acid: "#E8788F",
  starter: "#F0E4CE",
  starterStroke: "#D8C6A0",
  glass: "#c7c0b0",
  line: "#9b97a8",
};

const FONT = 'font-family="Helvetica, Arial, sans-serif"';
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function text(x, y, s, { size = 30, color = C.ink, weight = "normal", anchor = "middle" } = {}) {
  return `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${color}">${esc(s)}</text>`;
}

/** Amber yeast cell, optional bud angle (deg) and highlight. */
function yeast(cx, cy, r, { bud = null, core = true } = {}) {
  let s = "";
  if (bud !== null) {
    const a = (bud * Math.PI) / 180;
    const br = r * 0.55;
    const bx = cx + Math.cos(a) * (r + br * 0.35);
    const by = cy + Math.sin(a) * (r + br * 0.35);
    s += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${br.toFixed(1)}" fill="${C.yeast}" stroke="${C.yeastStroke}" stroke-width="6"/>`;
    if (core) s += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(br * 0.34).toFixed(1)}" fill="${C.yeastCore}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.yeast}" stroke="${C.yeastStroke}" stroke-width="6"/>`;
  s += `<ellipse cx="${cx - r * 0.32}" cy="${cy - r * 0.34}" rx="${r * 0.28}" ry="${r * 0.18}" fill="#ffffff" opacity="0.35"/>`;
  if (core) s += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.32).toFixed(1)}" fill="${C.yeastCore}"/>`;
  return s;
}

/** Teal bacterium rod. */
function rod(cx, cy, angle = 0, len = 78, w = 34) {
  return `<g transform="translate(${cx} ${cy}) rotate(${angle})">
    <rect x="${-len / 2}" y="${-w / 2}" width="${len}" height="${w}" rx="${w / 2}" fill="${C.bact}" stroke="${C.bactStroke}" stroke-width="5"/>
    <ellipse cx="${-len * 0.18}" cy="${-w * 0.18}" rx="${len * 0.16}" ry="${w * 0.18}" fill="#ffffff" opacity="0.3"/>
  </g>`;
}

function bubble(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.gas}" stroke="${C.gasStroke}" stroke-width="4"/><ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.32}" rx="${r * 0.3}" ry="${r * 0.2}" fill="#ffffff" opacity="0.55"/>`;
}

function arrow(x1, x2, y, color = C.coral) {
  return `<line x1="${x1}" y1="${y}" x2="${x2 - 6}" y2="${y}" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
    <path d="M ${x2} ${y} L ${x2 - 26} ${y - 16} L ${x2 - 26} ${y + 16} Z" fill="${color}"/>`;
}

/** Sugar as a hexagon ring (C6 nod). */
function sugar(cx, cy, r) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="#FCE9C0" stroke="#D9A441" stroke-width="7"/>`;
}

const copy = {
  en: {
    d1title: "How yeast works",
    d1sub: "Yeast is a single-celled fungus. It grows by budding.",
    stage: ["1. A single yeast cell", "2. A bud swells out", "3. The bud breaks away"],
    lblWall: "cell wall",
    lblCore: "nucleus",
    lblBud: "bud",
    eqHead: "It eats sugar and gives off gas",
    sugar: "sugar",
    co2: "carbon dioxide gas",
    co2sub: "(makes bread rise)",
    alcohol: "a little alcohol",
    // ecosystem
    d2title: "One jar, two tiny workers",
    jar: "sourdough starter",
    yeastH: "Wild yeast",
    yeastT: "makes carbon dioxide gas: the bubbles that make bread rise",
    bactH: "Lactic acid bacteria",
    bactT: "makes acids: the sour taste that also keeps the starter safe",
    together: "They grow together as one balanced community.",
  },
  hr: {
    d1title: "Kako kvasac radi",
    d1sub: "Kvasac je jednostanična gljiva. Raste pupanjem.",
    stage: ["1. Jedna stanica kvasca", "2. Izraste pupoljak", "3. Pupoljak se odvaja"],
    lblWall: "stijenka",
    lblCore: "jezgra",
    lblBud: "pupoljak",
    eqHead: "Jede šećer i otpušta plin",
    sugar: "šećer",
    co2: "ugljikov dioksid",
    co2sub: "(diže kruh)",
    alcohol: "malo alkohola",
    d2title: "Jedna staklenka, dva sićušna radnika",
    jar: "kvasac za kiselo tijesto",
    yeastH: "Divlji kvasac",
    yeastT: "stvara ugljikov dioksid: mjehuriće koji dižu kruh",
    bactH: "Bakterije mliječne kiseline",
    bactT: "stvaraju kiseline: kiseli okus koji čuva kvasac sigurnim",
    together: "Rastu zajedno kao jedna uravnotežena zajednica.",
  },
};

function leader(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="3"/><circle cx="${x2}" cy="${y2}" r="5" fill="${C.line}"/>`;
}

function diagramYeast(t) {
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#ffffff"/>`;
  s += text(W / 2, 78, t.d1title, { size: 50, color: C.coral, weight: "bold" });
  s += text(W / 2, 128, t.d1sub, { size: 30, color: C.muted });

  // budding strip, cells centered at y=320
  const cy = 330;
  // stage 1
  s += yeast(280, cy, 105);
  s += leader(280, cy - 105, 210, 205) + text(205, 195, t.lblWall, { size: 24, color: C.muted, anchor: "end" });
  s += leader(258, 352, 178, 440) + text(172, 450, t.lblCore, { size: 24, color: C.muted, anchor: "end" });
  s += text(280, 500, t.stage[0], { size: 26, color: C.ink });
  // arrow
  s += arrow(415, 560, cy);
  // stage 2 with bud
  s += yeast(700, cy, 105, { bud: -50 });
  s += leader(772, 232, 860, 175) + text(870, 170, t.lblBud, { size: 24, color: C.muted, anchor: "start" });
  s += text(700, 500, t.stage[1], { size: 26, color: C.ink });
  // arrow
  s += arrow(835, 980, cy);
  // stage 3 separated
  s += yeast(1120, cy, 96);
  s += yeast(1300, 262, 66);
  s += text(1180, 500, t.stage[2], { size: 26, color: C.ink });

  // divider
  s += `<line x1="120" y1="560" x2="1380" y2="560" stroke="${C.panelStroke}" stroke-width="3"/>`;

  // equation band
  s += text(W / 2, 632, t.eqHead, { size: 38, color: C.ink, weight: "bold" });
  const ey = 790;
  // sugar
  s += sugar(230, ey, 78);
  s += text(230, ey + 135, t.sugar, { size: 30, color: C.muted });
  s += arrow(345, 470, ey);
  // co2 bubble cluster
  s += bubble(650, ey - 40, 58) + bubble(740, ey + 20, 44) + bubble(600, ey + 45, 36) + bubble(720, ey - 60, 30);
  s += text(670, ey + 120, t.co2, { size: 30, color: C.ink, weight: "bold" });
  s += text(670, ey + 158, t.co2sub, { size: 26, color: C.coral });
  // plus
  s += text(950, ey + 12, "+", { size: 60, color: C.line, weight: "bold" });
  // alcohol droplet
  s += `<path d="M 1160 ${ey - 70} C 1210 ${ey - 10}, 1210 ${ey + 30}, 1160 ${ey + 45} C 1110 ${ey + 30}, 1110 ${ey - 10}, 1160 ${ey - 70} Z" fill="#E7ECF5" stroke="#9FB2D0" stroke-width="6"/>`;
  s += text(1160, ey + 120, t.alcohol, { size: 30, color: C.muted });

  s += `</svg>`;
  return s;
}

function diagramEcosystem(t) {
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#ffffff"/>`;
  s += text(W / 2, 82, t.d2title, { size: 50, color: C.coral, weight: "bold" });

  // jar cross-section (left)
  const jx = 130, jy = 200, jw = 470, jh = 640;
  const surf = jy + jh * 0.32; // starter surface line
  s += `<clipPath id="jar"><rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" rx="46"/></clipPath>`;
  s += `<rect x="${jx + 40}" y="${jy - 34}" width="${jw - 80}" height="60" rx="18" fill="${C.panel}" stroke="${C.glass}" stroke-width="7"/>`;
  s += `<rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" rx="46" fill="${C.panel}" stroke="${C.glass}" stroke-width="8"/>`;
  // starter body
  s += `<g clip-path="url(#jar)"><rect x="${jx}" y="${surf}" width="${jw}" height="${jh}" fill="${C.starter}"/>`;
  s += `<path d="M ${jx} ${surf} q 60 -34 118 0 t 118 0 t 118 0 t 118 0 V ${jy + jh} H ${jx} Z" fill="${C.starter}" stroke="${C.starterStroke}" stroke-width="5"/>`;
  // contents: yeast + bacteria in the starter
  s += yeast(250, surf + 120, 46, { bud: -40 });
  s += yeast(470, surf + 210, 40);
  s += yeast(320, surf + 320, 44, { bud: 200 });
  s += yeast(500, surf + 380, 38, { bud: -60 });
  s += rod(400, surf + 90, 25) + rod(230, surf + 250, -20) + rod(520, surf + 300, 60) + rod(300, surf + 430, 10) + rod(450, surf + 470, -35);
  // acid dots
  for (const [x, y] of [[360, 160], [430, 250], [280, 360], [500, 200]])
    s += `<circle cx="${jx + x}" cy="${surf + y}" r="9" fill="${C.acid}" opacity="0.75"/>`;
  // rising gas bubbles
  s += bubble(300, surf - 40, 26) + bubble(390, surf - 110, 20) + bubble(460, surf - 60, 30) + bubble(360, surf - 190, 16) + bubble(250, surf - 120, 18) + bubble(500, surf - 150, 22);
  s += `</g>`;
  s += text(jx + jw / 2, jy + jh + 66, t.jar, { size: 32, color: C.muted, weight: "bold" });

  // right panels
  const px = 720, pw = 700, ph = 250;
  // yeast panel
  let py = 210;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="26" fill="${C.cream}" stroke="${C.panelStroke}" stroke-width="4"/>`;
  s += yeast(px + 95, py + ph / 2, 62, { bud: -45 });
  s += text(px + 190, py + 92, t.yeastH, { size: 40, color: C.yeastStroke, weight: "bold", anchor: "start" });
  s += wrap(t.yeastT, px + 190, py + 142, pw - 220, 30, C.ink);
  // bacteria panel
  py = 540;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="26" fill="${C.cream}" stroke="${C.panelStroke}" stroke-width="4"/>`;
  s += rod(px + 95, py + ph / 2, 30, 96, 42);
  s += text(px + 190, py + 92, t.bactH, { size: 40, color: C.bactStroke, weight: "bold", anchor: "start" });
  s += wrap(t.bactT, px + 190, py + 142, pw - 220, 30, C.ink);

  s += text(W / 2, 952, t.together, { size: 32, color: C.muted, weight: "bold" });
  s += `</svg>`;
  return s;
}

/** naive word-wrap into <text> lines */
function wrap(str, x, y, maxW, size, color) {
  const words = str.split(" ");
  const perLine = Math.max(1, Math.floor(maxW / (size * 0.52)));
  const lines = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.join(" ").length > perLine) {
      lines.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) lines.push(cur.join(" "));
  return lines
    .map((ln, i) => text(x, y + i * (size + 12), ln, { size, color, anchor: "start" }))
    .join("");
}

async function render(svg, name) {
  fs.writeFileSync(path.join(ASSET, `${name}.svg`), svg, "utf8");
  const out = path.join(IMG, `${name}.png`);
  await sharp(Buffer.from(svg)).resize(W, H).png({ compressionLevel: 9, palette: true }).toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`  ${path.relative(ROOT, out)} (${kb} KB)`);
}

const base = "how-to-make-sourdough-starter";
for (const lang of ["en", "hr"]) {
  const t = copy[lang];
  console.log(`${lang}:`);
  await render(diagramYeast(t), `${base}-yeast-cell-${lang}`);
  await render(diagramEcosystem(t), `${base}-ecosystem-${lang}`);
}
