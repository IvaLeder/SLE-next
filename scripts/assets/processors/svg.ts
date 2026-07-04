import fs from "node:fs";
import sharp from "sharp";
import { optimize } from "svgo";
import type { ResolvedConfig } from "../config.ts";
import type { ImageEntry, ProcessResult, SourceAsset } from "../types.ts";
import type { AssetProcessor } from "./index.ts";
import { extractVisuals } from "./visuals.ts";

/**
 * SVG images: safe svgo optimisation (viewBox kept — removing it breaks
 * responsive scaling) written as a single hash-named variant. Dimensions come
 * from width/height attributes or the viewBox. Blur/colours are extracted by
 * rasterising through sharp (librsvg) — best-effort.
 */
export const svgProcessor: AssetProcessor = {
  name: "svg",
  matches: (source) => source.ext === "svg",
  process: processSvg,
};

/** Exported for tests. */
export function svgDimensions(svg: string): { width: number; height: number } | null {
  const openTag = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!openTag) return null;

  const num = (name: string): number | null => {
    const m = openTag.match(new RegExp(`\\b${name}\\s*=\\s*["']?([\\d.]+)(?:px)?["']?`, "i"));
    return m ? parseFloat(m[1]) : null;
  };

  const w = num("width");
  const h = num("height");
  if (w && h) return { width: Math.round(w), height: Math.round(h) };

  const vb = openTag.match(/\bviewBox\s*=\s*["']\s*([\d.-]+)[\s,]+([\d.-]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (vb) return { width: Math.round(parseFloat(vb[3])), height: Math.round(parseFloat(vb[4])) };

  return null;
}

export async function processSvg(source: SourceAsset, { cfg }: { cfg: ResolvedConfig }): Promise<ProcessResult> {
  const raw = fs.readFileSync(source.absPath, "utf8");

  let optimized = raw;
  if (cfg.images.svg.optimize) {
    // svgo v4's preset-default is safe here: it no longer removes viewBox
    // (which CSS scaling needs) and keeps internal url(#…) references intact.
    const result = optimize(raw, { multipass: true });
    optimized = result.data;
  }

  const dims = svgDimensions(optimized) ?? svgDimensions(raw);
  if (!dims) throw new Error("SVG has neither width/height nor viewBox");

  let visuals = {};
  try {
    visuals = await extractVisuals(sharp(Buffer.from(optimized)), cfg);
  } catch {
    // Rasterisation can fail on exotic SVGs; placeholders are optional.
  }

  const hash8 = source.hash.slice(0, 8);
  const name = `${source.stem}.${hash8}.svg`;
  const data = Buffer.from(optimized);

  const entry: ImageEntry = {
    kind: "image",
    src: source.publicPath,
    stem: source.stem,
    width: dims.width,
    height: dims.height,
    aspectRatio: Number((dims.width / dims.height).toFixed(4)),
    bytes: source.bytes,
    hash: hash8,
    format: "svg",
    hasAlpha: true, // assume transparency — SVGs usually have none-drawn areas
    ...visuals,
    variants: {
      svg: [{ w: dims.width, url: `${cfg.publicOutputPrefix}/${name}`, bytes: data.length }],
    },
  };

  return { entry, outputs: [{ name, data }] };
}
