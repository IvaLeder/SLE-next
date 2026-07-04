import os from "node:os";
import path from "node:path";
import userConfig from "../../asset.config.ts";
import type { AssetPipelineConfig } from "./types.ts";
import { stableHash } from "./util/hash.ts";

/** Bump when processing CODE changes what gets encoded (not just config) —
 *  it feeds the cache key, so old cached outputs are correctly discarded. */
const PIPELINE_VERSION = 3;

/** Config with paths resolved to absolute and derived values filled in. */
export interface ResolvedConfig extends AssetPipelineConfig {
  root: string;
  absSourceDir: string;
  absOutputDir: string;
  absManifestPath: string;
  absCacheDir: string;
  absContentDirs: string[];
  resolvedConcurrency: number;
  /**
   * Hash of every setting that changes encoded bytes. Part of the cache key,
   * so tweaking quality/widths correctly invalidates all cached variants —
   * while validation-only changes don't.
   */
  outputConfigHash: string;
}

export function loadConfig(root: string = process.cwd()): ResolvedConfig {
  return resolveConfig(userConfig, root);
}

/** Separated from loadConfig so tests can resolve a synthetic config. */
export function resolveConfig(cfg: AssetPipelineConfig, root: string): ResolvedConfig {
  validate(cfg);

  const concurrency =
    cfg.concurrency > 0 ? cfg.concurrency : Math.min(8, Math.max(2, os.cpus().length));
  const img = cfg.images;

  return {
    ...cfg,
    root,
    absSourceDir: path.resolve(root, cfg.sourceDir),
    absOutputDir: path.resolve(root, cfg.outputDir),
    absManifestPath: path.resolve(root, cfg.manifestPath),
    absCacheDir: path.resolve(root, cfg.cacheDir),
    absContentDirs: cfg.contentDirs.map((d) => path.resolve(root, d)),
    resolvedConcurrency: concurrency,
    // NOTE: the payload shape is part of the cache contract — reordering or
    // renaming keys re-encodes the entire corpus. Extend, don't reshape.
    outputConfigHash: stableHash({
      pipelineVersion: PIPELINE_VERSION,
      widths: img.widths,
      maxWidth: img.maxWidth,
      quality: img.quality,
      pngPalette: img.pngPalette,
      placeholder: img.placeholder,
      formats: { avif: img.formats.avif, webp: img.formats.webp },
      svgOptimize: img.svg.optimize,
      publicOutputPrefix: cfg.publicOutputPrefix,
    }).slice(0, 12),
  };
}

function validate(cfg: AssetPipelineConfig): void {
  const problems: string[] = [];
  const img = cfg.images;
  if (!img.widths.length) problems.push("images.widths must not be empty");
  if (img.widths.some((w) => !Number.isInteger(w) || w <= 0)) {
    problems.push("images.widths must be positive integers");
  }
  if (img.maxWidth <= 0) problems.push("images.maxWidth must be positive");
  for (const [k, v] of Object.entries(img.quality)) {
    if (v < 1 || v > 100) problems.push(`images.quality.${k} must be 1–100`);
  }
  if (img.placeholder.width < 4 || img.placeholder.width > 64) {
    problems.push("images.placeholder.width should be 4–64 (it's a tiny preview)");
  }
  if (problems.length) {
    throw new Error(`Invalid asset.config.ts:\n  - ${problems.join("\n  - ")}`);
  }
}
