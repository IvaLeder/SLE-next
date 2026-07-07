import Image from "next/image";
import ResponsiveImage from "./ResponsiveImage";
import { getImage } from "@/lib/assets";

/**
 * Article cover hero: 16:9 crop, eagerly loaded (it's the LCP candidate).
 * Manifest-backed covers (image pipeline) render as a responsive <picture>
 * with AVIF/WebP srcset + blur placeholder; files the manifest doesn't know
 * fall back to next/image exactly as before the pipeline existed.
 *
 * Server component — shared by the EN/HR article pages and draft previews.
 */
export default function CoverImage({
  src,
  alt,
  pinDescription,
  pinUrl,
}: {
  src: string;
  alt: string;
  /** Pinterest hover-save: description + canonical URL to attach to a pin. */
  pinDescription?: string;
  pinUrl?: string;
}) {
  const cover = getImage(src);

  return (
    <div className="w-full mb-6 relative aspect-[16/9]">
      {cover ? (
        <ResponsiveImage
          image={cover}
          alt={alt}
          fill
          eager
          // Article body is capped at max-w-3xl (~768 px). Above that
          // breakpoint the image never gets wider than 768 px, so don't
          // fetch 1920 px variants on a 4K screen.
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover rounded-2xl ring-1 ring-black/5"
          pinDescription={pinDescription}
          pinUrl={pinUrl}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover rounded-2xl ring-1 ring-black/5"
          data-pin-description={pinDescription}
          data-pin-url={pinUrl}
        />
      )}
    </div>
  );
}
