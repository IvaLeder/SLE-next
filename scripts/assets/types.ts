/**
 * Pipeline-internal types. Manifest types (the frontend contract) live in
 * src/lib/assets/types.ts and are re-exported here for convenience.
 */
import type { AssetEntry } from "../../src/lib/assets/types.ts";

export type {
  AssetEntry,
  AssetKind,
  AssetManifest,
  ImageEntry,
  ImageVariant,
  VariantFormat,
} from "../../src/lib/assets/types.ts";

export type Severity = "off" | "warn" | "error";

export interface ValidationRules {
  /** MDX references an asset that doesn't exist on disk. */
  missingImage: Severity;
  /** An asset on disk is referenced by no article. */
  unusedImage: Severity;
  /** Two files with byte-identical content. */
  duplicateImage: Severity;
  /** Two files share a stem (breaks `<ArticleImage src="stem">` lookup). */
  duplicateStem: Severity;
  /** Source file is unusually heavy on disk. */
  oversizedSource: Severity;
  /** Source is narrower than the layout needs (inline vs cover thresholds). */
  undersizedImage: Severity;
  /** File extension outside `images.formats.supported` (e.g. GIF). */
  unsupportedFormat: Severity;
  /** An article image with no alt text. */
  missingAlt: Severity;
  /** Filenames that will cause trouble in URLs/srcset (spaces, commas, quotes). */
  badFilename: Severity;
}

/** Everything image-specific, grouped so future asset kinds (videos, PDFs,
 *  audio…) can add sibling sections without touching the pipeline core. */
export interface ImageKindConfig {
  formats: {
    /** Extensions accepted as image sources (lowercase, no dot). */
    supported: string[];
    /** Generate AVIF variants. */
    avif: boolean;
    /** Generate WebP variants. */
    webp: boolean;
  };
  /** Responsive width ladder. Widths above the source width are skipped
   *  (never upscale); the source width itself is always the top rung. */
  widths: number[];
  /** Hard cap: no variant is ever wider than this. */
  maxWidth: number;
  quality: {
    jpeg: number;
    webp: number;
    avif: number;
    /** Palette quantisation quality for PNG (pngquant-style). */
    png: number;
  };
  /** Quantise PNGs to a palette — huge wins on flat-colour diagrams, which is
   *  what this site's PNGs are. Set false if photographic PNGs appear. */
  pngPalette: boolean;
  placeholder: {
    /** Pixel width of the blur preview (16 ≈ 300 B as webp data URI). */
    width: number;
    quality: number;
  };
  svg: {
    /** Optimise SVGs with svgo (safe preset, viewBox kept). */
    optimize: boolean;
  };
}

export interface AssetPipelineConfig {
  /** Directories scanned for article MDX (references + alt text). */
  contentDirs: string[];
  /** Where source assets live (committed, never mutated by the pipeline). */
  sourceDir: string;
  /** Where generated variants are written (gitignored). */
  outputDir: string;
  /** Public URL prefix corresponding to sourceDir. */
  publicSourcePrefix: string;
  /** Public URL prefix corresponding to outputDir. */
  publicOutputPrefix: string;
  /** Where the JSON manifest is written (gitignored, read by src/lib/assets). */
  manifestPath: string;
  /** Hash cache + encoded-variant store. Lives under node_modules/.cache so
   *  Vercel's build cache persists it between deploys. */
  cacheDir: string;
  /** Parallel assets in flight. 0 = derive from CPU count. */
  concurrency: number;

  images: ImageKindConfig;

  validation: {
    rules: ValidationRules;
    /** Inline images narrower than this under-fill the 736px content column. */
    minInlineWidth: number;
    /** Cover images narrower than this look soft in the hero. */
    minCoverWidth: number;
    /** `oversizedSource` threshold in bytes. */
    maxSourceBytes: number;
  };
}

/** A source asset found on disk. */
export interface SourceAsset {
  /** Absolute path. */
  absPath: string;
  /** Path relative to sourceDir — the stable cache key. */
  relPath: string;
  /** Public URL (publicSourcePrefix + relPath). */
  publicPath: string;
  stem: string;
  /** Lowercase extension without the dot. */
  ext: string;
  bytes: number;
  /** Full SHA-256 hex of the file contents. */
  hash: string;
  /** False for recognised-but-unprocessed formats (gif): metadata-only entry. */
  supported: boolean;
}

export type ReferenceKind = "cover" | "markdown" | "figure" | "image" | "article-image" | "before-after";

/** One asset reference found in an article. */
export interface AssetReference {
  /** Article path relative to the repo root. */
  file: string;
  /** The src as written (public URL, or bare stem for <ArticleImage>). */
  src: string;
  kind: ReferenceKind;
  /** Alt text if the syntax carries one; undefined = "no alt attribute". */
  alt?: string;
}

/** A reference after resolution against the scanned sources. */
export interface ResolvedReference extends AssetReference {
  /** True when the src points inside the pipeline's source tree (only those
   *  are validated — external URLs and /images/logo.png are out of scope). */
  pipeline: boolean;
  /** Public path of the matched source, or null (missing file / ambiguous
   *  stem). Only meaningful when `pipeline` is true. */
  resolvedPath: string | null;
}

/** A generated file ready to be persisted (cache + output dir). */
export interface OutputFile {
  /** Filename only, e.g. volcano.a1b2c3d4.800.avif — unique via content hash. */
  name: string;
  data: Buffer;
}

/** Result of processing one source asset. */
export interface ProcessResult {
  entry: AssetEntry;
  outputs: OutputFile[];
}

export interface ProcessFailure {
  relPath: string;
  message: string;
}
