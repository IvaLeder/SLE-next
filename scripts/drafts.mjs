#!/usr/bin/env node
/**
 * Manage draft posts (frontmatter `draft: true` + `previewToken`).
 *
 *   npm run drafts                        # list drafts + secret preview links
 *   npm run publish-post <lang> <slug>    # publish a draft (en|hr)
 *
 * Publishing removes `draft` + `previewToken` and bumps `date` to today —
 * done with line-level edits inside the frontmatter block (NOT a YAML
 * re-serialize) so the rest of the file stays byte-identical.
 *
 * Like validate-posts.mjs: no deps beyond gray-matter.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";

const POSTS_DIR = "src/content/posts";
const SITE_URL = "https://stemlittleexplorers.com";
const LANGS = ["en", "hr"];

function draftsOf(lang) {
  const dir = join(POSTS_DIR, lang);
  const out = [];
  for (const filename of readdirSync(dir).sort()) {
    if (!/\.mdx?$/.test(filename)) continue;
    const file = join(dir, filename);
    let data;
    try {
      ({ data } = matter(readFileSync(file, "utf8")));
    } catch {
      continue; // unparseable frontmatter is validate-posts' problem
    }
    if (data.draft === true) out.push({ file, data });
  }
  return out;
}

function list() {
  let total = 0;
  for (const lang of LANGS) {
    for (const { file, data } of draftsOf(lang)) {
      total++;
      console.log(`\n${basename(file)}  (${lang})`);
      console.log(`  title:   ${data.title ?? "—"}`);
      if (data.previewToken) {
        console.log(`  preview: ${SITE_URL}/${lang}/draft/${data.slug}?key=${data.previewToken}`);
        console.log(`  local:   http://localhost:3000/${lang}/draft/${data.slug}?key=${data.previewToken}`);
      } else {
        console.log("  preview: ✗ missing previewToken — run `npm run validate` for details");
      }
    }
  }
  console.log(total === 0 ? "No drafts." : `\n${total} draft(s). Preview links are secret — share only with contributors.`);
}

function publish(lang, slug) {
  if (!LANGS.includes(lang) || !slug) {
    console.error("Usage: npm run publish-post <en|hr> <slug>");
    process.exit(2);
  }
  const match = draftsOf(lang).find(({ data }) => data.slug === slug);
  if (!match) {
    console.error(`✗ No draft with slug "${slug}" in ${POSTS_DIR}/${lang}/`);
    process.exit(1);
  }

  const raw = readFileSync(match.file, "utf8");
  const fmMatch = raw.match(/^(﻿?---\n)([\s\S]*?)(\n---\n)/);
  if (!fmMatch) {
    console.error(`✗ Couldn't locate the frontmatter block in ${match.file}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const fmLines = fmMatch[2].split("\n").filter(
    (line) => !/^draft\s*:/.test(line) && !/^previewToken\s*:/.test(line)
  );
  const dateIdx = fmLines.findIndex((line) => /^date\s*:/.test(line));
  if (dateIdx === -1) {
    console.error(`✗ No \`date:\` line in ${match.file} frontmatter — fix the file first`);
    process.exit(1);
  }
  fmLines[dateIdx] = `date: "${today}"`;

  const updated =
    fmMatch[1] + fmLines.join("\n") + fmMatch[3] + raw.slice(fmMatch[0].length);
  writeFileSync(match.file, updated, "utf8");

  console.log(`✓ Published ${match.file} (date set to ${today})`);
  console.log(`  Live URL after deploy: ${SITE_URL}/${lang}/${slug}`);
  console.log("  The old preview link now 404s.");
  console.log("  Run `npm run validate`, then commit.");
}

const [, , cmd, ...rest] = process.argv;
if (cmd === "list" || cmd === undefined) list();
else if (cmd === "publish") publish(rest[0], rest[1]);
else {
  console.error(`Unknown command "${cmd}". Use: list | publish <lang> <slug>`);
  process.exit(2);
}
