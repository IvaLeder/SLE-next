import fs from "node:fs";
import path from "node:path";
import type { ResolvedConfig } from "./config.ts";
import type { AssetEntry, OutputFile } from "./types.ts";
import { atomicWrite, ensureDir, linkOrCopy, readJsonIfExists } from "./util/fs.ts";

/**
 * Incremental-build cache. Two parts, both under cfg.cacheDir
 * (node_modules/.cache/asset-pipeline — persisted by Vercel's build cache):
 *
 *   cache.json   source-hash → manifest entry + list of variant filenames
 *   files/       the encoded variant bytes themselves
 *
 * A source whose content hash (plus the output-affecting config hash and the
 * used/unused flag) matches the cache is never re-encoded; its variants are
 * hard-linked from files/ into the output dir. Because the output dir is
 * gitignored, this is what makes warm CI builds cheap: link instead of encode.
 */

interface CacheEntry {
  hash: string;
  /** Whether the source was article-referenced when processed — unused
   *  assets get metadata-only entries, so a usage flip must re-process. */
  used: boolean;
  entry: AssetEntry;
  /** Variant filenames stored in files/. */
  files: string[];
}

interface CacheData {
  version: number;
  configHash: string;
  assets: Record<string, CacheEntry>; // keyed by source relPath
}

const CACHE_VERSION = 2; // v2: images → assets key

/** One-shot v1 → v2 migration (field rename only) so the generic-pipeline
 *  refactor doesn't cold-start a ~200 MB encode cache. Delete once deployed
 *  caches have rolled over. */
function migrate(loaded: CacheData | null): CacheData | null {
  if (!loaded || loaded.version !== 1) return loaded;
  const v1 = loaded as CacheData & { images?: Record<string, CacheEntry> };
  return { version: CACHE_VERSION, configHash: v1.configHash, assets: v1.images ?? {} };
}

export class Cache {
  private data: CacheData;
  private readonly cacheFile: string;
  private readonly filesDir: string;

  constructor(cfg: ResolvedConfig) {
    this.cacheFile = path.join(cfg.absCacheDir, "cache.json");
    this.filesDir = path.join(cfg.absCacheDir, "files");
    ensureDir(this.filesDir);

    const loaded = migrate(readJsonIfExists<CacheData>(this.cacheFile));
    if (loaded && loaded.version === CACHE_VERSION && loaded.configHash === cfg.outputConfigHash) {
      this.data = loaded;
    } else {
      // Version/config mismatch: start fresh. Stale files/ blobs are removed
      // by prune() at the end of the run.
      this.data = { version: CACHE_VERSION, configHash: cfg.outputConfigHash, assets: {} };
    }
  }

  /** Cached result for a source, or null if content/config/usage changed. */
  get(relPath: string, hash: string, used: boolean): CacheEntry | null {
    const entry = this.data.assets[relPath];
    if (!entry || entry.hash !== hash || entry.used !== used) return null;
    // Guard against a pruned/corrupted files dir: every variant must exist.
    for (const f of entry.files) {
      if (!fs.existsSync(path.join(this.filesDir, f))) return null;
    }
    return entry;
  }

  /** Record a fresh result and persist its encoded variants into files/. */
  put(relPath: string, hash: string, used: boolean, entry: AssetEntry, outputs: OutputFile[]): void {
    for (const out of outputs) {
      atomicWrite(path.join(this.filesDir, out.name), out.data);
    }
    this.data.assets[relPath] = { hash, used, entry, files: outputs.map((o) => o.name) };
  }

  delete(relPath: string): void {
    delete this.data.assets[relPath];
  }

  /** Materialise a cached variant into the output dir (hard-link, copy as
   *  fallback). Returns false if it was already there. */
  restore(fileName: string, absOutputDir: string): boolean {
    const dest = path.join(absOutputDir, fileName);
    if (fs.existsSync(dest)) return false;
    linkOrCopy(path.join(this.filesDir, fileName), dest);
    return true;
  }

  /**
   * Drop cache entries for sources that no longer exist and delete files/
   * blobs no entry references, so the cache can't grow without bound.
   */
  prune(liveRelPaths: Set<string>): void {
    for (const relPath of Object.keys(this.data.assets)) {
      if (!liveRelPaths.has(relPath)) delete this.data.assets[relPath];
    }
    const referenced = new Set<string>();
    for (const entry of Object.values(this.data.assets)) {
      for (const f of entry.files) referenced.add(f);
    }
    for (const f of fs.readdirSync(this.filesDir)) {
      if (!referenced.has(f)) fs.rmSync(path.join(this.filesDir, f), { force: true });
    }
  }

  save(): void {
    atomicWrite(this.cacheFile, JSON.stringify(this.data));
  }

  /** Wipe everything (--clean). */
  static clear(cfg: ResolvedConfig): void {
    fs.rmSync(cfg.absCacheDir, { recursive: true, force: true });
  }
}
