"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Optional explicit dimensions — used when MDX <Image width=… height=…/> form is used. */
  width?: number;
  height?: number;
};

/**
 * Wraps an MDX image with click-to-zoom. Renders the normal optimised
 * <Image> in the article; on click, opens a full-screen overlay with the
 * unoptimised (full-res) version.
 *
 * Closing: ESC, click outside, or close button. Locks body scroll while open.
 * Respects prefers-reduced-motion (no fade).
 */
export default function Lightbox({ src, alt, width, height }: Props) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the lightbox is open + restore on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ── Inline image (the normal article view) ────────────────────────────────
  const inlineImage = width && height
    ? (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 768px) 768px, 100vw"
        className="rounded-md w-full h-auto cursor-zoom-in"
      />
    )
    : (
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover cursor-zoom-in"
      />
    );

  return (
    <>
      {/* Use a <button> wrapper for proper a11y semantics. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Open image: ${alt}` : "Open image"}
        className={
          width && height
            ? "block my-6 w-full bg-transparent border-0 p-0 cursor-zoom-in"
            : "block my-6 relative w-full aspect-[16/9] overflow-hidden rounded-md bg-transparent border-0 p-0 cursor-zoom-in"
        }
      >
        {inlineImage}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Image"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out motion-safe:animate-[fadeIn_120ms_ease-out]"
        >
          {/* Stop click bubbling so clicks ON the image don't dismiss. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[95vw] max-h-[95vh]"
          >
            <NextImage
              src={src}
              alt={alt}
              width={width ?? 1920}
              height={height ?? 1080}
              sizes="95vw"
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
            />
          </div>

          {/* Close button — top-right of the viewport */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-label="Close image"
            className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none flex items-center justify-center backdrop-blur"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
