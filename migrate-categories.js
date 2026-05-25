#!/usr/bin/env node
/**
 * Category migration script
 * Normalises all post frontmatter to:
 *   categories: [<one canonical category>]
 *   tags:       [activity?, chemistry?, physics?, origami?, sensory?,
 *                parenting?, child-development?, milestone?, experiment?]
 *
 * Run:  node migrate-categories.js [--dry-run]
 */

const fs   = require("fs");
const path = require("path");
const matter = require("gray-matter");

const DRY = process.argv.includes("--dry-run");
const POSTS_DIR = path.join(__dirname, "src/content/posts");

// ── Canonical names ────────────────────────────────────────────────────────
const CAT = {
  en: { Science:"Science", Engineering:"Engineering", Math:"Math", Technology:"Technology", Psychology:"Psychology" },
  hr: { Science:"Znanost", Engineering:"Inženjerstvo", Math:"Matematika", Technology:"Tehnologija", Psychology:"Psihologija" },
};

// ── Per-slug overrides (slug → canonical key) ──────────────────────────────
// Used when the rules-based approach would pick the wrong category.
const OVERRIDES = {
  // Science wins over Engineering because the core concept is chemistry
  "how-to-make-homemade-rocket-vinegar-baking-soda": "Science",
  "kako-napraviti-raketu-pomocu-octa-i-sode-bikarbone": "Science",
  // Clock-making: educational goal is telling time = Math, not Engineering
  "make-cardboard-clock-learn-tell-time": "Math",
  // HR slug has diacritics + extra "i-" segment — use actual frontmatter slug
  "kako-napraviti-sat-od-kartona-i-pomoću-njega-učiti-na-sat": "Math",
  // Fractions: has both Math + Engineering in categories; Math wins on content
  "how-to-learn-fractions-fun-easy-way": "Math",
  "kako-nauciti-razlomke-na-lak-nacin": "Math",
  // Origami → Math (geometry/spatial reasoning)
  "how-to-make-paper-windmill": "Math",
  "make-origami-x-wing-star-wars": "Math",
  // HR origami windmill slug is different from filename
  "kako-napraviti-origami-vjetrenjacu-od-papira": "Math",
  "origami-x-wing-iz-zvjezdanih-ratova": "Math",
  // Coloured rice / sensory colours → Science (colour chemistry)
  "how-to-make-colored-rice": "Science",
  "make-sensory-play-colors": "Science",
  "make-colorful-milk-polarity-experiment": "Science",
  "kako-uciti-o-polaritetu": "Science",
  "najzabavniji-nacin-kako-dijete-nauciti-o-bojama": "Science",
  // Sensory items → Psychology (child development focus)
  "homemade-sensory-bottle-child-sensory-development": "Psychology",
  "how-to-make-sensory-board": "Psychology",
  "sensory-bag-child-sensorimotor-development": "Psychology",
  "sensory-sticks": "Psychology",
  "sensorimotor-activities-children": "Psychology",
  "kako-napraviti-senzornu-bocu-za-poticanje-senzomotorickog-razvoja-djeteta": "Psychology",
  "kako-napraviti-senzornu-plocu": "Psychology",
  "kako-napraviti-senzornu-vrecicu-za-poticanje-senzomotorickog-razvoja-djeteta": "Psychology",
  "senzorni-štapići": "Psychology",
  "aktivnosti-za-poticanje-senzomotorickog-razvoja": "Psychology",
  "aktivnost-za-senzomotoricki-razvoj": "Psychology",
  // Letters+numbers = Math (STEM angle)
  "learn-letters-and-numbers": "Math",
  "ucenje-abecede-brojeva": "Math",
  "zabavne-aktivnosti-s-nizovima": "Math",
  // Opinion/overview articles
  "what-is-stem-and-why-is-it-important": "Science",
  "exploring-stem-fields": "Science",
  "women-in-stem-encouraging-girls-for-stem-careers": "Psychology",
  "18-signs-gifted-child": "Psychology",
  "sto-je-stem-zasto-je-uopce-bitno": "Science",
  "istrazimo-stem-podrucja": "Science",
  "poticanje-djevojcica-na-stem-karijere": "Psychology",
  "18-znakova-nadarenosti-kod-djeteta": "Psychology",
  // Potato battery: builds an electrical circuit = Engineering
  "how-to-make-potato-battery": "Engineering",
  "baterija-od-krumpira-kako-napraviti": "Engineering",
  // Match-head rocket: building/construction focus
  "how-to-make-match-head-rocket": "Engineering",
  "kako-napraviti-raketu-od-sibica": "Engineering",   // actual slug has no diacritics
};

// Slugs that should always get the 'activity' tag even without an explicit
// "Activities" category (demonstrations, "how-to-make" guides, etc.).
const FORCE_ACTIVITY = new Set([
  "inertia-demonstration", "demonstracija-inercije",
  "the-amazing-properties-of-water", "magicne-karakteristike-vode",
  "how-to-make-match-head-rocket", "kako-napraviti-raketu-od-sibica",
  "how-to-make-origami-house", "kako-napraviti-origami-kucicu",
  "how-to-make-origami-pig", "kako-napraviti-origami-prascica",
  "how-to-make-paper-windmill", "kako-napraviti-origami-vjetrenjacu-od-papira",
  "make-origami-x-wing-star-wars", "origami-x-wing-iz-zvjezdanih-ratova",
  "homemade-sensory-bottle-child-sensory-development",
  "kako-napraviti-senzornu-bocu-za-poticanje-senzomotorickog-razvoja-djeteta",
  "how-to-make-sensory-board", "kako-napraviti-senzornu-plocu",
  "sensory-bag-child-sensorimotor-development",
  "kako-napraviti-senzornu-vrecicu-za-poticanje-senzomotorickog-razvoja-djeteta",
  "sensory-sticks", "senzorni-stapici",
  "sensorimotor-activities-children",
  "aktivnosti-za-poticanje-senzomotorickog-razvoja",
  "aktivnost-za-senzomotoricki-razvoj",
  "learn-letters-and-numbers", "ucenje-abecede-brojeva",
  "zabavne-aktivnosti-s-nizovima",
  "learn-programming-with-scratch", "ucenje-programiranja-scratch",
]);

// ── Helpers ────────────────────────────────────────────────────────────────
function lc(arr) { return (arr || []).map(c => c.toLowerCase().trim()); }

function getCategory(cats, slug, lang) {
  const key = OVERRIDES[slug];
  if (key) return CAT[lang][key];

  const c = lc(cats);
  const has = (...terms) => terms.some(t => c.some(x => x.includes(t)));

  if (has("engineering","inženjerstvo","injženerstvo","inžinerstvo")) return CAT[lang].Engineering;
  if (has("math","matematika","logika","origami"))                     return CAT[lang].Math;
  if (has("technology","tehnologija"))                                 return CAT[lang].Technology;
  if (has("science","chemistry","physics","biology",
          "kemija","fizika","biologija","znanos","zanost"))            return CAT[lang].Science;
  return CAT[lang].Psychology;
}

function getTags(cats, title, slug, existingTags) {
  const c   = lc(cats);
  const t   = title.toLowerCase();
  const has = (...terms) => terms.some(term => c.some(x => x.includes(term)));
  const tags = new Set(existingTags || []);

  // Activity
  const actFromCat   = has("activit","aktivnost");
  const actFromSlug  = FORCE_ACTIVITY.has(slug);
  const actFromTitle = /how to (make|demonstrate|create|build)|eksperiment|demonstraci|kako napraviti|kako demonstrirati/i.test(t);
  if (actFromCat || actFromSlug || actFromTitle) tags.add("activity");

  // Sub-tags
  if (has("chemistry","kemija"))                         tags.add("chemistry");
  if (has("physics","fizika"))                           tags.add("physics");
  if (has("origami"))                                    tags.add("origami");
  if (has("sensory","senzor"))                           tags.add("sensory");
  if (has("parenting","roditeljstvo"))                   tags.add("parenting");
  if (has("child development","razvoj djeteta"))         tags.add("child-development");
  if (has("first year","second year","third year",
          "prva godina","druga godina","treća godina")) tags.add("milestone");

  // Experiment sub-tag (only if also an activity)
  if (tags.has("activity") && /experiment|eksperiment|demonstraci|pokus/i.test(t))
    tags.add("experiment");

  return [...tags].sort();
}

// ── Main ───────────────────────────────────────────────────────────────────
let totalChanged = 0;

for (const lang of ["en", "hr"]) {
  const dir   = path.join(POSTS_DIR, lang);
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx") || f.endsWith(".md"));
  let changed = 0;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${lang.toUpperCase()}  (${files.length} posts)`);
  console.log("=".repeat(60));

  for (const filename of files.sort()) {
    const filePath = path.join(dir, filename);
    const raw      = fs.readFileSync(filePath, "utf8");

    // Preserve BOM if present
    const hasBOM = raw.charCodeAt(0) === 0xFEFF;
    const src    = hasBOM ? raw.slice(1) : raw;

    let parsed;
    try { parsed = matter(src); }
    catch (e) { console.error(`  PARSE ERROR: ${filename} — ${e.message}`); continue; }

    const { data, content: body } = parsed;
    if (!data.slug || !data.title) {
      console.warn(`  SKIP (missing slug/title): ${filename}`);
      continue;
    }

    const newCat  = getCategory(data.categories || [], data.slug, lang);
    const newTags = getTags(data.categories || [], data.title, data.slug, data.tags || []);

    const isAct = newTags.includes("activity");
    const oldCats = (data.categories || []).join(", ");
    console.log(`  ${isAct ? "⚡" : "  "} [${newCat.padEnd(14)}] ${data.slug}`);
    if (DRY) continue;

    // Build new frontmatter — keep all existing fields, update categories + tags
    const newData = { ...data, categories: [newCat] };
    if (newTags.length > 0) newData.tags = newTags;
    else delete newData.tags;

    const newFile = (hasBOM ? "﻿" : "") + matter.stringify(body, newData);

    if (newFile !== raw) {
      fs.writeFileSync(filePath, newFile, "utf8");
      changed++;
    }
  }

  console.log(`\n  → ${DRY ? "(dry run)" : `${changed} files written`}`);
  totalChanged += changed;
}

console.log(`\nDone. Total changed: ${totalChanged}`);
