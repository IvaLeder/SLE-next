import type { ResolvedConfig } from "./config.ts";
import type { AssetEntry, AssetManifest } from "./types.ts";
import { atomicWrite } from "./util/fs.ts";

/**
 * Assembles and writes the JSON manifest — the only artifact the frontend
 * reads. Keys are sorted so output is deterministic (same inputs → same
 * bytes, modulo the timestamp).
 */
export function buildManifest(entries: AssetEntry[]): AssetManifest {
  const assets: Record<string, AssetEntry> = {};
  for (const entry of [...entries].sort((a, b) => (a.src < b.src ? -1 : 1))) {
    // Backfill `kind` for entries restored from a pre-refactor cache — the
    // frontend discriminates on it. (Remove alongside the cache v1 migration.)
    assets[entry.src] = entry.kind ? entry : { ...entry, kind: "image" };
  }

  // stem → src index for `<ArticleImage src="volcano">`. Ambiguous stems
  // (same name, different extension/folder) are dropped; validation reports
  // them so authors can rename rather than silently get the wrong file.
  const stemCount = new Map<string, number>();
  for (const entry of entries) {
    stemCount.set(entry.stem, (stemCount.get(entry.stem) ?? 0) + 1);
  }
  const stems: Record<string, string> = {};
  for (const entry of entries) {
    if (stemCount.get(entry.stem) === 1) stems[entry.stem] = entry.src;
  }

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    assets,
    stems: Object.fromEntries(Object.entries(stems).sort(([a], [b]) => (a < b ? -1 : 1))),
  };
}

export function writeManifest(manifest: AssetManifest, cfg: ResolvedConfig): void {
  atomicWrite(cfg.absManifestPath, JSON.stringify(manifest));
}
