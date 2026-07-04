import fs from "node:fs";
import path from "node:path";
import { safeDecode } from "./helpers";
import type { AssetEntry, AssetManifest, ImageEntry } from "./types";

export type { AssetEntry, AssetKind, AssetManifest, ImageEntry, ImageVariant, VariantFormat } from "./types";
export { ARTICLE_SIZES, baseVariants, placeholderStyle, toSrcSet } from "./helpers";

/**
 * Server-side accessor for the generated asset manifest
 * (src/lib/assets/manifest.json, produced by `npm run images`).
 *
 * Read from disk rather than statically imported so a missing manifest —
 * fresh clone, pipeline not yet run — degrades gracefully: getImage() returns
 * null and components fall back to rendering the original file, exactly like
 * the site behaved before the pipeline existed.
 *
 * Caching: in production builds the parse happens once. In dev the parsed
 * manifest is cached against the file's mtime, so `npm run images --watch`
 * results show up on reload without re-parsing ~2 MB of JSON on every
 * getImage() call (a hot article page does a dozen lookups per render).
 */

const MANIFEST_PATH = path.join(process.cwd(), "src/lib/assets/manifest.json");
const cacheEnabled = process.env.NODE_ENV === "production";

let cached: { manifest: AssetManifest | null; mtimeMs: number } | undefined;
let warned = false;

function readManifest(): AssetManifest | null {
  if (cacheEnabled && cached !== undefined) return cached.manifest;

  const stat = fs.statSync(MANIFEST_PATH, { throwIfNoEntry: false });
  if (!stat) {
    if (!warned) {
      warned = true;
      console.warn(
        "[assets] manifest not found — run `npm run images`. Falling back to unoptimized originals.",
      );
    }
    cached = { manifest: null, mtimeMs: -1 };
    return null;
  }
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.manifest;

  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as AssetManifest;
    cached = { manifest, mtimeMs: stat.mtimeMs };
  } catch {
    // Torn read while the pipeline is mid-write is theoretically impossible
    // (atomic rename), but never let a bad manifest take the site down.
    cached = { manifest: null, mtimeMs: stat.mtimeMs };
  }
  return cached.manifest;
}

/** Look up any asset by public path or bare stem. Returns null when unknown —
 *  callers must fall back to plain rendering, never throw. */
export function getAsset(key: string): AssetEntry | null {
  const manifest = readManifest();
  if (!manifest || !key) return null;

  if (key.startsWith("/")) {
    // MDX sometimes carries percent-encoded URLs for the Croatian filenames.
    return manifest.assets[key] ?? manifest.assets[safeDecode(key)] ?? null;
  }
  const src = manifest.stems[key];
  return src ? manifest.assets[src] : null;
}

/**
 * Look up an image by public path ("/images/posts/volcano.jpg") or bare stem
 * ("volcano"). Kind-checked view over getAsset() — when more asset kinds
 * exist, a video path passed to an image component returns null here.
 */
export function getImage(key: string): ImageEntry | null {
  const entry = getAsset(key);
  return entry && entry.kind === "image" ? entry : null;
}

/**
 * Like getImage(), but trimmed for serialisation to client components
 * (PostMeta.cover travels into client-rendered grids like PostList /
 * ActivitiesClient). Drops the blur data URI — the dominant colour serves as
 * the card placeholder — so ~100 serialized posts don't ship ~40 KB of blurs.
 */
export function getCardImage(key: string): ImageEntry | null {
  const entry = getImage(key);
  if (!entry) return null;
  const rest = { ...entry };
  delete rest.blurDataURL;
  return rest;
}
