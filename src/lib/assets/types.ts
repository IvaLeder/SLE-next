/**
 * Shared manifest types — the contract between the asset pipeline
 * (scripts/assets/*) and the frontend components that consume
 * src/lib/assets/manifest.json. Types only: this module must stay free of
 * runtime imports so it's safe in both Node scripts and client components.
 *
 * The pipeline is designed around asset *kinds*. Today the only kind is
 * "image"; adding videos/PDFs/audio later means widening AssetKind, adding a
 * new entry interface to the AssetEntry union, and registering a processor —
 * the scanner, cache, manifest and CLI don't change.
 */

/** Discriminator for manifest entries. Extend as new processors are added,
 *  e.g. "video" | "pdf" | "audio" | "model". */
export type AssetKind = "image";

/** Output formats the image processors can emit. */
export type VariantFormat = "avif" | "webp" | "jpeg" | "png" | "svg";

/** One generated file: a specific format at a specific width. */
export interface ImageVariant {
  /** Pixel width of this variant. */
  w: number;
  /** Public URL, e.g. /images/_opt/volcano.a1b2c3d4.800.avif */
  url: string;
  bytes: number;
}

export interface ImageEntry {
  kind: "image";
  /** Public URL of the committed original, e.g. /images/posts/volcano.jpg */
  src: string;
  /** Filename without extension — the short lookup key for <ArticleImage>. */
  stem: string;
  /** Intrinsic dimensions of the original (EXIF orientation applied). */
  width: number;
  height: number;
  aspectRatio: number;
  /** Byte size of the original source file. */
  bytes: number;
  /** First 8 hex chars of the source's SHA-256 — also embedded in variant filenames. */
  hash: string;
  /** Normalised source format: jpeg | png | webp | avif | svg | gif | … */
  format: string;
  hasAlpha: boolean;
  /** Tiny blurred preview as a data URI (~300 B webp). Absent for SVG/passthrough. */
  blurDataURL?: string;
  /** Most prominent colour, as #rrggbb — usable as a solid placeholder. */
  dominantColor?: string;
  /** Mean colour across the image, as #rrggbb. */
  averageColor?: string;
  /**
   * Generated variants per format, sorted by ascending width. The entry for
   * the source's own (normalised) format is the <img src/srcset> fallback;
   * avif/webp become <source> elements.
   */
  variants: Partial<Record<VariantFormat, ImageVariant[]>>;
  /**
   * True when the pipeline deliberately generated no variants for this file —
   * GIFs (re-encoding loses animation) and images no article references.
   * Components render the original directly; dimensions are still known so
   * layout doesn't shift.
   */
  passthrough?: boolean;
}

/** Union of all asset entry shapes (single-member until more kinds exist). */
export type AssetEntry = ImageEntry;

export interface AssetManifest {
  version: 2;
  generatedAt: string;
  /** Keyed by the original's public URL (AssetEntry.src). */
  assets: Record<string, AssetEntry>;
  /**
   * stem → src key, for `<ArticleImage src="volcano" />` lookups.
   * Stems shared by multiple files are omitted (validation warns about them).
   */
  stems: Record<string, string>;
}
