#!/usr/bin/env node
/**
 * Scaffold a new post in both languages with the correct frontmatter shape.
 *
 *   npm run new-post <slug-en> <slug-hr>
 *
 *   # Example:
 *   npm run new-post how-to-build-a-kaleidoscope kako-napraviti-kaleidoskop
 *
 * Both files share the same `translationKey` so the language switcher works.
 * Edit the placeholders, then `npm run validate` to confirm everything is OK.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [, , slugEn, slugHr] = process.argv;

if (!slugEn || !slugHr) {
  console.error("Usage: npm run new-post <slug-en> <slug-hr>");
  console.error("Example: npm run new-post how-to-make-volcano kako-napraviti-vulkan");
  process.exit(2);
}

if (slugEn === slugHr) {
  console.error("EN and HR slugs should differ — otherwise translation routing is ambiguous.");
  process.exit(2);
}

const POSTS_DIR = "src/content/posts";
const today = new Date().toISOString().slice(0, 10);

// One translationKey shared by both files. We use the EN slug as the key —
// it's stable and human-readable.
const translationKey = slugEn;

const template = ({ lang, slug, title, description, category, translationKey, today }) => `---
title: "${title}"
slug: "${slug}"
lang: "${lang}"
translationKey: "${translationKey}"
date: "${today}"
author: "Iva Leder"
description: "${description}"
categories:
  - ${category}
tags:
  - activity
coverImage: "/images/posts/${slug}-cover.jpg"
heroAlt: "${title}"
---

Write the article here. Use \`<YouTube id="…"/>\` to embed videos and
\`<Callout type="info">…</Callout>\` for highlighted notes.

## First step

Replace these headings with the actual steps — H2s are extracted as HowTo
schema steps for Google rich results.

## Second step

…
`;

const targets = [
  {
    lang: "en",
    slug: slugEn,
    file: join(POSTS_DIR, "en", `${slugEn}.mdx`),
    title: "REPLACE ME — English title",
    description: "REPLACE ME — 120–155 char SEO description for English.",
    category: "Science",
  },
  {
    lang: "hr",
    slug: slugHr,
    file: join(POSTS_DIR, "hr", `${slugHr}.mdx`),
    title: "ZAMIJENI ME — hrvatski naslov",
    description: "ZAMIJENI ME — 120–155 znakova SEO opisa na hrvatskom.",
    category: "Znanost",
  },
];

mkdirSync(join(POSTS_DIR, "en"), { recursive: true });
mkdirSync(join(POSTS_DIR, "hr"), { recursive: true });

for (const t of targets) {
  if (existsSync(t.file)) {
    console.error(`✗ ${t.file} already exists. Aborting (won't overwrite).`);
    process.exit(1);
  }
}

for (const t of targets) {
  writeFileSync(t.file, template({ ...t, translationKey, today }), "utf8");
  console.log(`✓ created ${t.file}`);
}

console.log(`\nBoth files share translationKey: "${translationKey}"`);
console.log("\nNext steps:");
console.log("  1. Fill in title, description, category, content");
console.log(`  2. Drop the cover image at /public/images/posts/${slugEn}-cover.jpg (and HR equivalent)`);
console.log("  3. Run `npm run validate` to check everything");
console.log("  4. Run `npm run dev` to preview");
