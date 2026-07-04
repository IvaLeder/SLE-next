import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { safeDecode } from "../../src/lib/assets/helpers.ts";
import type { ResolvedConfig } from "./config.ts";
import type { AssetReference, ResolvedReference, SourceAsset } from "./types.ts";
import { walk } from "./util/fs.ts";
import { hashFile } from "./util/hash.ts";

/**
 * Discovery + resolution: everything the pipeline knows about the world comes
 * from here — source assets on disk, references inside article MDX, and the
 * single source of truth for matching one to the other (used by both the CLI
 * and validation, so they can never disagree). Reference patterns match
 * scripts/validate-posts.mjs so the two tools agree on what "used" means.
 */

/** Formats we recognise but deliberately don't process (animation loss etc.).
 *  They get a metadata-only manifest entry so components still know dimensions. */
const PASSTHROUGH_EXTS = new Set(["gif"]);

// ── Sources ─────────────────────────────────────────────────────────────────

export function scanSources(cfg: ResolvedConfig): {
  sources: SourceAsset[];
  unknownFiles: string[];
} {
  const supported = new Set(cfg.images.formats.supported.map((e) => e.toLowerCase()));
  const sources: SourceAsset[] = [];
  const unknownFiles: string[] = [];

  for (const absPath of walk(cfg.absSourceDir)) {
    const relPath = path.relative(cfg.absSourceDir, absPath);
    const ext = path.extname(relPath).slice(1).toLowerCase();

    if (!supported.has(ext) && !PASSTHROUGH_EXTS.has(ext)) {
      unknownFiles.push(relPath);
      continue;
    }

    sources.push({
      absPath,
      relPath,
      // Public URLs always use forward slashes regardless of OS.
      publicPath: `${cfg.publicSourcePrefix}/${relPath.split(path.sep).join("/")}`,
      stem: path.basename(relPath, path.extname(relPath)),
      ext,
      bytes: fs.statSync(absPath).size,
      hash: hashFile(absPath),
      supported: supported.has(ext),
    });
  }

  sources.sort((a, b) => (a.relPath < b.relPath ? -1 : 1));
  return { sources, unknownFiles };
}

/** Lookup structures over the scanned sources, built once per run. */
export interface SourceIndex {
  byPath: Map<string, SourceAsset>;
  /** stem → publicPath, only for stems owned by exactly one file. */
  uniqueStems: Map<string, string>;
  /** stem → publicPaths, for stems shared by several files (validation warns;
   *  bare-stem refs to these resolve to null). */
  ambiguousStems: Map<string, string[]>;
}

export function indexSources(sources: SourceAsset[]): SourceIndex {
  const byPath = new Map<string, SourceAsset>();
  const byStem = new Map<string, string[]>();
  for (const s of sources) {
    byPath.set(s.publicPath, s);
    const list = byStem.get(s.stem) ?? [];
    list.push(s.publicPath);
    byStem.set(s.stem, list);
  }

  const uniqueStems = new Map<string, string>();
  const ambiguousStems = new Map<string, string[]>();
  for (const [stem, paths] of byStem) {
    if (paths.length === 1) uniqueStems.set(stem, paths[0]);
    else ambiguousStems.set(stem, paths);
  }
  return { byPath, uniqueStems, ambiguousStems };
}

// ── References ──────────────────────────────────────────────────────────────

// ![alt](src "optional title")
const MARKDOWN_IMG = /!\[([^\]]*)\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
// Any of the image-bearing JSX components used in article MDX.
// [^>]*? spans newlines on its own, so no `s` flag (tsconfig targets ES2017).
// Known limitation (shared with validate-posts.mjs): a literal `>` inside an
// attribute string would end the match early.
const JSX_TAG = /<(Figure|Image|ArticleImage|BeforeAfter)\b([^>]*?)\/?>/g;

function attr(tagAttrs: string, name: string): string | undefined {
  const m = tagAttrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`));
  return m ? m[1] : undefined;
}

export function scanReferences(cfg: ResolvedConfig): AssetReference[] {
  const refs: AssetReference[] = [];

  for (const dir of cfg.absContentDirs) {
    for (const absPath of walk(dir)) {
      if (!/\.mdx?$/.test(absPath)) continue;
      refs.push(...extractReferences(path.relative(cfg.root, absPath), fs.readFileSync(absPath, "utf8")));
    }
  }

  return refs;
}

/** Pull every asset reference out of one MDX document. Exported for tests. */
export function extractReferences(file: string, raw: string): AssetReference[] {
  const refs: AssetReference[] = [];

  let data: Record<string, unknown> = {};
  let content = raw;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch {
    // Broken frontmatter is validate-posts' problem; scan the raw text.
  }

  if (typeof data.coverImage === "string" && data.coverImage.trim()) {
    refs.push({
      file,
      src: data.coverImage.trim(),
      kind: "cover",
      alt: typeof data.heroAlt === "string" ? data.heroAlt : undefined,
    });
  }

  for (const m of content.matchAll(MARKDOWN_IMG)) {
    const src = m[2].replace(/^<|>$/g, ""); // markdown allows <bracketed> urls
    refs.push({ file, src, kind: "markdown", alt: m[1] });
  }

  for (const m of content.matchAll(JSX_TAG)) {
    const [, tag, attrs] = m;
    if (tag === "BeforeAfter") {
      // Labelled by the component itself — no alt requirement here.
      for (const name of ["before", "after"] as const) {
        const src = attr(attrs, name);
        if (src) refs.push({ file, src, kind: "before-after" });
      }
      continue;
    }
    const src = attr(attrs, "src");
    if (!src) continue;
    const kind = tag === "Figure" ? "figure" : tag === "Image" ? "image" : "article-image";
    refs.push({ file, src, kind, alt: attr(attrs, "alt") });
  }

  return refs;
}

// ── Resolution ──────────────────────────────────────────────────────────────

/** True if a reference points inside the pipeline's source tree. External
 *  URLs and non-pipeline paths (/images/logo.png) are out of scope; bare
 *  stems (<ArticleImage src="volcano">) count. */
export function isPipelineRef(cfg: ResolvedConfig, src: string): boolean {
  if (/^https?:\/\//i.test(src)) return false;
  if (src.startsWith("/")) return src.startsWith(`${cfg.publicSourcePrefix}/`);
  return true; // bare stem
}

/**
 * Match every reference to a scanned source. Path refs try the literal
 * value, then a percent-decoded fallback (Croatian filenames). Bare stems
 * resolve only when unambiguous — an ambiguous stem yields null so
 * validation flags it instead of silently picking a file.
 */
export function resolveReferences(
  cfg: ResolvedConfig,
  index: SourceIndex,
  refs: AssetReference[],
): ResolvedReference[] {
  return refs.map((ref) => {
    if (!isPipelineRef(cfg, ref.src)) {
      return { ...ref, pipeline: false, resolvedPath: null };
    }
    let resolvedPath: string | null = null;
    if (ref.src.startsWith("/")) {
      if (index.byPath.has(ref.src)) resolvedPath = ref.src;
      else {
        const decoded = safeDecode(ref.src);
        if (index.byPath.has(decoded)) resolvedPath = decoded;
      }
    } else {
      resolvedPath = index.uniqueStems.get(ref.src) ?? null;
    }
    return { ...ref, pipeline: true, resolvedPath };
  });
}

/**
 * Public paths of every source an article references — this decides which
 * assets get full variant treatment vs. a metadata-only entry. Ambiguous
 * bare stems mark ALL candidates used (better to over-encode than to 404 if
 * the ambiguity is later fixed by deleting the wrong file).
 */
export function usedSourcePaths(index: SourceIndex, resolved: ResolvedReference[]): Set<string> {
  const used = new Set<string>();
  for (const ref of resolved) {
    if (!ref.pipeline) continue;
    if (ref.resolvedPath) {
      used.add(ref.resolvedPath);
    } else if (!ref.src.startsWith("/")) {
      for (const p of index.ambiguousStems.get(ref.src) ?? []) used.add(p);
    }
  }
  return used;
}
