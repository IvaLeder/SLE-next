import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { placeholderStyle, safeDecode, toSrcSet } from "../../../src/lib/assets/helpers.ts";
import type { ImageEntry } from "../../../src/lib/assets/types.ts";
import { loadConfig, resolveConfig, type ResolvedConfig } from "../config.ts";
import { ladderWidths } from "../processors/raster.ts";
import { svgDimensions } from "../processors/svg.ts";
import { extractReferences, indexSources, resolveReferences, usedSourcePaths } from "../scan.ts";
import type { SourceAsset } from "../types.ts";
import { stableHash } from "../util/hash.ts";
import { mapPool } from "../util/pool.ts";

/** Real config with images overrides — keeps tests in sync with the schema. */
function testCfg(overrides: Partial<ResolvedConfig["images"]> = {}): ResolvedConfig {
  const cfg = loadConfig();
  return { ...cfg, images: { ...cfg.images, ...overrides } };
}

function fakeSource(publicPath: string): SourceAsset {
  const stem = path.basename(publicPath, path.extname(publicPath));
  return {
    absPath: `/abs${publicPath}`,
    relPath: publicPath.replace("/images/posts/", ""),
    publicPath,
    stem,
    ext: path.extname(publicPath).slice(1),
    bytes: 1000,
    hash: "deadbeef".repeat(8),
    supported: true,
  };
}

// ── ladderWidths ────────────────────────────────────────────────────────────

test("ladderWidths never upscales and always includes the (capped) source width", () => {
  const cfg = testCfg({ widths: [400, 800, 1200, 1600, 1800], maxWidth: 1800 });
  assert.deepEqual(ladderWidths(cfg, 700), [400, 700]);
  assert.deepEqual(ladderWidths(cfg, 1500), [400, 800, 1200, 1500]);
  assert.deepEqual(ladderWidths(cfg, 2400), [400, 800, 1200, 1600, 1800]); // capped
  assert.deepEqual(ladderWidths(cfg, 400), [400]); // rung == source: no dupes
  assert.deepEqual(ladderWidths(cfg, 100), [100]); // tiny source: single rung
});

// ── svgDimensions ───────────────────────────────────────────────────────────

test("svgDimensions reads width/height attributes, viewBox as fallback", () => {
  assert.deepEqual(
    svgDimensions('<svg width="1500" height="1000" viewBox="0 0 30 20"></svg>'),
    { width: 1500, height: 1000 },
  );
  assert.deepEqual(
    svgDimensions('<svg viewBox="0 0 300.5 200"></svg>'),
    { width: 301, height: 200 },
  );
  // percentage width is ignored → viewBox wins
  assert.deepEqual(
    svgDimensions('<svg width="100%" viewBox="0 0 40 30"></svg>'),
    { width: 40, height: 30 },
  );
  assert.equal(svgDimensions("<svg></svg>"), null);
});

// ── source indexing + reference resolution ──────────────────────────────────

test("indexSources separates unique and ambiguous stems", () => {
  const index = indexSources([
    fakeSource("/images/posts/volcano.jpg"),
    fakeSource("/images/posts/rocket.jpg"),
    fakeSource("/images/posts/rocket.webp"),
  ]);
  assert.equal(index.uniqueStems.get("volcano"), "/images/posts/volcano.jpg");
  assert.equal(index.uniqueStems.has("rocket"), false);
  assert.deepEqual(index.ambiguousStems.get("rocket"), [
    "/images/posts/rocket.jpg",
    "/images/posts/rocket.webp",
  ]);
});

test("resolveReferences: paths, encoded paths, stems, external URLs", () => {
  const cfg = loadConfig();
  const index = indexSources([
    fakeSource("/images/posts/volcano.jpg"),
    fakeSource("/images/posts/teško-kupanje.jpg"),
    fakeSource("/images/posts/rocket.jpg"),
    fakeSource("/images/posts/rocket.webp"),
  ]);
  const mk = (src: string) => ({ file: "a.mdx", src, kind: "markdown" as const });
  const [byPath, encoded, byStem, ambiguous, external, outside, missing] = resolveReferences(cfg, index, [
    mk("/images/posts/volcano.jpg"),
    mk("/images/posts/te%C5%A1ko-kupanje.jpg"),
    mk("volcano"),
    mk("rocket"),
    mk("https://example.com/x.jpg"),
    mk("/images/logo.png"),
    mk("/images/posts/nope.jpg"),
  ]);

  assert.equal(byPath.resolvedPath, "/images/posts/volcano.jpg");
  assert.equal(encoded.resolvedPath, "/images/posts/teško-kupanje.jpg");
  assert.equal(byStem.resolvedPath, "/images/posts/volcano.jpg");
  assert.equal(ambiguous.resolvedPath, null); // ambiguous stems don't resolve
  assert.equal(external.pipeline, false);
  assert.equal(outside.pipeline, false); // /images/logo.png is out of scope
  assert.equal(missing.pipeline, true);
  assert.equal(missing.resolvedPath, null);

  // usedSourcePaths marks ambiguous-stem candidates used (over-encode > 404)
  const used = usedSourcePaths(index, [byPath, ambiguous]);
  assert.deepEqual(
    [...used].sort(),
    ["/images/posts/rocket.jpg", "/images/posts/rocket.webp", "/images/posts/volcano.jpg"],
  );
});

// ── MDX reference extraction ────────────────────────────────────────────────

test("extractReferences finds covers, markdown images, and JSX components", () => {
  const mdx = [
    "---",
    "coverImage: /images/posts/cover.jpg",
    'heroAlt: "A cover"',
    "---",
    "![Volcano erupting](/images/posts/volcano.jpg)",
    "![](/images/posts/no-alt.jpg)",
    '<Figure src="/images/posts/fig.png" alt="Redox diagram"',
    '  width="1500">caption</Figure>',
    '<ArticleImage src="rocket" alt="Rocket" />',
    '<BeforeAfter before="/images/posts/b.jpg" after="/images/posts/a.jpg" />',
    "![ext](https://example.com/x.png)",
  ].join("\n");

  const refs = extractReferences("posts/en/test.mdx", mdx);
  const by = (kind: string) => refs.filter((r) => r.kind === kind);

  assert.deepEqual(by("cover").map((r) => [r.src, r.alt]), [["/images/posts/cover.jpg", "A cover"]]);
  assert.deepEqual(by("markdown").map((r) => [r.src, r.alt]), [
    ["/images/posts/volcano.jpg", "Volcano erupting"],
    ["/images/posts/no-alt.jpg", ""],
    ["https://example.com/x.png", "ext"],
  ]);
  assert.deepEqual(by("figure").map((r) => [r.src, r.alt]), [["/images/posts/fig.png", "Redox diagram"]]);
  assert.deepEqual(by("article-image").map((r) => r.src), ["rocket"]);
  assert.deepEqual(by("before-after").map((r) => r.src), ["/images/posts/b.jpg", "/images/posts/a.jpg"]);
});

// ── frontend helpers ────────────────────────────────────────────────────────

function entry(partial: Partial<ImageEntry>): ImageEntry {
  return {
    kind: "image",
    src: "/images/posts/x.jpg",
    stem: "x",
    width: 100,
    height: 50,
    aspectRatio: 2,
    bytes: 1,
    hash: "abcd1234",
    format: "jpeg",
    hasAlpha: false,
    variants: {},
    ...partial,
  };
}

test("toSrcSet percent-encodes URLs (diacritics, spaces)", () => {
  const srcset = toSrcSet([
    { w: 400, url: "/images/_opt/teško há.400.avif", bytes: 1 },
    { w: 800, url: "/images/_opt/plain.800.avif", bytes: 1 },
  ]);
  assert.equal(srcset, "/images/_opt/te%C5%A1ko%20h%C3%A1.400.avif 400w, /images/_opt/plain.800.avif 800w");
});

test("placeholderStyle: blur > dominant colour > nothing; never behind alpha", () => {
  assert.equal(placeholderStyle(entry({ hasAlpha: true, blurDataURL: "data:x" })), undefined);
  assert.equal(
    placeholderStyle(entry({ blurDataURL: "data:x" }))?.backgroundImage,
    "url(data:x)",
  );
  assert.deepEqual(placeholderStyle(entry({ dominantColor: "#123456" })), {
    backgroundColor: "#123456",
  });
  assert.equal(placeholderStyle(entry({})), undefined);
});

test("safeDecode tolerates malformed sequences", () => {
  assert.equal(safeDecode("/a%C5%A1b"), "/ašb");
  assert.equal(safeDecode("/broken%E0%A4%A"), "/broken%E0%A4%A");
});

// ── utilities ───────────────────────────────────────────────────────────────

test("stableHash is key-order independent", () => {
  assert.equal(stableHash({ a: 1, b: [2, 3] }), stableHash({ b: [2, 3], a: 1 }));
  assert.notEqual(stableHash({ a: 1 }), stableHash({ a: 2 }));
});

test("mapPool preserves order and honours the limit", async () => {
  let inFlight = 0;
  let peak = 0;
  const out = await mapPool([1, 2, 3, 4, 5, 6], 2, async (n) => {
    inFlight++;
    peak = Math.max(peak, inFlight);
    await new Promise((r) => setTimeout(r, 5));
    inFlight--;
    return n * 10;
  });
  assert.deepEqual(out, [10, 20, 30, 40, 50, 60]);
  assert.equal(peak, 2);
});

// ── config resolution guard ─────────────────────────────────────────────────

test("resolveConfig rejects nonsense and keeps the cache-key payload stable", () => {
  const base = loadConfig();
  assert.throws(
    () => resolveConfig({ ...base, images: { ...base.images, widths: [] } }, base.root),
    /widths/,
  );
  // The output hash must not depend on where the repo is checked out.
  const elsewhere = resolveConfig(base, fs.mkdtempSync(path.join(os.tmpdir(), "cfg-")));
  assert.equal(elsewhere.outputConfigHash, base.outputConfigHash);
});
