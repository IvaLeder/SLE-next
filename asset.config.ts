import type { AssetPipelineConfig } from "./scripts/assets/types.ts";

/**
 * Asset pipeline configuration — consumed by `npm run images` / `npm run
 * assets` (scripts/assets/cli.ts). Paths are relative to the repo root.
 *
 * The pipeline is organised by asset kind; `images` holds everything
 * image-specific. Future kinds (videos, PDFs, worksheets, audio…) get their
 * own section here plus a processor in scripts/assets/processors/.
 *
 * Outputs (public/images/_opt + the manifest) are gitignored and regenerated
 * by the `prebuild` hook; encoded variants are cached under
 * node_modules/.cache/asset-pipeline so warm builds only copy files.
 */
const config: AssetPipelineConfig = {
  contentDirs: ["src/content/posts/en", "src/content/posts/hr"],
  sourceDir: "public/images/posts",
  outputDir: "public/images/_opt",
  publicSourcePrefix: "/images/posts",
  publicOutputPrefix: "/images/_opt",
  manifestPath: "src/lib/assets/manifest.json",
  cacheDir: "node_modules/.cache/asset-pipeline",

  concurrency: 0, // auto: CPU count, capped at 8

  images: {
    formats: {
      supported: ["jpg", "jpeg", "png", "webp", "avif", "svg"],
      avif: true,
      webp: true,
    },

    // The content column is 736px → 800 covers 1x, 1600 covers Retina.
    // 1800 is the cap for covers / very wide sources.
    widths: [400, 800, 1200, 1600, 1800],
    maxWidth: 1800,

    quality: {
      jpeg: 82, // matches the site's previous one-shot compressor
      webp: 80,
      avif: 60, // sharp's avif quality scale runs lower than jpeg's
      png: 90,
    },
    pngPalette: true, // this site's PNGs are flat-colour diagrams

    placeholder: {
      width: 16,
      quality: 40,
    },

    svg: {
      optimize: true,
    },
  },

  validation: {
    rules: {
      missingImage: "warn",
      unusedImage: "warn",
      duplicateImage: "warn",
      duplicateStem: "warn",
      oversizedSource: "warn",
      undersizedImage: "warn",
      unsupportedFormat: "warn",
      missingAlt: "warn",
      badFilename: "warn",
    },
    minInlineWidth: 736,
    minCoverWidth: 1200,
    maxSourceBytes: 500 * 1024,
  },
};

export default config;
