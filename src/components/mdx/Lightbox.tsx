"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";

const LABELS = {
  en: {
    open: (alt: string) => (alt ? `Open image: ${alt}` : "Open image"),
    close: "Close image",
    dialog: "Image",
  },
  hr: {
    open: (alt: string) => (alt ? `Otvori sliku: ${alt}` : "Otvori sliku"),
    close: "Zatvori sliku",
    dialog: "Slika",
  },
} as const;

type Props = {
  src: string;
  alt: string;
  /** Optional explicit dimensions — used when MDX <Image width=… height=…/> form is used. */
  width?: number;
  height?: number;
  /** Vertical-margin utility for the wrapper button. Defaults to `my-6` for
   *  standalone images; <Figure> passes `""` since the <figure> owns spacing. */
  marginClass?: string;
  lang?: "en" | "hr";
};

/**
 * Wraps an MDX image with click-to-zoom. Renders the normal optimised
 * <Image> in the article; on click, opens a full-screen overlay with the
 * unoptimised (full-res) version.
 *
 * Closing: ESC, click outside, or close button. Locks body scroll while open.
 * Respects prefers-reduced-motion (no fade).
 */
export default function Lightbox({ src, alt, width, height, marginClass = "my-6", lang = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const t = LABELS[lang];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while the lightbox is open + restore on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus management for the modal: move focus to the close button on open,
  // return it to the trigger on close (keyboard/SR users would otherwise be
  // left "behind" the aria-modal overlay).
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const hasDims = Boolean(width && height);

  // ── Inline image (the normal article view) ────────────────────────────────
  const inlineImage = hasDims
    ? (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 768px) 768px, 100vw"
        // Render at natural size (never upscaled past the column), cap very tall
        // images, and centre anything narrower than the column with mx-auto.
        className="mx-auto block h-auto w-auto max-w-full max-h-[80vh] rounded-md cursor-zoom-in"
      />
    )
    : (
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        // contain, not cover: this fallback runs when dimensions are missing,
        // and cover crops anything that isn't 16:9 (cut-off labels on diagrams).
        // Letterboxing is always safe; the dims path renders true-ratio anyway.
        className="object-contain cursor-zoom-in"
      />
    );

  return (
    <>
      {/* Use a <button> wrapper for proper a11y semantics. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.open(alt)}
        className={
          hasDims
            ? `block ${marginClass} w-full bg-transparent border-0 p-0 cursor-zoom-in`
            : `block ${marginClass} relative w-full aspect-[16/9] overflow-hidden rounded-md bg-transparent border-0 p-0 cursor-zoom-in`
        }
      >
        {inlineImage}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || t.dialog}
          onClick={() => setOpen(false)}
          // The close button is the dialog's only focusable element, so the
          // Tab "trap" is simply: keep focus on it while the dialog is open.
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              closeRef.current?.focus();
            }
          }}
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
            ref={closeRef}
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-label={t.close}
            className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none flex items-center justify-center backdrop-blur"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
