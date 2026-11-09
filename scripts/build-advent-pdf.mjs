#!/usr/bin/env node
/**
 * Build the four-page "STEM Advent Calendar" printable in English and
 * Croatian: a 24-door calendar to colour in, a checklist with every day's
 * mini instructions, a six-fold snowflake folding guide with three cutting
 * templates, and eight "science inside" gift tags. Goes with the
 * /en/stem-advent-calendar landing page and the articles it links to.
 *
 * The 24 doors are read from src/lib/advent-doors.json, the same file the
 * landing page uses, so the calendar and the printable never drift apart.
 *
 * Usage: node scripts/build-advent-pdf.mjs       (both languages)
 *        node scripts/build-advent-pdf.mjs en    (one language)
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

const DOORS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/advent-doors.json"), "utf8"));
/** 1 December 2026 is a Tuesday. */
const YEAR = 2026;

const PDF_FILE = {
  en: "stem-advent-calendar.pdf",
  hr: "stem-adventski-kalendar.pdf",
};

const copy = {
  en: {
    brand: "STEM Little Explorers · Christmas science lab",
    title: "The STEM Advent Calendar",
    kicker: "24 days of Christmas science",
    owner: "This calendar belongs to:",
    colourHint: "Do the experiment, then colour in the door. Weekend doors (in gold) are the bigger projects.",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    planTitle: "Every day's mini instructions",
    planSub: "Tick each day when it's done. Full instructions and the science are on the website: open the calendar and tap a door.",
    snowTitle: "Six-armed snowflakes",
    snowSub: "Real snowflakes have six arms, so we fold the paper into six parts, not eight.",
    guideTitle: "Folding guide (for a 15 cm square)",
    guideSteps: [
      "Fold the square in half, corner to corner. Pinch the middle of the folded edge.",
      "Lay the triangle on the guide: folded edge on the bottom line, pinch on the gold dot.",
      "Fold the right corner along the right 60° line, then the left corner over it along the left line.",
      "Fold in half once more, so the two long edges meet. Now it's 12 layers thick.",
    ],
    fold: "fold",
    tplTitle: "Cutting templates",
    tplSub: "Cut out a template and lay it on your folded wedge with the point at the centre. Both long edges are folds. Trace the red lines and cut, but never cut all the way across!",
    tplNames: ["Easy", "Medium", "Tricky"],
    tagsTitle: "Gift tags: the science inside",
    tagsSub: "Cut out, punch a hole and tie to your homemade presents.",
    to: "To:",
    from: "From:",
    inside: "The science inside",
    tags: [
      ["⭐", "Salt dough ornament", "Salt pulls water out of mould and bacteria, so this ornament can last for years."],
      ["🔮", "Snow globe", "Glycerin makes the water thicker, so the snow falls slowly."],
      ["❄️", "Paper snowflake", "Real snowflakes have six arms because water freezes in rings of six."],
      ["🍭", "Crystal candy cane", "Sugar crystals grow when a very sweet syrup slowly cools down."],
      ["🦌", "Cinnamon reindeer", "The Christmas smell of cinnamon comes from a molecule called cinnamaldehyde."],
      ["💻", "Binary bead ornament", "Every letter is 8 bits of code: red beads are 1, white beads are 0."],
      ["🏠", "Origami house", "Folded from one single sheet of paper, with no glue and no scissors."],
      ["🌲", "Pinecone tree", "Pinecones close in damp air and open when it's dry, to send their seeds flying."],
    ],
    rule: "Workshop rule: a grown-up stays for every experiment, and only food is for tasting.",
    page: "Page",
    site: `${HOST}/en/stem-advent-calendar`,
  },
  hr: {
    brand: "STEM Little Explorers · Božićni znanstveni laboratorij",
    title: "STEM adventski kalendar",
    kicker: "24 dana božićne znanosti",
    owner: "Ovaj kalendar pripada:",
    colourHint: "Napravite pokus, a zatim obojite vrata. Vrata vikendom (zlatna) su za veće projekte.",
    weekdays: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
    planTitle: "Kratke upute za svaki dan",
    planSub: "Označite svaki dan kad je gotov. Cijele upute i znanost su na webu: otvorite kalendar i dodirnite vrata.",
    snowTitle: "Pahulje sa šest krakova",
    snowSub: "Prave pahulje imaju šest krakova, zato papir presavijamo na šest dijelova, a ne na osam.",
    guideTitle: "Vodič za presavijanje (za kvadrat od 15 cm)",
    guideSteps: [
      "Presavijte kvadrat na pola, kut na kut. Označite sredinu presavijenog ruba.",
      "Položite trokut na vodič: presavijeni rub na donju crtu, oznaku na zlatnu točku.",
      "Desni kut presavijte uz desnu crtu od 60°, a lijevi preko njega uz lijevu crtu.",
      "Još jednom presavijte na pola, tako da se spoje dugi rubovi. Sada ima 12 slojeva.",
    ],
    fold: "pregib",
    tplTitle: "Predlošci za rezanje",
    tplSub: "Izrežite predložak i položite ga na presavijeni klin tako da vrh bude u sredini. Oba duga ruba su pregibi. Precrtajte crvene crte i režite, ali nikad skroz preko!",
    tplNames: ["Lagan", "Srednji", "Zahtjevan"],
    tagsTitle: "Privjesci za darove: znanost u daru",
    tagsSub: "Izrežite, probušite rupicu i zavežite na darove koje ste sami napravili.",
    to: "Za:",
    from: "Od:",
    inside: "Znanost u daru",
    tags: [
      ["⭐", "Ukras od slanog tijesta", "Sol izvlači vodu iz plijesni i bakterija, pa ovaj ukras može trajati godinama."],
      ["🔮", "Snježna kugla", "Glicerin čini vodu gušćom, pa snijeg pada polako."],
      ["❄️", "Pahulja od papira", "Prave pahulje imaju šest krakova jer se voda smrzava u prstenove od šest."],
      ["🍭", "Kristalni božićni štapić", "Kristali šećera rastu kad se jako slatki sirup polako hladi."],
      ["🦌", "Sob od cimeta", "Božićni miris cimeta dolazi od molekule koja se zove cimetaldehid."],
      ["💻", "Ukras u binarnom kodu", "Svako slovo ima 8 bitova: crvene perlice su 1, bijele su 0."],
      ["🏠", "Origami kućica", "Presavijena od samo jednog lista papira, bez ljepila i bez škara."],
      ["🌲", "Drvce od šišarke", "Šišarke se zatvaraju na vlazi, a otvaraju na suhom, da bi im sjemenke odletjele."],
    ],
    rule: "Pravilo radionice: odrasla osoba je uz svaki pokus, a kušamo samo ono što je hrana.",
    page: "Stranica",
    site: `${HOST}/hr/adventski-kalendar`,
  },
};

/** Door fields are either one string for both languages or { en, hr }. */
const tr = (v, lang) => (typeof v === "string" ? v : v[lang]);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TOTAL = 4;
const tick = `<span class="tick"></span>`;

const weekday = (day) => new Date(Date.UTC(YEAR, 11, day)).getUTCDay();
const isWeekend = (day) => [0, 6].includes(weekday(day));

function header(t, title, sub) {
  return `<div class="head"><div class="brand">${esc(t.brand)}</div><h1>${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}</div>`;
}

function footer(t, n) {
  return `<footer><span>${esc(t.site)}</span><span>${esc(t.page)} ${n} / ${TOTAL}</span></footer>`;
}

function pageCalendar(t, lang) {
  return `<div class="page">
    <div class="cover">
      <div><div class="brand light">${esc(t.brand)}</div><div class="kicker">${esc(t.kicker)}</div><div class="pack">${esc(t.title)}</div><div class="name">${esc(t.owner)} <span></span></div></div>
      <div class="star">⭐</div>
    </div>
    <p class="sub">${esc(t.colourHint)}</p>
    <div class="grid">${DOORS.map(
      (d) => `<div class="door${isWeekend(d.day) ? " weekend" : ""}">
        <div class="door-top"><span class="num">${d.day}</span><span class="wd">${esc(t.weekdays[weekday(d.day)])}</span></div>
        <div class="ico">${d.icon}</div>
        <div class="dtitle">${esc(d.title[lang])}</div>
      </div>`,
    ).join("")}</div>
    ${footer(t, 1)}
  </div>`;
}

function pagePlan(t, lang) {
  const item = (d) => `<div class="plan-item"><div class="plan-head">${tick}<b>${d.day}.</b> <span class="pi">${d.icon}</span> <b>${esc(d.title[lang])}</b> <span class="meta">· ${esc(tr(d.time, lang))} · ${esc(d.age)}</span></div><div class="plan-how">${esc(d.how[lang])}</div></div>`;
  return `<div class="page compact">
    ${header(t, `🗓️ ${t.planTitle}`, t.planSub)}
    <div class="plan">
      <div>${DOORS.slice(0, 12).map(item).join("")}</div>
      <div>${DOORS.slice(12).map(item).join("")}</div>
    </div>
    ${footer(t, 2)}
  </div>`;
}

/** Points along a ray from the wedge tip, in mm, for the template SVGs. */
const ray = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
const P = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** A 30° wedge (12-layer fold) with red cut lines. Tip at the bottom. */
function wedge(t, level) {
  const W = 50;
  const H = 86;
  const tip = [40, H - 4]; // fold edge on the right, open edge leaning left
  const L = 75; // 15 cm square: centre to edge is 7.5 cm
  const a1 = 90; // fold side (vertical)
  const a2 = 120;
  const foldTop = ray(tip[0], tip[1], L, a1);
  const openTop = ray(tip[0], tip[1], L, a2);
  const along = (a, d) => ray(tip[0], tip[1], d, a);
  // Notch on an edge: a triangle bite between distances d1 and d2.
  const notch = (a, d1, d2, depth, inward) => {
    const p1 = along(a, d1);
    const p2 = along(a, d2);
    const m = along(a, (d1 + d2) / 2);
    const q = [m[0] + inward * depth, m[1]];
    return `M${P(p1)} L${P(q)} L${P(p2)}`;
  };
  let cuts = "";
  if (level === 0) {
    cuts = `M${P(ray(tip[0], tip[1], 66, a1))} L${P(ray(tip[0], tip[1], 72, a2))} ${notch(a1, 22, 34, 5, -1)} ${notch(a2, 38, 50, 5, 1)}`;
  } else if (level === 1) {
    cuts = `M${P(ray(tip[0], tip[1], 70, a1))} L${P(ray(tip[0], tip[1], 60, a2))} ${notch(a1, 14, 22, 4, -1)} ${notch(a1, 32, 44, 6, -1)} ${notch(a1, 52, 60, 4, -1)} ${notch(a2, 20, 30, 5, 1)} ${notch(a2, 40, 50, 5, 1)}`;
  } else {
    const tipCut = `M${P(ray(tip[0], tip[1], 72, a1))} L${P(ray(tip[0], tip[1], 54, (a1 + a2) / 2))} L${P(ray(tip[0], tip[1], 58, a2))}`;
    cuts = `${tipCut} ${notch(a1, 10, 16, 3, -1)} ${notch(a1, 22, 30, 5, -1)} ${notch(a1, 36, 46, 7, -1)} ${notch(a1, 52, 60, 4, -1)} ${notch(a2, 14, 22, 4, 1)} ${notch(a2, 28, 38, 6, 1)} ${notch(a2, 44, 52, 4, 1)}`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
    <polygon points="${P(tip)} ${P(foldTop)} ${P(openTop)}" fill="#fff" stroke="#8FB3DA" stroke-width="0.5"/>
    <line x1="${tip[0]}" y1="${tip[1]}" x2="${foldTop[0]}" y2="${foldTop[1]}" stroke="#7A8CA5" stroke-width="0.6" stroke-dasharray="1.6 1.2"/>
    <line x1="${tip[0]}" y1="${tip[1]}" x2="${openTop[0]}" y2="${openTop[1]}" stroke="#7A8CA5" stroke-width="0.6" stroke-dasharray="1.6 1.2"/>
    <path d="${cuts}" fill="none" stroke="#C8102E" stroke-width="0.6" stroke-linejoin="round"/>
    <text x="${tip[0] + 4}" y="${tip[1] - 12}" font-size="3.2" fill="#7A8CA5" transform="rotate(-90 ${tip[0] + 4} ${tip[1] - 12})">${esc(t.fold)}</text>
    <text x="${along(a2, 14)[0] - 3}" y="${along(a2, 14)[1]}" font-size="3.2" fill="#7A8CA5" transform="rotate(-60 ${along(a2, 14)[0] - 3} ${along(a2, 14)[1]})">${esc(t.fold)}</text>
  </svg>`;
}

function pageSnowflake(t) {
  // Semicircle folding guide, 180° split into three 60° sectors.
  const R = 80;
  const cx = 92;
  const cy = 88;
  const l60 = ray(cx, cy, R, 60);
  const l120 = ray(cx, cy, R, 120);
  const arc = (r) => `M${cx + r} ${cy} A${r} ${r} 0 0 0 ${cx - r} ${cy}`;
  const guide = `<svg viewBox="0 0 184 96" width="184mm" height="96mm">
    <path d="${arc(R)} Z" fill="#EEF4FB" stroke="#8FB3DA" stroke-width="0.5"/>
    <line x1="${cx - R - 2}" y1="${cy}" x2="${cx + R + 2}" y2="${cy}" stroke="#2c2940" stroke-width="0.7"/>
    <line x1="${cx}" y1="${cy}" x2="${l60[0]}" y2="${l60[1]}" stroke="#7A8CA5" stroke-width="0.7" stroke-dasharray="2.4 1.6"/>
    <line x1="${cx}" y1="${cy}" x2="${l120[0]}" y2="${l120[1]}" stroke="#7A8CA5" stroke-width="0.7" stroke-dasharray="2.4 1.6"/>
    <path d="${arc(18)}" fill="none" stroke="#D98A0E" stroke-width="0.5"/>
    ${[30, 90, 150].map((a) => { const [x, y] = ray(cx, cy, 26, a); return `<text x="${x}" y="${y + 1.2}" font-size="4" font-weight="700" fill="#D98A0E" text-anchor="middle">60°</text>`; }).join("")}
    <circle cx="${cx}" cy="${cy}" r="1.8" fill="#D98A0E"/>
  </svg>`;
  return `<div class="page">
    ${header(t, `❄️ ${t.snowTitle}`, t.snowSub)}
    <h2>${esc(t.guideTitle)}</h2>
    <div class="guide">${guide}</div>
    <ol class="steps">${t.guideSteps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    <h2>✂️ ${esc(t.tplTitle)}</h2>
    <p class="sub small">${esc(t.tplSub)}</p>
    <div class="tpls">${[0, 1, 2].map((lvl) => `<div class="tpl">${wedge(t, lvl)}<div class="tpl-name">${esc(t.tplNames[lvl])}</div></div>`).join("")}</div>
    ${footer(t, 3)}
  </div>`;
}

function pageTags(t) {
  return `<div class="page">
    ${header(t, `🎁 ${t.tagsTitle}`, t.tagsSub)}
    <div class="tags">${t.tags
      .map(
        ([icon, name, fact]) => `<div class="tag">
          <div class="hole"></div>
          <div class="tag-head"><span class="tag-ico">${icon}</span><b>${esc(name)}</b></div>
          <div class="line-row">${esc(t.to)} <span></span></div>
          <div class="line-row">${esc(t.from)} <span></span></div>
          <div class="fact"><span>${esc(t.inside)}</span>${esc(fact)}</div>
        </div>`,
      )
      .join("")}</div>
    <div class="rule">${esc(t.rule)}</div>
    ${footer(t, 4)}
  </div>`;
}

function html(lang) {
  const t = copy[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(t.title)}</title><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", Arial, sans-serif; color: #12352A; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FBF7EE; padding: 11mm 13mm 14mm; }
    .page:last-child { page-break-after: auto; }
    .brand { color: #9F1F35; font-size: 8.5pt; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; }
    .brand.light { color: #E9B949; }
    h1 { margin: 1.5mm 0 1mm; font-size: 20pt; line-height: 1.1; color: #14532D; }
    h2 { margin: 4mm 0 1.5mm; font-size: 12.5pt; color: #14532D; }
    .sub { margin: 0 0 3mm; color: #4A5E55; font-size: 9.5pt; line-height: 1.35; }
    .sub.small { font-size: 8.5pt; margin-bottom: 2mm; }
    .cover { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(150deg, #0B2E24 0%, #14532D 60%, #1F6B45 100%); color: #FBF7EE; border-radius: 4mm; padding: 6mm 8mm; margin-bottom: 4mm; }
    .kicker { margin-top: 2mm; font-size: 10pt; font-weight: 800; color: #E9B949; text-transform: uppercase; letter-spacing: 1px; }
    .pack { font-size: 24pt; font-weight: 800; margin: 1.5mm 0 3mm; line-height: 1.1; }
    .name { font-size: 9.5pt; color: #E3F1E7; display: flex; gap: 2mm; align-items: flex-end; }
    .name span { display: inline-block; width: 66mm; border-bottom: .35mm solid #E3F1E7; }
    .star { width: 26mm; height: 26mm; border-radius: 50%; background: radial-gradient(circle, rgba(233,185,73,.55) 0%, rgba(233,185,73,0) 70%); display: flex; align-items: center; justify-content: center; font-size: 30pt; flex: none; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; }
    .door { background: #fff; border: .5mm solid #CFE0D4; border-radius: 3mm; height: 33.5mm; padding: 2mm 2.5mm; display: flex; flex-direction: column; }
    .door.weekend { border-color: #E9B949; background: #FFFBEE; }
    .door-top { display: flex; justify-content: space-between; align-items: baseline; }
    .num { font-size: 17pt; font-weight: 800; color: #14532D; line-height: 1; }
    .door.weekend .num { color: #9F1F35; }
    .wd { font-size: 7pt; font-weight: 700; color: #8A9C93; text-transform: uppercase; }
    .ico { font-size: 15pt; margin-top: 1mm; }
    .dtitle { margin-top: auto; font-size: 8pt; font-weight: 700; line-height: 1.2; color: #12352A; }
    .plan { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .plan-item { background: #fff; border: .3mm solid #E2EADF; border-radius: 2mm; padding: 1.6mm 2.2mm; margin-bottom: 1.6mm; }
    .plan-head { font-size: 8.2pt; line-height: 1.25; }
    .plan-head .meta { color: #8A9C93; font-size: 7pt; }
    .pi { font-size: 8.5pt; }
    .plan-how { font-size: 7.4pt; line-height: 1.3; color: #3B5047; margin-top: .6mm; }
    .tick { display: inline-block; width: 3.4mm; height: 3.4mm; border: .4mm solid #8A9C93; border-radius: .7mm; vertical-align: -.6mm; margin-right: 1.2mm; background: #fff; }
    .guide { display: flex; justify-content: center; background: #fff; border-radius: 3mm; padding: 2mm 0; }
    .steps { margin: 2.5mm 0 0 0; padding-left: 5mm; font-size: 8.8pt; line-height: 1.35; }
    .steps li { margin-bottom: .8mm; }
    .tpls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
    .tpl { background: #fff; border: .45mm dashed #B9CBC0; border-radius: 3mm; display: flex; flex-direction: column; align-items: center; padding: 1.5mm 0 2mm; }
    .tpl-name { font-size: 9pt; font-weight: 800; color: #14532D; }
    .tags { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .tag { position: relative; background: #fff; border: .5mm dashed #B9CBC0; border-radius: 4mm; height: 55mm; padding: 4mm 5mm 3mm 13mm; display: flex; flex-direction: column; }
    .hole { position: absolute; left: 4.5mm; top: 50%; width: 4mm; height: 4mm; margin-top: -2mm; border-radius: 50%; border: .4mm solid #B9CBC0; }
    .tag-head { display: flex; align-items: center; gap: 2mm; font-size: 10.5pt; color: #14532D; }
    .tag-ico { font-size: 14pt; }
    .line-row { display: flex; gap: 2mm; align-items: flex-end; font-size: 8.5pt; margin-top: 2.6mm; color: #4A5E55; }
    .line-row span { flex: 1; border-bottom: .3mm solid #CFD9D2; }
    .fact { margin-top: auto; font-size: 8pt; line-height: 1.3; color: #12352A; background: #F3F8F1; border-radius: 2mm; padding: 1.8mm 2.4mm; }
    .fact span { display: block; font-size: 6.6pt; font-weight: 800; color: #9F1F35; text-transform: uppercase; letter-spacing: .4px; margin-bottom: .5mm; }
    .rule { margin-top: 4mm; background: #14532D; color: #FBF7EE; border-radius: 2mm; padding: 2.5mm 4mm; font-size: 8.8pt; }
    footer { position: absolute; left: 13mm; right: 13mm; bottom: 6.5mm; display: flex; justify-content: space-between; color: #8FA79A; font-size: 7pt; }
  </style></head><body>
    ${pageCalendar(t, lang)}
    ${pagePlan(t, lang)}
    ${pageSnowflake(t)}
    ${pageTags(t)}
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
  const htmlPath = path.join(os.tmpdir(), `advent-calendar-${lang}.html`);
  const outputPath = path.join(ROOT, "public/downloads", PDF_FILE[lang]);
  fs.writeFileSync(htmlPath, html(lang), "utf8");
  if (process.env.KEEP_HTML) {
    console.log(`  HTML kept at ${htmlPath}`);
  }
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
  if (!process.env.KEEP_HTML) fs.unlinkSync(htmlPath);
  console.log(`  done (${Math.round(fs.statSync(outputPath).size / 1024)} KB)`);
}
