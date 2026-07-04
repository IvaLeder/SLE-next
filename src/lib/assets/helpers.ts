import type { CSSProperties } from "react";
import type { ImageEntry, ImageVariant, VariantFormat } from "./types";

/**
 * Pure helpers shared by server components, client components AND the
 * pipeline scripts. No fs/manifest access and no runtime imports — client
 * bundles must not pull in the whole manifest (only the single entry a
 * server component passed down as a prop), and the Node scripts import this
 * file directly under type stripping (type-only imports erase cleanly).
 */

/** Default sizes: article content column is 736px wide (max-w-3xl − padding). */
export const ARTICLE_SIZES = "(min-width: 768px) 736px, 100vw";

/** srcset string for a ladder. URLs are encoded — Croatian filenames contain
 *  diacritics, and raw spaces/commas would break srcset parsing. */
export function toSrcSet(variants: ImageVariant[]): string {
  return variants.map((v) => `${encodeURI(v.url)} ${v.w}w`).join(", ");
}

/** The ladder in the image's own format — used for <img src/srcset> so
 *  browsers without AVIF/WebP support get what the original was.
 *  (entry.format is a plain string because passthrough formats like "gif"
 *  exist; unknown formats simply have no ladder.) */
export function baseVariants(image: ImageEntry): ImageVariant[] | undefined {
  const ladder = image.variants[image.format as VariantFormat];
  return ladder?.length ? ladder : undefined;
}

/**
 * Placeholder style for the <img> itself: the blur preview paints as a CSS
 * background and the real pixels simply cover it when decoded — no client JS.
 * Skipped for images with alpha (the backdrop would bleed through transparent
 * regions); those get nothing rather than a wrong-looking colour block.
 */
export function placeholderStyle(image: ImageEntry): CSSProperties | undefined {
  if (image.hasAlpha) return undefined;
  if (image.blurDataURL) {
    return {
      backgroundImage: `url(${image.blurDataURL})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }
  // Entries trimmed for client payload (post-card covers) drop the blur but
  // keep the dominant colour — still beats a white flash.
  if (image.dominantColor) return { backgroundColor: image.dominantColor };
  return undefined;
}

/** decodeURI that returns the input on malformed sequences instead of
 *  throwing — MDX sometimes carries percent-encoded Croatian filenames. */
export function safeDecode(s: string): string {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}
