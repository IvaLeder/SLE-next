import type { ImageEntry } from "@/lib/assets/types";
import { ARTICLE_SIZES, baseVariants, placeholderStyle, toSrcSet } from "@/lib/assets/helpers";

/**
 * Manifest-driven <picture>: AVIF → WebP → original-format <source>s with
 * responsive srcset, plus the blur/colour placeholder painted as a CSS
 * background under the <img> (no client JS — decoded pixels simply cover it).
 *
 * This replaces next/image for pipeline images: with `images.unoptimized`
 * (Vercel optimizer quota) next/image emits a bare <img> with the original
 * file, so srcset/format negotiation has to come from our own markup.
 *
 * Purely presentational — no manifest access, so it's safe inside client
 * components (Lightbox) as long as the resolved ImageEntry arrives via props.
 *
 * Two layout modes, mirroring next/image:
 *   - intrinsic (default): width/height attributes reserve space, zero CLS
 *   - fill: absolutely positioned cover image inside a sized parent
 *     (pair with an object-cover / rounded className from the caller)
 */
export default function ResponsiveImage({
  image,
  alt,
  sizes = ARTICLE_SIZES,
  className,
  fill = false,
  eager = false,
}: {
  image: ImageEntry;
  alt: string;
  /** Responsive sizes attribute; defaults to the article column. */
  sizes?: string;
  /** Applied to the <img> element. */
  className?: string;
  fill?: boolean;
  /** Above-the-fold/LCP images: eager load + high fetch priority. */
  eager?: boolean;
}) {
  const base = baseVariants(image);
  const src = base ? base[base.length - 1].url : image.src;

  const style: React.CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...placeholderStyle(image) }
    : placeholderStyle(image);

  const img = (
    // Deliberate <img>: with images.unoptimized (Vercel quota) next/image
    // emits a plain <img> with no srcset; this component IS the optimizer,
    // fed by the build manifest.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(src)}
      srcSet={base && base.length > 1 ? toSrcSet(base) : undefined}
      sizes={base && base.length > 1 ? sizes : undefined}
      alt={alt}
      // Intrinsic dimensions reserve layout space (browsers derive the
      // aspect ratio); in fill mode the absolute positioning wins instead.
      width={image.width}
      height={image.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={className}
      style={style}
    />
  );

  // Passthrough (gif) and svg entries have no avif/webp ladders — plain <img>.
  const { avif, webp } = image.variants;
  if (!avif && !webp) return img;

  return (
    <picture>
      {avif && <source type="image/avif" srcSet={toSrcSet(avif)} sizes={sizes} />}
      {webp && image.format !== "webp" && (
        <source type="image/webp" srcSet={toSrcSet(webp)} sizes={sizes} />
      )}
      {img}
    </picture>
  );
}
