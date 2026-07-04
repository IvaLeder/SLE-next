import type { ResolvedConfig } from "./config.ts";
import type { SourceIndex } from "./scan.ts";
import type { AssetManifest, ResolvedReference, Severity, SourceAsset, ValidationRules } from "./types.ts";
import { formatBytes } from "./util/log.ts";

/**
 * Content-quality checks. Everything is a warning by default (configurable in
 * asset.config.ts → validation.rules); rules set to "error" make the CLI exit
 * non-zero so CI can gate on them. Reference-existence checks overlap with
 * scripts/validate-posts.mjs on purpose — that script gates commits, this one
 * sees the whole asset corpus (unused files, duplicates, sizes) which the
 * per-post validator can't.
 *
 * Resolution (which ref matches which file, what counts as "used") comes in
 * pre-computed from scan.ts — the CLI and validation share it by construction.
 */

export interface Finding {
  rule: keyof ValidationRules;
  severity: Exclude<Severity, "off">;
  message: string;
  /** Article file for reference problems, asset path for file problems. */
  subject?: string;
}

export function validate(
  cfg: ResolvedConfig,
  sources: SourceAsset[],
  unknownFiles: string[],
  refs: ResolvedReference[],
  usedPaths: Set<string>,
  index: SourceIndex,
  manifest: AssetManifest,
): Finding[] {
  const findings: Finding[] = [];
  const rules = cfg.validation.rules;

  const add = (rule: keyof ValidationRules, message: string, subject?: string) => {
    const severity = rules[rule];
    if (severity === "off") return;
    findings.push({ rule, severity, message, subject });
  };

  const pipelineRefs = refs.filter((r) => r.pipeline);

  // ── Broken references ─────────────────────────────────────────────────
  for (const ref of pipelineRefs) {
    if (!ref.resolvedPath) {
      add("missingImage", `${ref.file} → "${ref.src}" (${ref.kind}) not found`, ref.file);
    }
  }

  // ── Missing alt text (covers use heroAlt; BeforeAfter labels itself) ──
  for (const ref of pipelineRefs) {
    if (ref.kind === "before-after") continue;
    if (ref.alt === undefined || ref.alt.trim() === "") {
      add("missingAlt", `${ref.file} → "${ref.src}" has no alt text`, ref.file);
    }
  }

  // ── Unused assets ─────────────────────────────────────────────────────
  for (const s of sources) {
    if (!usedPaths.has(s.publicPath)) {
      add("unusedImage", `${s.relPath} (${formatBytes(s.bytes)}) is referenced by no article`, s.relPath);
    }
  }

  // ── Byte-identical duplicates ─────────────────────────────────────────
  const byHash = new Map<string, string[]>();
  for (const s of sources) {
    const list = byHash.get(s.hash) ?? [];
    list.push(s.relPath);
    byHash.set(s.hash, list);
  }
  for (const [, files] of byHash) {
    if (files.length > 1) {
      add("duplicateImage", `identical content: ${files.join(" = ")}`, files[0]);
    }
  }

  // ── Stem collisions (break <ArticleImage src="stem"> lookup) ──────────
  for (const [stem, srcs] of index.ambiguousStems) {
    add("duplicateStem", `stem "${stem}" is ambiguous: ${srcs.join(", ")}`, stem);
  }

  // ── Size checks ───────────────────────────────────────────────────────
  const { maxSourceBytes, minInlineWidth, minCoverWidth } = cfg.validation;
  for (const s of sources) {
    if (s.bytes > maxSourceBytes) {
      add("oversizedSource", `${s.relPath} is ${formatBytes(s.bytes)} on disk (max ${formatBytes(maxSourceBytes)})`, s.relPath);
    }
  }
  // Undersized: only flag assets that are actually used, with the threshold
  // depending on how they're used (covers need more pixels than inline).
  const flaggedSmall = new Set<string>();
  for (const ref of pipelineRefs) {
    if (!ref.resolvedPath || flaggedSmall.has(`${ref.resolvedPath}:${ref.kind}`)) continue;
    const entry = manifest.assets[ref.resolvedPath];
    if (!entry || entry.format === "svg") continue; // vectors scale
    const min = ref.kind === "cover" ? minCoverWidth : minInlineWidth;
    if (entry.width < min) {
      flaggedSmall.add(`${ref.resolvedPath}:${ref.kind}`);
      add(
        "undersizedImage",
        `${ref.resolvedPath} is ${entry.width}px wide but used as ${ref.kind} (recommended ≥ ${min}px)`,
        ref.resolvedPath,
      );
    }
  }

  // ── Unsupported formats ───────────────────────────────────────────────
  for (const s of sources.filter((x) => !x.supported)) {
    add("unsupportedFormat", `${s.relPath}: ${s.ext} is served as-is (no variants). Convert GIFs to animated WebP.`, s.relPath);
  }
  for (const f of unknownFiles) {
    add("unsupportedFormat", `${f}: not a supported asset format`, f);
  }

  // ── Filenames that break URLs/srcset ──────────────────────────────────
  for (const s of sources) {
    if (/[\s,"']/.test(s.relPath)) {
      add("badFilename", `${s.relPath} contains spaces/commas/quotes — breaks srcset parsing`, s.relPath);
    }
  }

  return findings;
}
