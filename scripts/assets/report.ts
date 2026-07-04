import type { Finding } from "./validate.ts";
import type { AssetEntry, ProcessFailure } from "./types.ts";
import { color, formatBytes, formatMs, log } from "./util/log.ts";

/**
 * End-of-run summary. "Before" is the byte size of the source files; "after"
 * compares what a browser would actually download — the largest variant per
 * format — since that's the number that matters for page weight.
 */

export interface RunStats {
  found: number;
  processed: number;
  fromCache: number;
  passthrough: number;
  failed: ProcessFailure[];
  variantsGenerated: number;
  variantsCopied: number;
  durationMs: number;
  dryRun: boolean;
}

function sumTopVariant(entries: AssetEntry[], format: "avif" | "webp"): { bytes: number; count: number } {
  let bytes = 0;
  let count = 0;
  for (const e of entries) {
    const ladder = e.variants[format];
    if (ladder?.length) {
      bytes += ladder[ladder.length - 1].bytes;
      count++;
    }
  }
  return { bytes, count };
}

export function printReport(stats: RunStats, entries: AssetEntry[], findings: Finding[]): void {
  const line = color.dim("─".repeat(62));
  console.log(`\n${line}`);
  console.log(color.bold(stats.dryRun ? "  Asset pipeline — dry run" : "  Asset pipeline"));
  console.log(line);

  const row = (label: string, value: string) =>
    console.log(`  ${label.padEnd(24)}${value}`);

  row("assets found", String(stats.found));
  row("processed", color.green(String(stats.processed)));
  row("unchanged (cache)", color.dim(String(stats.fromCache)));
  if (stats.passthrough) row("metadata-only", `${stats.passthrough} ${color.dim("(unused/gif — no variants)")}`);
  if (stats.failed.length) row("failed", color.red(String(stats.failed.length)));
  row("variants generated", String(stats.variantsGenerated));
  if (stats.variantsCopied) row("restored from cache", String(stats.variantsCopied));

  // Size comparison over everything with variants (not just this run's work),
  // since that's the site-wide story.
  const withVariants = entries.filter((e) => !e.passthrough && e.format !== "svg");
  const sourceBytes = withVariants.reduce((n, e) => n + e.bytes, 0);
  const own = withVariants.reduce((n, e) => {
    const ladder = e.variants[e.format as "jpeg" | "png" | "webp" | "avif"];
    return n + (ladder?.length ? ladder[ladder.length - 1].bytes : e.bytes);
  }, 0);
  const webp = sumTopVariant(withVariants, "webp");
  const avif = sumTopVariant(withVariants, "avif");
  const pct = (after: number) => {
    if (sourceBytes <= 0) return "—";
    const saved = Math.round((1 - after / sourceBytes) * 100);
    return saved >= 0 ? `−${saved}%` : `+${-saved}%`;
  };

  if (withVariants.length) {
    console.log(line);
    row("source size", formatBytes(sourceBytes));
    row("optimized (same fmt)", `${formatBytes(own)}  ${color.green(pct(own))}`);
    if (webp.count) row("webp", `${formatBytes(webp.bytes)}  ${color.green(pct(webp.bytes))}`);
    if (avif.count) row("avif", `${formatBytes(avif.bytes)}  ${color.green(pct(avif.bytes))}`);
    console.log(color.dim("  (full-width variants; browsers usually fetch smaller rungs)"));
  }

  // ── Warnings/errors, grouped by rule so 400 unused files ≠ 400 lines ──
  if (findings.length) {
    console.log(line);
    const byRule = new Map<string, Finding[]>();
    for (const f of findings) {
      const list = byRule.get(f.rule) ?? [];
      list.push(f);
      byRule.set(f.rule, list);
    }
    for (const [rule, list] of byRule) {
      const isError = list[0].severity === "error";
      const tag = isError ? color.red(`✗ ${rule}`) : color.yellow(`⚠ ${rule}`);
      console.log(`  ${tag} ${color.dim(`(${list.length})`)}`);
      const shown = log.verbose ? list : list.slice(0, 5);
      for (const f of shown) console.log(color.dim(`      ${f.message}`));
      if (!log.verbose && list.length > shown.length) {
        console.log(color.dim(`      … +${list.length - shown.length} more (run with --verbose)`));
      }
    }
  }

  if (stats.failed.length) {
    console.log(line);
    for (const f of stats.failed) {
      console.log(`  ${color.red("✗")} ${f.relPath}: ${f.message}`);
    }
  }

  console.log(line);
  const warnings = findings.filter((f) => f.severity === "warn").length;
  const errors = findings.filter((f) => f.severity === "error").length + stats.failed.length;
  const status =
    errors > 0
      ? color.red(`done with ${errors} error(s)`)
      : warnings > 0
        ? color.yellow(`done with ${warnings} warning(s)`)
        : color.green("done");
  console.log(`  ${status} in ${formatMs(stats.durationMs)}\n`);
}
