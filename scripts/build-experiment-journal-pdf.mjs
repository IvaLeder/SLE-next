#!/usr/bin/env node
/**
 * build-experiment-journal-pdf.mjs — renders the "Little Explorer's experiment
 * journal", the SUBSCRIBER-ONLY bonus pack (SUBSCRIBER_BONUS in
 * src/lib/printables.ts). It is not listed on the printables hub: new
 * subscribers get it on the welcome page and in the Mailchimp welcome email.
 *
 * Unlike the per-article lab sheets, this one is reusable with ANY experiment
 * on the site. Four A4 pages:
 *   1. Cover: name line, the five-step "how scientists think" loop, a note for
 *      grown-ups.
 *   2. Experiment sheet, front: question, prediction, plan (materials, the one
 *      thing I change, what stays the same, what I watch or measure).
 *   3. Experiment sheet, back: before/after drawing boxes, results table,
 *      was-my-prediction-right, explanation, next test, star rating.
 *   4. Log of 10 experiments, five scientist words, a cut-out certificate.
 * Pages 2-3 are meant to be printed again for every experiment.
 *
 * Outline art on purpose, like the other packs: prints on any black-and-white
 * printer and the filling-in is the activity.
 *
 * Pipeline: print-styled standalone HTML → headless Google Chrome
 * `--print-to-pdf` → public/downloads/subscribers/ (noindex, see next.config).
 *
 * Usage:  node scripts/build-experiment-journal-pdf.mjs        (both languages)
 *         node scripts/build-experiment-journal-pdf.mjs en     (one language)
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
  en: "downloads/subscribers/little-explorers-experiment-journal.pdf",
  hr: "downloads/subscribers/dnevnik-pokusa-malog-istrazivaca.pdf",
};

const LOG_ROWS = 10;

const copy = {
  en: {
    brand: "STEM Little Explorers",
    coverKicker: "A thank-you for our newsletter readers",
    coverTitle: "Little Explorer’s experiment journal",
    belongs: "This journal belongs to:",
    coverIntro:
      "Every experiment starts with a question. Use this journal to write down what you expect, what you see and what you find out.",
    loopTitle: "How scientists think",
    steps: [
      ["Ask", "What am I curious about?"],
      ["Predict", "What do I think will happen?"],
      ["Test", "Try it out."],
      ["Observe", "What do I see, hear and feel?"],
      ["Explain", "Why did it happen?"],
    ],
    adultsTitle: "For grown-ups",
    adults: [
      "Print pages 2 and 3 again for every new experiment, double-sided if you can.",
      "Younger children can draw instead of writing while you write down their words.",
      "The best question is not “did it work?” but “what do you notice?”.",
      "A prediction that turns out wrong is not a mistake. It is how scientists learn.",
    ],
    ideas: "Need an idea? Find every experiment at",
    ideasUrl: `${HOST}/en/activities`,
    sheetTitle: "My experiment",
    name: "Experiment:",
    date: "Date:",
    s1: "My question",
    s1Hint: "I wonder…",
    s2: "My prediction",
    s2Hint: "I think this will happen:",
    because: "because",
    s3: "My plan",
    need: "What I need",
    change: "The ONE thing I change",
    same: "What stays the same",
    watch: "What I watch or measure",
    s4: "What I see",
    before: "Before",
    after: "After",
    drawHint: "Draw it or stick in a photo.",
    results: "My results",
    cols: ["Try", "What I changed", "What happened"],
    s5: "My explanation",
    wasRight: "My prediction was:",
    rightOpts: ["right", "partly right", "different from what happened"],
    why: "I think it happened because",
    next: "Next I want to test:",
    stars: "How much did I like this experiment? Colour the stars.",
    logTitle: "My experiment log",
    logSub: "Add a line every time you finish an experiment. Ten lines earn the certificate below.",
    logCols: ["No.", "Date", "Experiment", "Prediction right?", "Stars"],
    wordsTitle: "Words scientists use",
    words: [
      ["Prediction", "what you think will happen, before you test it."],
      ["Observation", "what you notice with your senses."],
      ["Variable", "the thing you change or measure in an experiment."],
      ["Fair test", "you change only one thing and keep everything else the same."],
      ["Conclusion", "what your results tell you."],
    ],
    certKicker: "Cut out and keep",
    certTitle: "Little Explorer certificate",
    certBody: "This certifies that",
    certBody2: "has finished 10 experiments and asked a lot of good questions.",
    certDate: "Date",
    certSign: "Lab assistant (a grown-up)",
    page: "Page",
  },
  hr: {
    brand: "STEM Little Explorers",
    coverKicker: "Zahvala čitateljima našeg newslettera",
    coverTitle: "Dnevnik pokusa malog istraživača",
    belongs: "Ovaj dnevnik pripada:",
    coverIntro:
      "Svaki pokus počinje pitanjem. U ovaj dnevnik zapiši što očekuješ, što vidiš i što otkriješ.",
    loopTitle: "Kako razmišljaju znanstvenici",
    steps: [
      ["Pitaj", "Što me zanima?"],
      ["Predvidi", "Što mislim da će se dogoditi?"],
      ["Isprobaj", "Napravi pokus."],
      ["Promatraj", "Što vidim, čujem i osjećam?"],
      ["Objasni", "Zašto se to dogodilo?"],
    ],
    adultsTitle: "Za odrasle",
    adults: [
      "Stranice 2 i 3 ispišite ponovno za svaki novi pokus, po mogućnosti obostrano.",
      "Mlađa djeca mogu crtati umjesto pisati, a vi zapišite njihove riječi.",
      "Najbolje pitanje nije „je li uspjelo?” nego „što primjećuješ?”.",
      "Predviđanje koje se ne ostvari nije pogreška. Upravo tako znanstvenici uče.",
    ],
    ideas: "Trebate ideju? Sve pokuse pronađite na",
    ideasUrl: `${HOST}/hr/activities`,
    sheetTitle: "Moj pokus",
    name: "Pokus:",
    date: "Datum:",
    s1: "Moje pitanje",
    s1Hint: "Zanima me…",
    s2: "Moje predviđanje",
    s2Hint: "Mislim da će se dogoditi ovo:",
    because: "jer",
    s3: "Moj plan",
    need: "Što mi treba",
    change: "JEDNA stvar koju mijenjam",
    same: "Što ostaje isto",
    watch: "Što promatram ili mjerim",
    s4: "Što vidim",
    before: "Prije",
    after: "Poslije",
    drawHint: "Nacrtaj ili zalijepi fotografiju.",
    results: "Moji rezultati",
    cols: ["Pokušaj", "Što se promijenilo", "Što se dogodilo"],
    s5: "Moje objašnjenje",
    wasRight: "Moje predviđanje bilo je:",
    rightOpts: ["točno", "djelomično točno", "drukčije od onoga što se dogodilo"],
    why: "Mislim da se to dogodilo jer",
    next: "Sljedeće želim isprobati:",
    stars: "Koliko mi se svidio ovaj pokus? Oboji zvjezdice.",
    logTitle: "Moj popis pokusa",
    logSub: "Dodaj jedan red svaki put kad završiš pokus. Deset redova donosi diplomu ispod.",
    logCols: ["Br.", "Datum", "Pokus", "Predviđanje točno?", "Zvjezdice"],
    wordsTitle: "Riječi znanstvenika",
    words: [
      ["Predviđanje", "ono što misliš da će se dogoditi, prije nego što isprobaš."],
      ["Promatranje", "ono što primijetiš svojim osjetilima."],
      ["Varijabla", "ono što u pokusu mijenjaš ili mjeriš."],
      ["Pošten pokus", "mijenjaš samo jednu stvar, a sve ostalo ostaje isto."],
      ["Zaključak", "ono što ti rezultati govore."],
    ],
    certKicker: "Izreži i sačuvaj",
    certTitle: "Diploma malog istraživača",
    certBody: "Ova diploma potvrđuje da",
    certBody2: "ima iza sebe 10 pokusa i puno dobrih pitanja.",
    certDate: "Datum",
    certSign: "Laboratorijski asistent (odrasla osoba)",
    page: "Stranica",
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const lines = (n, cls = "wl") => Array.from({ length: n }, () => `<div class="${cls}"></div>`).join("");
const chk = `<span class="chk"></span>`;

/** Outline star for the child to colour in. */
const star = (size = "7mm") =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z" fill="#fff" stroke="#9b97a8" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const stars = (n, size) => Array.from({ length: n }, () => star(size)).join("");

/** Magnifying glass over a flask: the cover mark. Outline only. */
const coverArt = `<svg viewBox="0 0 120 120" width="44mm" height="44mm" aria-hidden="true">
  <path d="M48 20h20M52 20v26L30 88a8 8 0 0 0 7 12h46a8 8 0 0 0 7-12L68 46V20" fill="#FFFDF7" stroke="#2c2940" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M39 76h42" stroke="#FB6F52" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="52" cy="86" r="3" fill="none" stroke="#FB6F52" stroke-width="2"/>
  <circle cx="66" cy="90" r="2" fill="none" stroke="#FB6F52" stroke-width="2"/>
  <circle cx="61" cy="66" r="2.4" fill="none" stroke="#FB6F52" stroke-width="2"/>
  <circle cx="88" cy="38" r="15" fill="#FFF8EE" stroke="#2c2940" stroke-width="2.6"/>
  <path d="M99 49l13 13" stroke="#2c2940" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M80 34a9 9 0 0 1 8-5" fill="none" stroke="#FB6F52" stroke-width="2" stroke-linecap="round"/>
</svg>`;

function head(t, n) {
  return `<div class="top"><span class="brand">${esc(t.brand)}</span><span class="pageno">${esc(t.page)} ${n} / 4</span></div>`;
}
const foot = `<div class="foot">${HOST}</div>`;

const section = (n, title) => `<h2><span class="num">${n}</span>${esc(title)}</h2>`;

function buildHtml(lang) {
  const t = copy[lang];

  const loop = t.steps
    .map(
      ([name, q], i) => `<div class="step">
        <div class="dot">${i + 1}</div>
        <div class="sname">${esc(name)}</div>
        <div class="sq">${esc(q)}</div>
      </div>${i < t.steps.length - 1 ? `<div class="arrow">→</div>` : ""}`,
    )
    .join("");

  const resultRows = [1, 2, 3, 4]
    .map((n) => `<tr><td class="c">${n}</td><td></td><td></td></tr>`)
    .join("");

  const logRows = Array.from(
    { length: LOG_ROWS },
    (_, i) =>
      `<tr><td class="c">${i + 1}</td><td></td><td></td><td class="c">${chk}</td><td class="c">${stars(3, "4.2mm")}</td></tr>`,
  ).join("");

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
  <title>${esc(t.coverTitle)}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif; color: #2c2940; }
    .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: #FFF8EE; padding: 12mm 15mm 16mm; }
    .page:last-child { page-break-after: auto; }
    .top { display: flex; justify-content: space-between; align-items: baseline; }
    .brand { font-size: 10pt; letter-spacing: .5px; color: #FB6F52; font-weight: 700; }
    .pageno { font-size: 8pt; color: #b3ad9c; }
    .foot { position: absolute; bottom: 7mm; left: 15mm; right: 15mm; font-size: 8.5pt; color: #b3ad9c; text-align: center; }
    h1 { font-size: 22pt; font-weight: 800; margin: 1.5mm 0 3mm; }
    h2 { font-size: 13pt; font-weight: 800; color: #2c2940; margin: 0 0 2mm; display: flex; align-items: center; gap: 2.5mm; }
    .num { display: inline-flex; align-items: center; justify-content: center; width: 7mm; height: 7mm; border-radius: 50%; background: #FB6F52; color: #fff; font-size: 10.5pt; flex: none; }
    .box { border: 0.5mm solid #d9d2c4; border-radius: 3mm; background: #FFFDF7; padding: 4mm 5mm; margin-top: 4.5mm; }
    .box.accent { border: 0.5mm dashed #FB6F52; }
    .hint { font-size: 9.5pt; color: #7a778c; margin: 0 0 1mm; }
    .wl { border-bottom: 0.35mm solid #c7c0b0; height: 10mm; }
    .inl { display: flex; align-items: flex-end; gap: 2.5mm; font-size: 10.5pt; font-weight: 700; }
    .inl .wl { flex: 1; }
    .chk { display: inline-block; width: 3.6mm; height: 3.6mm; border: 0.4mm solid #9b97a8; border-radius: 0.8mm; background: #fff; vertical-align: -0.4mm; margin-right: 1.6mm; }
    .label { font-size: 10pt; font-weight: 800; color: #FB6F52; margin: 0 0 0.5mm; }

    /* cover */
    .cover-head { display: flex; align-items: center; gap: 8mm; margin-top: 16mm; }
    .cover-head .txt { flex: 1; }
    .kicker { font-size: 9.5pt; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #FB6F52; }
    .cover-title { font-size: 31pt; line-height: 1.08; font-weight: 800; margin: 2mm 0 4mm; }
    .cover-intro { font-size: 12pt; line-height: 1.45; color: #56536b; margin: 0; }
    .belongs { margin-top: 14mm; font-size: 12pt; font-weight: 700; display: flex; align-items: flex-end; gap: 3mm; }
    .belongs .wl { flex: 1; height: 9mm; border-bottom-width: 0.5mm; }
    .loop { display: flex; align-items: flex-start; justify-content: space-between; margin-top: 3mm; }
    .step { width: 30mm; text-align: center; }
    .dot { width: 12mm; height: 12mm; border-radius: 50%; border: 0.6mm solid #FB6F52; background: #fff; color: #FB6F52; font-weight: 800; font-size: 14pt; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5mm; }
    .sname { font-size: 11.5pt; font-weight: 800; }
    .sq { font-size: 8.8pt; line-height: 1.3; color: #56536b; margin-top: 0.8mm; }
    .arrow { font-size: 15pt; color: #c7c0b0; margin-top: 2.5mm; }
    .adults ul { margin: 0; padding-left: 5mm; }
    .adults li { font-size: 10pt; line-height: 1.45; color: #56536b; margin: 1.2mm 0; }
    .ideas { margin-top: 10mm; font-size: 10.5pt; color: #56536b; text-align: center; }
    .ideas b { color: #2c2940; }

    /* experiment sheet */
    .namebar { display: flex; gap: 6mm; margin-top: 1mm; }
    .namebar .inl:first-child { flex: 1; }
    .namebar .inl:last-child { width: 52mm; }
    .plan { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; }
    .need div { font-size: 10pt; height: 10mm; display: flex; align-items: flex-end; }
    .need .wl { flex: 1; height: 10mm; }
    .draw { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .drawbox { height: 60mm; border: 0.35mm solid #d9d2c4; border-radius: 2mm; background: #fff; position: relative; }
    .drawbox span { position: absolute; top: 1.5mm; left: 2.5mm; font-size: 9pt; font-weight: 800; color: #FB6F52; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th { font-size: 9pt; text-align: left; color: #7a778c; font-weight: 700; padding: 1.5mm 2mm; border: 0.3mm solid #d9d2c4; background: #FBF4E8; }
    td { border: 0.3mm solid #d9d2c4; height: 10mm; padding: 0 2mm; font-size: 10pt; }
    td.c, th.c { text-align: center; }
    .opts { font-size: 10.5pt; margin: 1mm 0 2mm; display: flex; flex-wrap: wrap; gap: 1.5mm 7mm; }
    .starrow { display: flex; align-items: center; justify-content: space-between; margin-top: 4mm; font-size: 10.5pt; font-weight: 700; }
    .starrow .s { display: flex; gap: 1.5mm; }

    /* log + certificate */
    .logsub { font-size: 10pt; color: #56536b; margin: 0 0 3mm; }
    .log td { height: 9.6mm; }
    .words { columns: 2; column-gap: 8mm; margin: 0; padding: 0; list-style: none; }
    .words li { font-size: 9.3pt; line-height: 1.4; color: #56536b; margin: 0 0 1.6mm; break-inside: avoid; }
    .words b { color: #2c2940; }
    .cert { margin-top: 8mm; border: 0.7mm dashed #FB6F52; border-radius: 4mm; background: #FFFDF7; padding: 7mm 8mm 6mm; text-align: center; position: relative; }
    .cert .cut { position: absolute; top: -3.4mm; left: 8mm; background: #FFF8EE; padding: 0 2mm; font-size: 8pt; color: #FB6F52; font-weight: 700; }
    .cert h3 { font-size: 18pt; font-weight: 800; margin: 1mm 0 2mm; }
    .cert p { font-size: 10.5pt; color: #56536b; margin: 0; }
    .cert .who { width: 110mm; margin: 0 auto 1.5mm; height: 10mm; border-bottom: 0.5mm solid #2c2940; }
    .cert .sig { display: flex; justify-content: space-between; gap: 12mm; margin-top: 3mm; }
    .cert .sig div { flex: 1; }
    .cert .sig .wl { height: 8mm; }
    .cert .sig span { display: block; font-size: 8pt; color: #9b97a8; margin-top: 1mm; }
    .cert .cs { display: flex; justify-content: center; gap: 2mm; margin-bottom: 1mm; }
  </style></head><body>

  <!-- 1. Cover -->
  <div class="page">
    ${head(t, 1)}
    <div class="cover-head">
      <div class="txt">
        <div class="kicker">${esc(t.coverKicker)}</div>
        <div class="cover-title">${esc(t.coverTitle)}</div>
        <p class="cover-intro">${esc(t.coverIntro)}</p>
      </div>
      ${coverArt}
    </div>
    <div class="belongs">${esc(t.belongs)} <div class="wl"></div></div>

    <div class="box accent" style="margin-top:16mm; padding:7mm 6mm 8mm;">
      <h2>${esc(t.loopTitle)}</h2>
      <div class="loop">${loop}</div>
    </div>

    <div class="box adults" style="margin-top:12mm; padding:6mm 6mm;">
      <h2>${esc(t.adultsTitle)}</h2>
      <ul>${t.adults.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
    </div>

    <p class="ideas">${esc(t.ideas)} <b>${esc(t.ideasUrl)}</b></p>
    ${foot}
  </div>

  <!-- 2. Experiment sheet, front -->
  <div class="page">
    ${head(t, 2)}
    <h1>${esc(t.sheetTitle)}</h1>
    <div class="namebar">
      <div class="inl">${esc(t.name)} <div class="wl"></div></div>
      <div class="inl">${esc(t.date)} <div class="wl"></div></div>
    </div>

    <div class="box">
      ${section(1, t.s1)}
      <p class="hint">${esc(t.s1Hint)}</p>
      ${lines(2)}
    </div>

    <div class="box accent">
      ${section(2, t.s2)}
      <p class="hint">${esc(t.s2Hint)}</p>
      ${lines(2)}
      <div class="inl" style="margin-top:1mm;">${esc(t.because)} <div class="wl"></div></div>
      ${lines(1)}
    </div>

    <div class="box">
      ${section(3, t.s3)}
      <div class="plan">
        <div class="need">
          <p class="label">${esc(t.need)}</p>
          ${Array.from({ length: 6 }, () => `<div>${chk}<span class="wl"></span></div>`).join("")}
        </div>
        <div>
          <p class="label">${esc(t.change)}</p>
          ${lines(2)}
          <p class="label" style="margin-top:4mm;">${esc(t.same)}</p>
          ${lines(2)}
          <p class="label" style="margin-top:4mm;">${esc(t.watch)}</p>
          ${lines(1)}
        </div>
      </div>
    </div>
    ${foot}
  </div>

  <!-- 3. Experiment sheet, back -->
  <div class="page">
    ${head(t, 3)}
    <div class="box" style="margin-top:3mm;">
      ${section(4, t.s4)}
      <p class="hint">${esc(t.drawHint)}</p>
      <div class="draw">
        <div class="drawbox"><span>${esc(t.before)}</span></div>
        <div class="drawbox"><span>${esc(t.after)}</span></div>
      </div>
      <p class="label" style="margin-top:4mm;">${esc(t.results)}</p>
      <table>
        <tr><th class="c" style="width:18mm;">${esc(t.cols[0])}</th><th style="width:62mm;">${esc(t.cols[1])}</th><th>${esc(t.cols[2])}</th></tr>
        ${resultRows}
      </table>
    </div>

    <div class="box accent">
      ${section(5, t.s5)}
      <p class="hint" style="font-weight:700; color:#2c2940;">${esc(t.wasRight)}</p>
      <div class="opts">${t.rightOpts.map((o) => `<span>${chk}${esc(o)}</span>`).join("")}</div>
      <p class="hint">${esc(t.why)}</p>
      ${lines(3)}
      <div class="inl" style="margin-top:2mm;">${esc(t.next)} <div class="wl"></div></div>
      <div class="starrow"><span>${esc(t.stars)}</span><span class="s">${stars(5)}</span></div>
    </div>
    ${foot}
  </div>

  <!-- 4. Log, words, certificate -->
  <div class="page">
    ${head(t, 4)}
    <h1>${esc(t.logTitle)}</h1>
    <p class="logsub">${esc(t.logSub)}</p>
    <table class="log">
      <tr>
        <th class="c" style="width:12mm;">${esc(t.logCols[0])}</th>
        <th style="width:26mm;">${esc(t.logCols[1])}</th>
        <th>${esc(t.logCols[2])}</th>
        <th class="c" style="width:36mm;">${esc(t.logCols[3])}</th>
        <th class="c" style="width:26mm;">${esc(t.logCols[4])}</th>
      </tr>
      ${logRows}
    </table>

    <div class="box">
      <h2>${esc(t.wordsTitle)}</h2>
      <ul class="words">${t.words.map(([w, d]) => `<li><b>${esc(w)}:</b> ${esc(d)}</li>`).join("")}</ul>
    </div>

    <div class="cert">
      <span class="cut">✂ ${esc(t.certKicker)}</span>
      <div class="cs">${stars(3, "6mm")}</div>
      <h3>${esc(t.certTitle)}</h3>
      <p>${esc(t.certBody)}</p>
      <div class="who"></div>
      <p>${esc(t.certBody2)}</p>
      <div class="sig">
        <div><div class="wl"></div><span>${esc(t.certDate)}</span></div>
        <div><div class="wl"></div><span>${esc(t.certSign)}</span></div>
      </div>
    </div>
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
  const htmlPath = path.join(os.tmpdir(), `experiment-journal-${lang}.html`);
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
