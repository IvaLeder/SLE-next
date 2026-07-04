import fs from "node:fs";
import path from "node:path";
import { Cache } from "./cache.ts";
import { loadConfig, type ResolvedConfig } from "./config.ts";
import { buildManifest, writeManifest } from "./manifest.ts";
import { selectProcessor } from "./processors/index.ts";
import { printReport, type RunStats } from "./report.ts";
import { indexSources, resolveReferences, scanReferences, scanSources, usedSourcePaths } from "./scan.ts";
import type { AssetEntry, ProcessFailure, SourceAsset } from "./types.ts";
import { ensureDir } from "./util/fs.ts";
import { color, log } from "./util/log.ts";
import { mapPool } from "./util/pool.ts";
import { validate } from "./validate.ts";

/**
 * Asset pipeline entry point — `npm run images` (alias: `npm run assets`).
 *
 *   --force     re-encode everything, ignoring the cache
 *   --clean     wipe outputs + cache first, then rebuild from scratch
 *   --dry-run   scan + diff + report only; write nothing
 *   --verbose   per-file logging and full warning lists
 *   --watch     re-run incrementally when assets or articles change
 *
 * Also runs as the `prebuild` hook so production builds always have a fresh
 * manifest; with a warm cache that's a hard-link job, not an encode job.
 *
 * Orchestration only — discovery/resolution live in scan.ts, per-kind work
 * in processors/, persistence in cache.ts. See processors/index.ts for how
 * to add new asset kinds.
 */

interface CliOptions {
  force: boolean;
  clean: boolean;
  dryRun: boolean;
  watch: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const known = new Map<string, keyof CliOptions | "verbose">([
    ["--force", "force"],
    ["--clean", "clean"],
    ["--dry-run", "dryRun"],
    ["--watch", "watch"],
    ["--verbose", "verbose"],
  ]);
  const opts: CliOptions = { force: false, clean: false, dryRun: false, watch: false };
  for (const arg of argv) {
    const key = known.get(arg);
    if (!key) {
      log.error(`Unknown option "${arg}". Known: ${[...known.keys()].join(" ")}`);
      process.exit(2);
    }
    if (key === "verbose") log.verbose = true;
    else opts[key] = true;
  }
  return opts;
}

async function run(cfg: ResolvedConfig, opts: CliOptions): Promise<number> {
  const t0 = performance.now();

  log.step("scanning sources and article references…");
  const { sources, unknownFiles } = scanSources(cfg);
  const index = indexSources(sources);
  const refs = resolveReferences(cfg, index, scanReferences(cfg));
  const usedPaths = usedSourcePaths(index, refs);
  log.debug(`${sources.length} sources, ${refs.length} references, ${usedPaths.size} used, ${unknownFiles.length} unknown files`);

  // ── Diff against the cache ────────────────────────────────────────────
  const cache = new Cache(cfg);
  const entries: AssetEntry[] = [];
  const expectedFiles = new Set<string>();
  const newFiles = new Set<string>();
  const toProcess: SourceAsset[] = [];
  let fromCache = 0;

  for (const source of sources) {
    const used = usedPaths.has(source.publicPath);
    const hit = opts.force ? null : cache.get(source.relPath, source.hash, used);
    if (hit) {
      fromCache++;
      entries.push(hit.entry);
      for (const f of hit.files) expectedFiles.add(f);
    } else {
      toProcess.push(source);
    }
  }

  // ── Process what changed ──────────────────────────────────────────────
  const failed: ProcessFailure[] = [];
  let variantsGenerated = 0;
  let processed = 0;

  if (toProcess.length) {
    log.step(
      `${opts.dryRun ? "would process" : "processing"} ${toProcess.length} asset(s) ` +
        color.dim(`(${fromCache} unchanged, concurrency ${cfg.resolvedConcurrency})`),
    );
  } else {
    log.ok("everything up to date");
  }

  if (!opts.dryRun && toProcess.length) {
    let done = 0;
    await mapPool(toProcess, cfg.resolvedConcurrency, async (source) => {
      const ctx = { cfg, used: usedPaths.has(source.publicPath) };
      const processor = selectProcessor(source, ctx);
      try {
        const result = await processor.process(source, ctx);
        cache.put(source.relPath, source.hash, ctx.used, result.entry, result.outputs);
        entries.push(result.entry);
        for (const o of result.outputs) {
          expectedFiles.add(o.name);
          newFiles.add(o.name);
        }
        variantsGenerated += result.outputs.length;
        processed++;
        log.debug(`${source.relPath} [${processor.name}] → ${result.outputs.length} variant(s)`);
      } catch (err) {
        cache.delete(source.relPath);
        failed.push({ relPath: source.relPath, message: err instanceof Error ? err.message : String(err) });
      } finally {
        done++;
        log.progress(done, toProcess.length, "processed");
      }
    });
  }

  const manifest = buildManifest(entries);
  let variantsCopied = 0;

  if (!opts.dryRun) {
    // Materialise the output dir from the cache (hard-links) and drop
    // orphans, so the dir is always exactly what the manifest says — no
    // stale files accumulate.
    ensureDir(cfg.absOutputDir);
    for (const f of expectedFiles) {
      if (cache.restore(f, cfg.absOutputDir) && !newFiles.has(f)) variantsCopied++;
    }
    for (const f of fs.readdirSync(cfg.absOutputDir)) {
      if (!expectedFiles.has(f)) fs.rmSync(path.join(cfg.absOutputDir, f), { force: true });
    }

    writeManifest(manifest, cfg);
    cache.prune(new Set(sources.map((s) => s.relPath)));
    cache.save();
    log.ok(`manifest → ${cfg.manifestPath} (${entries.length} assets)`);
  }

  // ── Validate + report ─────────────────────────────────────────────────
  // A dry run with pending work has an incomplete manifest — dimension
  // validation against it would report nonsense, so skip it honestly.
  const skipValidation = opts.dryRun && toProcess.length > 0;
  const findings = skipValidation
    ? []
    : validate(cfg, sources, unknownFiles, refs, usedPaths, index, manifest);
  if (skipValidation) {
    log.info(color.dim("  (validation skipped — dry run with pending work)"));
  }

  const stats: RunStats = {
    found: sources.length,
    processed,
    fromCache,
    passthrough: entries.filter((e) => e.passthrough).length,
    failed,
    variantsGenerated,
    variantsCopied,
    durationMs: performance.now() - t0,
    dryRun: opts.dryRun,
  };
  printReport(stats, entries, findings);

  const hasErrors = failed.length > 0 || findings.some((f) => f.severity === "error");
  return hasErrors ? 1 : 0;
}

function watchLoop(cfg: ResolvedConfig, opts: CliOptions): void {
  // force/clean apply to the initial run only — repeating them on every file
  // change would re-encode the whole corpus per keystroke.
  const iterOpts: CliOptions = { ...opts, force: false, clean: false, watch: false };
  let timer: NodeJS.Timeout | null = null;
  let running = false;
  let queued = false;

  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) {
        queued = true;
        return;
      }
      running = true;
      try {
        await run(cfg, iterOpts);
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
      }
      running = false;
      if (queued) {
        queued = false;
        trigger();
      }
    }, 400);
  };

  const dirs = [cfg.absSourceDir, ...cfg.absContentDirs].filter((d) => fs.existsSync(d));
  for (const dir of dirs) {
    fs.watch(dir, { recursive: true }, trigger);
  }
  log.step(`watching ${dirs.length} directories — Ctrl-C to stop`);
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const cfg = loadConfig();

  if (opts.clean) {
    log.step("cleaning outputs, manifest and cache…");
    fs.rmSync(cfg.absOutputDir, { recursive: true, force: true });
    fs.rmSync(cfg.absManifestPath, { force: true });
    Cache.clear(cfg);
  }

  const code = await run(cfg, opts);

  if (opts.watch) {
    watchLoop(cfg, opts);
    return; // keep the process alive for the watchers
  }
  process.exit(code);
}

main().catch((err) => {
  log.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
