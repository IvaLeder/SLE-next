import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { loadConfig, type ResolvedConfig } from "../config.ts";
import { selectProcessor } from "../processors/index.ts";
import { processRaster } from "../processors/raster.ts";
import { processSvg } from "../processors/svg.ts";
import type { SourceAsset } from "../types.ts";
import { hashFile } from "../util/hash.ts";

/**
 * Processor round-trips on synthetic files — no repo fixtures, everything is
 * generated into a temp dir. These run sharp for real, so they're the slow
 * part of the suite (~1s).
 */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "asset-pipeline-test-"));

function cfgWith(widths: number[], maxWidth: number): ResolvedConfig {
  const cfg = loadConfig();
  return { ...cfg, images: { ...cfg.images, widths, maxWidth } };
}

async function makeSource(name: string, data: Buffer | string): Promise<SourceAsset> {
  const absPath = path.join(tmp, name);
  fs.writeFileSync(absPath, data);
  return {
    absPath,
    relPath: name,
    publicPath: `/images/posts/${name}`,
    stem: path.basename(name, path.extname(name)),
    ext: path.extname(name).slice(1).toLowerCase(),
    bytes: fs.statSync(absPath).size,
    hash: hashFile(absPath),
    supported: true,
  };
}

test("processRaster: ladder, formats, alpha and blur", async () => {
  const cfg = cfgWith([50, 90], 400);
  const png = await sharp({
    create: { width: 120, height: 80, channels: 4, background: { r: 200, g: 40, b: 40, alpha: 0.5 } },
  })
    .png()
    .toBuffer();
  const source = await makeSource("semi.png", png);

  const { entry, outputs } = await processRaster(source, { cfg });

  assert.equal(entry.kind, "image");
  assert.equal(entry.width, 120);
  assert.equal(entry.height, 80);
  assert.equal(entry.hasAlpha, true);
  assert.ok(entry.blurDataURL?.startsWith("data:image/webp;base64,"));
  // ladder = [50, 90, 120] in png + webp + avif
  assert.deepEqual(entry.variants.png?.map((v) => v.w), [50, 90, 120]);
  assert.deepEqual(entry.variants.webp?.map((v) => v.w), [50, 90, 120]);
  assert.deepEqual(entry.variants.avif?.map((v) => v.w), [50, 90, 120]);
  // every output filename embeds the source hash for immutability
  for (const o of outputs) assert.ok(o.name.includes(source.hash.slice(0, 8)), o.name);
});

test("processRaster: top-rung regression guard serves the original", async () => {
  const cfg = cfgWith([400], 1800);
  // Noise compresses badly; encoding the source at very low quality makes
  // our q82 re-encode reliably larger, which must trigger the guard.
  const noise = Buffer.alloc(900 * 300 * 3);
  for (let i = 0; i < noise.length; i++) noise[i] = Math.floor(Math.random() * 256);
  const jpeg = await sharp(noise, { raw: { width: 900, height: 300, channels: 3 } })
    .jpeg({ quality: 20 })
    .toBuffer();
  const source = await makeSource("noise.jpg", jpeg);

  const { entry, outputs } = await processRaster(source, { cfg });
  const top = entry.variants.jpeg?.at(-1);

  assert.equal(top?.url, source.publicPath); // original, not a fatter re-encode
  assert.equal(top?.bytes, source.bytes);
  assert.equal(top?.w, 900);
  // …and no output file was written for that rung
  assert.ok(!outputs.some((o) => o.name.endsWith(".900.jpg")));
});

test("processSvg: optimises, keeps viewBox, reports dimensions", async () => {
  const cfg = loadConfig();
  const source = await makeSource(
    "diagram.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
       <!-- a comment svgo should strip -->
       <rect width="300" height="200" fill="#fff"/>
     </svg>`,
  );

  const { entry, outputs } = await processSvg(source, { cfg });

  assert.equal(entry.width, 300);
  assert.equal(entry.height, 200);
  assert.equal(entry.format, "svg");
  const svgOut = outputs[0].data.toString();
  assert.ok(svgOut.includes("viewBox"), "viewBox must survive optimisation");
  assert.ok(!svgOut.includes("comment"), "comments should be stripped");
  assert.ok(svgOut.length < 200);
});

test("selectProcessor: unused and unsupported sources get metadata-only", async () => {
  const cfg = loadConfig();
  const png = await sharp({
    create: { width: 40, height: 30, channels: 3, background: { r: 0, g: 100, b: 0 } },
  })
    .png()
    .toBuffer();
  const source = await makeSource("orphan.png", png);

  assert.equal(selectProcessor(source, { cfg, used: true }).name, "raster");
  const metaOnly = selectProcessor(source, { cfg, used: false });
  assert.equal(metaOnly.name, "metadata-only");

  const { entry, outputs } = await metaOnly.process(source, { cfg, used: false });
  assert.equal(entry.passthrough, true);
  assert.equal(entry.width, 40);
  assert.deepEqual(entry.variants, {});
  assert.equal(outputs.length, 0);

  const gif = { ...source, supported: false, ext: "gif" };
  assert.equal(selectProcessor(gif, { cfg, used: true }).name, "metadata-only");
});
