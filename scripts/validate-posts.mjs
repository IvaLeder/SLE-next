#!/usr/bin/env node
/**
 * Validate every MDX post against the conventions used in this repo.
 * Run before committing new posts (or wire into CI).
 *
 *   node scripts/validate-posts.mjs           # report errors + warnings
 *   node scripts/validate-posts.mjs --strict  # fail (exit 1) on warnings too
 *   node scripts/validate-posts.mjs --quiet   # only print problems + summary
 *
 * Exit codes: 0 = clean, 1 = errors (or warnings under --strict).
 *
 * IMPORTANT: this script has no runtime deps beyond gray-matter (already a
 * production dep). Don't add others — keep it cheap to run in CI.
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import matter from "gray-matter";

// ────────────────────────────────────────────────────────────────────────────
// Source of truth — keep aligned with src/lib/categories.ts and authors.ts
// ────────────────────────────────────────────────────────────────────────────
const CANONICAL_CATEGORIES = {
  en: ["Science", "Engineering", "Math", "Technology", "Psychology"],
  hr: ["Znanost", "Inženjerstvo", "Matematika", "Tehnologija", "Psihologija"],
};

const KNOWN_TAGS = new Set([
  "activity",
  "chemistry",
  "physics",
  "origami",
  "sensory",
  "parenting",
  "child-development",
  "milestone",
  "experiment",
  "coding",
]);

const KNOWN_AUTHORS = new Set(["Iva Leder", "Vedran Leder"]);

// MDX components registered in src/components/mdx/index.tsx.
// Any <Tag …/> in MDX whose name is uppercase and NOT in this set is unknown
// and will fail at build time under SSG.
const KNOWN_MDX_COMPONENTS = new Set([
  "YouTube",
  "Subscribe",
  "Callout",
  "Image",
  "Figure",
  "Materials",
  "Material",
  "NameInBinary",
  "CaesarCipher",
  "TowerOfHanoi",
  "FractionVisualizer",
  "FindBirthdayInPi",
  "MorseCode",
  "ActivityInfo",
  "Steps",
  "Step",
  "Prediction",
  "PredictionOption",
  "PredictionResult",
  "KeyTakeaways",
  "FAQ",
  "Question",
  "Timer",
  "BeforeAfter",
  "Printable",
  "MilestoneChecklist",
  "Milestone",
  "Term",
]);

const POSTS_DIR  = "src/content/posts";
const PUBLIC_DIR = "public";

// ────────────────────────────────────────────────────────────────────────────
// Reporter
// ────────────────────────────────────────────────────────────────────────────
const STRICT = process.argv.includes("--strict");
const QUIET  = process.argv.includes("--quiet");

const findings = []; // { level: "error" | "warn", file, msg }

function error(file, msg) { findings.push({ level: "error", file, msg }); }
function warn (file, msg) { findings.push({ level: "warn",  file, msg }); }

function relPath(p) { return p.replace(process.cwd() + "/", ""); }

// ────────────────────────────────────────────────────────────────────────────
// Per-file checks
// ────────────────────────────────────────────────────────────────────────────
function checkPost(filePath, lang) {
  const filename     = basename(filePath);
  const expectedSlug = basename(filename, extname(filename));
  const rawText      = readFileSync(filePath, "utf8");

  // Strip BOM (some old files have it)
  const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText;

  let parsed;
  try {
    parsed = matter(text);
  } catch (e) {
    error(filePath, `Frontmatter is unparseable — ${e.message}`);
    return { data: null, content: null };
  }

  const { data, content } = parsed;

  // ── Required scalar fields ──────────────────────────────────────────────
  for (const field of ["title", "date", "slug", "lang", "translationKey"]) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
      error(filePath, `Missing required frontmatter field: \`${field}\``);
    }
  }

  // ── Required array field ────────────────────────────────────────────────
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    error(filePath, "Missing or empty \`categories\` (must be a non-empty array)");
  }

  // Stop early if scalars are missing — most downstream checks need them.
  if (!data.title || !data.date || !data.slug || !data.lang) return { data, content };

  // ── lang sanity ─────────────────────────────────────────────────────────
  if (data.lang !== "en" && data.lang !== "hr") {
    error(filePath, `\`lang\` must be "en" or "hr", got "${data.lang}"`);
  }
  if (data.lang !== lang) {
    error(filePath, `\`lang: ${data.lang}\` doesn't match folder \`${lang}/\``);
  }

  // ── slug matches filename ───────────────────────────────────────────────
  if (data.slug !== expectedSlug) {
    error(
      filePath,
      `\`slug: "${data.slug}"\` doesn't match filename "${expectedSlug}". ` +
        `Either rename the file or update the slug — these MUST match for routing to work.`
    );
  }

  // ── date parseable ──────────────────────────────────────────────────────
  if (data.date && isNaN(new Date(data.date).getTime())) {
    error(filePath, `\`date: ${data.date}\` is not a valid date`);
  }

  // ── dateModified sanity (optional field) ────────────────────────────────
  if (data.dateModified) {
    const mod = new Date(data.dateModified).getTime();
    if (isNaN(mod)) {
      error(filePath, `\`dateModified: ${data.dateModified}\` is not a valid date`);
    } else {
      // dateModified must be ≥ date (you can't "modify" before you publish)
      if (!isNaN(new Date(data.date).getTime()) && mod < new Date(data.date).getTime()) {
        error(
          filePath,
          `\`dateModified: ${data.dateModified}\` is before \`date: ${data.date}\` — likely a typo.`
        );
      }
      // dateModified shouldn't be in the future (more than 1 day grace for timezones)
      if (mod - Date.now() > 24 * 60 * 60 * 1000) {
        error(
          filePath,
          `\`dateModified: ${data.dateModified}\` is in the future — likely a typo.`
        );
      }
    }
  }

  // ── Draft workflow ──────────────────────────────────────────────────────
  // A draft MUST carry a strong previewToken — it's the only thing gating the
  // /{lang}/draft/{slug} preview route. A published post carrying a leftover
  // token is harmless (the route only serves draft: true) but stale.
  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    error(filePath, `\`draft: ${JSON.stringify(data.draft)}\` must be a boolean — anything else is ambiguous.`);
  }
  if (data.draft === true) {
    if (!data.previewToken || String(data.previewToken).trim().length < 16) {
      error(
        filePath,
        "`draft: true` requires a `previewToken` of at least 16 chars — " +
          "scaffold with `npm run new-post -- --draft` or generate one via `openssl rand -hex 16`."
      );
    }
  } else if (data.previewToken) {
    warn(filePath, "`previewToken` set on a published post — leftover from the draft phase; remove it.");
  }

  // ── Category must be canonical ──────────────────────────────────────────
  if (Array.isArray(data.categories)) {
    const valid = CANONICAL_CATEGORIES[lang] ?? [];
    const matches = data.categories.filter((c) => valid.includes(c));
    if (matches.length === 0) {
      error(
        filePath,
        `No canonical category found in \`categories: ${JSON.stringify(data.categories)}\`. ` +
          `Must include exactly one of: ${valid.join(", ")}`
      );
    } else if (matches.length > 1) {
      warn(
        filePath,
        `${matches.length} canonical categories found (${matches.join(", ")}); ` +
          `prefer exactly one — the first one wins for breadcrumbs and routing.`
      );
    }
  }

  // ── Tags must be from known set ─────────────────────────────────────────
  if (Array.isArray(data.tags)) {
    for (const t of data.tags) {
      if (!KNOWN_TAGS.has(t)) {
        warn(
          filePath,
          `Unknown tag "${t}". Known tags: ${[...KNOWN_TAGS].join(", ")}. ` +
            `Add to KNOWN_TAGS in this script if intentional.`
        );
      }
    }
  }

  // ── Author exists in directory ──────────────────────────────────────────
  if (data.author && !KNOWN_AUTHORS.has(data.author)) {
    warn(
      filePath,
      `Author "${data.author}" not in src/lib/authors.ts — bio will not render. ` +
        `Add the author or fix the spelling.`
    );
  }

  // ── description recommended for SEO ─────────────────────────────────────
  if (!data.description || !data.description.trim()) {
    warn(
      filePath,
      "Missing \`description\` — meta description will be auto-derived from content. " +
        "Hand-writing it gives much better SEO and social previews."
    );
  } else if (data.description.length > 160) {
    warn(
      filePath,
      `description is ${data.description.length} chars — Google truncates at ~155. Shorten.`
    );
  } else if (data.description.length < 50) {
    warn(filePath, `description is only ${data.description.length} chars — aim for 120-155.`);
  }

  // ── coverImage if set must exist on disk ────────────────────────────────
  if (data.coverImage) {
    // Strip leading slash for filesystem join
    const onDisk = join(PUBLIC_DIR, data.coverImage.replace(/^\//, ""));
    if (!existsSync(onDisk)) {
      error(filePath, `coverImage points to "${data.coverImage}" but file doesn't exist at \`${relPath(onDisk)}\``);
    } else if (!data.heroAlt) {
      warn(filePath, "coverImage is set but \`heroAlt\` is missing — falls back to title (bad a11y).");
    }
  } else {
    warn(filePath, "No \`coverImage\` — PostCard will render the placeholder SVG.");
  }

  // ── MDX content checks ──────────────────────────────────────────────────
  checkMdxContent(filePath, content);

  return { data, content };
}

function checkMdxContent(filePath, content) {
  // Strip MDX/JSX comments ({/* … */}) and HTML comments (<!-- … -->) before
  // scanning — otherwise example/TODO code in comments triggers false positives.
  const cleaned = content
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Find every uppercase JSX-like component tag.
  // Matches both <Foo …> and <Foo /> — not closing tags.
  const tagRegex = /<([A-Z][A-Za-z0-9]*)\b/g;
  const found = new Set();
  let m;
  while ((m = tagRegex.exec(cleaned)) !== null) found.add(m[1]);

  for (const tag of found) {
    if (!KNOWN_MDX_COMPONENTS.has(tag)) {
      error(
        filePath,
        `MDX uses <${tag}> but no such component is registered in src/components/mdx/index.tsx. ` +
          `Known components: ${[...KNOWN_MDX_COMPONENTS].join(", ")}. ` +
          `Either fix the typo or register the component.`
      );
    }
  }

  // Detect truncated YouTube ids — a real id is 11 base64-url chars.
  const ytRegex = /<YouTube[^>]*\bid=["']([^"']*)["']/g;
  while ((m = ytRegex.exec(cleaned)) !== null) {
    const id = m[1];
    if (id.length < 10 || id.length > 12) {
      error(
        filePath,
        `<YouTube id="${id}"> — ids should be 11 characters; this looks truncated or malformed.`
      );
    }
  }

  // Find ![alt](src "optional title") markdown image refs and check the file exists.
  // Markdown allows an optional title after the URL: ![alt](src "title") — strip it.
  const imgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  while ((m = imgRegex.exec(cleaned)) !== null) {
    // Strip the optional title (anything after a space + quote) and trim whitespace
    const src = m[1].replace(/\s+["'][^"']*["']\s*$/, "").trim();
    if (!src || src.startsWith("http") || src.startsWith("data:")) continue;
    const onDisk = src.startsWith("/")
      ? join(PUBLIC_DIR, src.replace(/^\//, ""))
      : join(PUBLIC_DIR, "images/posts", src.replace(/^\.?\//, ""));
    if (!existsSync(onDisk)) {
      error(filePath, `Image reference "${src}" not found at \`${relPath(onDisk)}\``);
    }
  }

  // <Figure src="…" /> — same on-disk check for captioned images. (Raw <img>
  // used to escape validation entirely; <Figure> brings it back under coverage.)
  const figRegex = /<Figure\b[^>]*?\bsrc=["']([^"']+)["']/g;
  while ((m = figRegex.exec(cleaned)) !== null) {
    const src = m[1].trim();
    if (!src || src.startsWith("http") || src.startsWith("data:")) continue;
    const onDisk = src.startsWith("/")
      ? join(PUBLIC_DIR, src.replace(/^\//, ""))
      : join(PUBLIC_DIR, "images/posts", src.replace(/^\.?\//, ""));
    if (!existsSync(onDisk)) {
      error(filePath, `<Figure> src "${src}" not found at \`${relPath(onDisk)}\``);
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Cross-file checks
// ────────────────────────────────────────────────────────────────────────────
function checkTranslationPairing(allPosts) {
  const byKey = { en: new Map(), hr: new Map() };
  const slugCounts = { en: new Map(), hr: new Map() };

  for (const { file, data, lang } of allPosts) {
    if (!data) continue;

    // translationKey pairing
    if (data.translationKey) {
      const map = byKey[lang];
      if (map.has(data.translationKey)) {
        error(
          file,
          `Duplicate translationKey "${data.translationKey}" within ${lang} — ` +
            `also in ${relPath(map.get(data.translationKey).file)}`
        );
      } else {
        map.set(data.translationKey, { file, draft: data.draft === true });
      }
    }

    // duplicate slugs in same language
    if (data.slug) {
      const counts = slugCounts[lang];
      counts.set(data.slug, (counts.get(data.slug) ?? 0) + 1);
    }
  }

  // Every EN key should have an HR pair (and vice versa). Drafts are exempt —
  // writing one language first IS the draft workflow.
  for (const [key, { file, draft }] of byKey.en) {
    if (!draft && !byKey.hr.has(key)) {
      warn(file, `translationKey "${key}" has no HR counterpart — language switcher will fall back to /hr.`);
    }
  }
  for (const [key, { file, draft }] of byKey.hr) {
    if (!draft && !byKey.en.has(key)) {
      warn(file, `translationKey "${key}" has no EN counterpart — language switcher will fall back to /en.`);
    }
  }

  // Duplicate slugs
  for (const lang of ["en", "hr"]) {
    for (const [slug, count] of slugCounts[lang]) {
      if (count > 1) {
        error(`(${lang}) slug:${slug}`, `Slug "${slug}" appears in ${count} ${lang} posts — must be unique.`);
      }
    }
  }
}

// Tags are language-neutral ASCII slugs (display labels are localised at render
// time — see src/lib/tags.ts), so a translation pair should carry the SAME set
// of tags. Drift means the same article shows different topic chips / appears on
// different tag pages per language. Reported once per pair, on the EN file.
function checkTagParity(allPosts) {
  const byKey = new Map(); // translationKey → { en?, hr? } each { file, tags:Set }

  for (const { file, data, lang } of allPosts) {
    if (!data || !data.translationKey) continue;
    const tags = new Set((data.tags ?? []).map((t) => String(t).trim().toLowerCase()));
    const entry = byKey.get(data.translationKey) ?? {};
    entry[lang] = { file, tags };
    byKey.set(data.translationKey, entry);
  }

  for (const [, { en, hr }] of byKey) {
    if (!en || !hr) continue; // missing counterpart is handled by the orphan check
    const onlyEn = [...en.tags].filter((t) => !hr.tags.has(t));
    const onlyHr = [...hr.tags].filter((t) => !en.tags.has(t));
    if (onlyEn.length === 0 && onlyHr.length === 0) continue;

    const parts = [];
    if (onlyEn.length) parts.push(`only in EN: ${onlyEn.join(", ")}`);
    if (onlyHr.length) parts.push(`only in HR: ${onlyHr.join(", ")}`);
    warn(
      en.file,
      `Tag mismatch with HR counterpart (${relPath(hr.file)}) — ${parts.join("; ")}. ` +
        `Tags are language-neutral slugs and should match across a translation pair.`
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// In-page anchor links must resolve to a real heading id
//
// Heading ids on the rendered page are produced by `rehype-slug` (github-slugger).
// We re-implement that slug algorithm here (faithful for the heading text this
// repo uses — verified against github-slugger across the whole corpus) so we can
// check that every internal link's `#fragment` actually points at a heading.
// This catches the old WordPress-style `#Capitalised%20Heading` anchors, which
// silently jump to the top of the page instead of the section.
// ────────────────────────────────────────────────────────────────────────────

// One github-slugger-compatible slug. Keeps letters, marks, decimal digits,
// letter-numbers, underscore and hyphen; lowercases; spaces → hyphens; strips
// everything else. Does NOT collapse repeats (so "a - b" → "a---b"), matching
// github-slugger exactly.
function slugBase(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{Nd}\p{Nl} _-]/gu, "")
    .replace(/ /g, "-");
}

// A per-document slugger with github-slugger's duplicate-suffixing (-1, -2, …).
function makeSlugger() {
  const seen = Object.create(null);
  return (text) => {
    const base = slugBase(text);
    let result = base;
    while (result in seen) {
      seen[base] = (seen[base] || 0) + 1;
      result = `${base}-${seen[base]}`;
    }
    seen[result] = 0;
    return result;
  };
}

// Collect the set of heading ids a post's body will render (ATX headings only,
// skipping fenced code blocks — a `#` inside ``` is not a heading).
function headingIdsOf(content) {
  const slugger = makeSlugger();
  const ids = new Set();
  let fenced = false;
  for (const line of content.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    ids.add(slugger(m[1]));
  }
  return ids;
}

function checkInternalAnchors(allPosts) {
  // Index every post by "lang/slug" → set of heading ids it renders.
  const idIndex = new Map();
  for (const { data, content } of allPosts) {
    if (!data || !content || !data.slug || !data.lang) continue;
    idIndex.set(`${data.lang}/${data.slug}`, headingIdsOf(content));
  }

  for (const { file, data, content, lang } of allPosts) {
    if (!data || !content || !data.slug) continue;
    const selfKey = `${lang}/${data.slug}`;

    // Strip comments first (same as checkMdxContent) so example links in
    // comments don't trip the check.
    const cleaned = content
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Markdown links: ](url) or ](url "title"). URLs hold no spaces/parens.
    const linkRe = /\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
    let m;
    while ((m = linkRe.exec(cleaned)) !== null) {
      const href = m[1];
      const hashIdx = href.indexOf("#");
      if (hashIdx === -1) continue;                 // no fragment — not our concern
      const rawFrag = href.slice(hashIdx + 1);
      if (!rawFrag) continue;                        // bare "#"
      const pathPart = href.slice(0, hashIdx);
      if (/^[a-z]+:/i.test(pathPart)) continue;      // external (http:, mailto:, …)

      let fragment;
      try { fragment = decodeURIComponent(rawFrag); } catch { fragment = rawFrag; }

      // Resolve the target post. "" = same page; otherwise only single-segment
      // post paths (/en/<slug>) — category/tag/author/about/etc. are skipped
      // because we don't index their heading ids here.
      let key;
      if (pathPart === "") {
        key = selfKey;
      } else {
        const mt = pathPart.match(/^\/(en|hr)\/([^/]+)\/?$/);
        if (!mt) continue;
        key = `${mt[1]}/${mt[2]}`;
      }

      const ids = idIndex.get(key);
      if (!ids) continue;                            // unknown/non-post target — out of scope

      if (!ids.has(fragment)) {
        error(
          file,
          `Broken in-page anchor \`#${rawFrag}\` in link \`${href}\` — ` +
            `no heading in ${key} has id "${fragment}". ` +
            `Anchor fragments must match a rehype-slug heading id ` +
            `(lowercase, spaces→hyphens, punctuation stripped; e.g. \`#what-is-polarity\`).`
        );
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
function main() {
  const allPosts = [];

  for (const lang of ["en", "hr"]) {
    const dir = join(POSTS_DIR, lang);
    if (!statSync(dir, { throwIfNoEntry: false })) {
      error(dir, "Directory does not exist");
      continue;
    }
    for (const filename of readdirSync(dir).sort()) {
      if (!/\.mdx?$/.test(filename)) continue;
      const file = join(dir, filename);
      const { data, content } = checkPost(file, lang);
      allPosts.push({ file, data, content, lang });
    }
  }

  checkTranslationPairing(allPosts);
  checkTagParity(allPosts);
  checkInternalAnchors(allPosts);

  // ── Report ──────────────────────────────────────────────────────────────
  const errors = findings.filter((f) => f.level === "error");
  const warns  = findings.filter((f) => f.level === "warn");

  // Group by file for readable output
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  if (!QUIET || findings.length > 0) {
    for (const [file, items] of [...byFile.entries()].sort()) {
      console.log(`\n  ${relPath(file)}`);
      for (const it of items) {
        const tag = it.level === "error" ? "ERR " : "WARN";
        console.log(`    ${tag}  ${it.msg}`);
      }
    }
  }

  const total = allPosts.length;
  console.log(
    `\n${total} posts checked  —  ${errors.length} error(s), ${warns.length} warning(s)`
  );

  const failed = errors.length > 0 || (STRICT && warns.length > 0);
  process.exit(failed ? 1 : 0);
}

main();
