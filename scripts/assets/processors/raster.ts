import sharp from "sharp";
import type { ResolvedConfig } from "../config.ts";
import type { ImageEntry, ImageVariant, OutputFile, ProcessResult, SourceAsset, VariantFormat } from "../types.ts";
import type { AssetProcessor } from "./index.ts";
import { extractVisuals } from "./visuals.ts";

/**
 * Raster images (jpeg/png/webp/avif sources). For each source:
 *
 *   - auto-orients via EXIF, then strips all metadata (sharp default),
 *     keeping the ICC profile when the source carries one
 *   - builds the responsive ladder: configured widths below the source width
 *     plus the source width itself, everything capped at maxWidth — variants
 *     are never upscaled
 *   - encodes the ladder in the source's own format plus webp/avif
 *   - extracts blur placeholder + colours
 *
 * Sources are read-only; every output is a new file named
 * `{stem}.{hash8}.{width}.{format}` so names are immutable and cacheable.
 */
export const rasterProcessor: AssetProcessor = {
  name: "raster",
  matches: (source) => source.ext !== "svg",
  process: processRaster,
};

/** jpg → jpeg etc. so format names match sharp's and the manifest's. */
export function normalizeFormat(ext: string): VariantFormat {
  return (ext === "jpg" ? "jpeg" : ext) as VariantFormat;
}

export function ladderWidths(cfg: ResolvedConfig, sourceWidth: number): number[] {
  const cap = Math.min(sourceWidth, cfg.images.maxWidth);
  const widths = new Set(cfg.images.widths.filter((w) => w < cap));
  widths.add(cap); // top rung: full (capped) size — never upscaled
  return [...widths].sort((a, b) => a - b);
}

function targetFormats(cfg: ResolvedConfig, sourceFormat: VariantFormat): VariantFormat[] {
  const formats: VariantFormat[] = [sourceFormat];
  if (cfg.images.formats.webp && sourceFormat !== "webp") formats.push("webp");
  if (cfg.images.formats.avif && sourceFormat !== "avif") formats.push("avif");
  return formats;
}

function encoderFor(pipeline: sharp.Sharp, format: VariantFormat, cfg: ResolvedConfig): sharp.Sharp {
  const { quality, pngPalette } = cfg.images;
  switch (format) {
    case "jpeg":
      return pipeline.jpeg({ quality: quality.jpeg, mozjpeg: true, progressive: true });
    case "png":
      // Palette quantisation ≈ pngquant: big wins on flat-colour diagrams,
      // transparency preserved. quality only applies in palette mode.
      return pngPalette
        ? pipeline.png({ compressionLevel: 9, palette: true, quality: quality.png, effort: 7 })
        : pipeline.png({ compressionLevel: 9 });
    case "webp":
      return pipeline.webp({ quality: quality.webp, effort: 4 });
    case "avif":
      return pipeline.avif({ quality: quality.avif, effort: 4 });
    default:
      throw new Error(`No encoder for format "${format}"`);
  }
}

export async function processRaster(source: SourceAsset, { cfg }: { cfg: ResolvedConfig }): Promise<ProcessResult> {
  // .rotate() with no args applies EXIF orientation and drops the tag, so
  // stripped output can't render sideways.
  const base = sharp(source.absPath).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("could not read dimensions");
  }

  // metadata() reports pre-orientation dimensions; orientations 5–8 are the
  // 90°-rotated ones where width/height swap.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  const sourceFormat = normalizeFormat(source.ext);
  const widths = ladderWidths(cfg, width);
  const hash8 = source.hash.slice(0, 8);

  const outputs: OutputFile[] = [];
  const variants: Partial<Record<VariantFormat, ImageVariant[]>> = {};

  for (const format of targetFormats(cfg, sourceFormat)) {
    const ladder: ImageVariant[] = [];
    for (const w of widths) {
      let pipeline = base.clone().resize({ width: w, withoutEnlargement: true });
      if (meta.icc) pipeline = pipeline.keepIccProfile();
      const data = await encoderFor(pipeline, format, cfg).toBuffer();

      // Don't ship regressions: most legacy sources were already compressed
      // once (often at a lower quality than ours), so a same-format re-encode
      // at the top rung can come out LARGER — even when the rung is a slight
      // downscale (1920→1800). In that case the committed original IS the
      // best top variant: point the rung at it, at its true width.
      const isTopRung = w === widths[widths.length - 1];
      if (format === sourceFormat && isTopRung && data.length >= source.bytes) {
        ladder.push({ w: width, url: source.publicPath, bytes: source.bytes });
        continue;
      }

      const name = `${source.stem}.${hash8}.${w}.${format === "jpeg" ? "jpg" : format}`;
      outputs.push({ name, data });
      ladder.push({ w, url: `${cfg.publicOutputPrefix}/${name}`, bytes: data.length });
    }
    variants[format] = ladder;
  }

  const visuals = await extractVisuals(base, cfg);

  const entry: ImageEntry = {
    kind: "image",
    src: source.publicPath,
    stem: source.stem,
    width,
    height,
    aspectRatio: Number((width / height).toFixed(4)),
    bytes: source.bytes,
    hash: hash8,
    format: sourceFormat,
    hasAlpha: Boolean(meta.hasAlpha),
    ...visuals,
    variants,
  };

  return { entry, outputs };
}
