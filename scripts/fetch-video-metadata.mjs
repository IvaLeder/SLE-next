#!/usr/bin/env node
/**
 * Fetches YouTube metadata for every <YouTube id="..."> embedded in the posts and
 * writes it to src/lib/video-metadata.json, which YouTube.tsx turns into VideoObject
 * structured data.
 *
 * Why this exists: the WordPress site emitted VideoObject for each embed (GSC showed
 * ~124 valid items until June 2026). The Next.js rebuild dropped it and the report
 * fell to zero. VideoObject requires a real `uploadDate`, which lives only on YouTube,
 * so we fetch it once and commit the result rather than guessing from the post date.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... node scripts/fetch-video-metadata.mjs
 *   node scripts/fetch-video-metadata.mjs --dry-run     # list ids, call nothing
 *
 * Re-run after adding new videos. Ids already in the JSON are refreshed too, so the
 * file always mirrors YouTube.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const OUT = path.join(process.cwd(), "src/lib/video-metadata.json");
const API = "https://www.googleapis.com/youtube/v3/videos";

const dryRun = process.argv.includes("--dry-run");

/** Every distinct YouTube id used across the EN and HR posts. */
async function collectIds() {
  const ids = new Set();
  for (const lang of ["en", "hr"]) {
    const dir = path.join(POSTS_DIR, lang);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const src = await readFile(path.join(dir, file), "utf8");
      for (const m of src.matchAll(/<YouTube\b[^>]*?\bid="([^"]+)"/gs)) ids.add(m[1]);
    }
  }
  return [...ids].sort();
}

/** YouTube's API takes up to 50 ids per call. */
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchBatch(ids, key) {
  const url = `${API}?part=snippet,contentDetails&id=${ids.join(",")}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()).items ?? [];
}

const main = async () => {
  const ids = await collectIds();
  console.log(`Found ${ids.length} unique video ids across the posts.`);

  if (dryRun) {
    ids.forEach((id) => console.log("  " + id));
    return;
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error(
      "\nMissing YOUTUBE_API_KEY.\n" +
        "Create one at https://console.cloud.google.com/apis/credentials\n" +
        "(enable 'YouTube Data API v3' first), then re-run:\n" +
        "  YOUTUBE_API_KEY=... node scripts/fetch-video-metadata.mjs\n"
    );
    process.exitCode = 1;
    return;
  }

  const out = {};
  for (const batch of chunk(ids, 50)) {
    for (const item of await fetchBatch(batch, key)) {
      out[item.id] = {
        title: item.snippet.title,
        // Trimmed at render time; kept whole here so we can change the limit later.
        description: item.snippet.description ?? "",
        uploadDate: item.snippet.publishedAt,
        duration: item.contentDetails?.duration ?? null,
      };
    }
  }

  const missing = ids.filter((id) => !out[id]);
  if (missing.length) {
    console.warn(
      `\nWARNING: YouTube returned nothing for ${missing.length} id(s) - ` +
        `deleted, private or unlisted:\n  ${missing.join("\n  ")}\n` +
        "These will render as plain embeds with no structured data."
    );
  }

  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  await writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(sorted).length} entries to ${path.relative(process.cwd(), OUT)}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
