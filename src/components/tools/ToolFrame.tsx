"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    openLabel: "Fullscreen",
    open: "Open in fullscreen",
    closeLabel: "Close",
    close: "Close fullscreen",
  },
  hr: {
    openLabel: "Cijeli zaslon",
    open: "Otvori preko cijelog zaslona",
    closeLabel: "Zatvori",
    close: "Zatvori cijeli zaslon",
  },
} as const;

/**
 * Wraps an interactive tool with a "fullscreen" (focus) mode. Pressing the
 * button restyles the SAME wrapper to a full-screen overlay — the tool's DOM
 * node never moves, so its React state (the clock's time, a typed message, …)
 * is preserved across expand/collapse. Closes on ✕, backdrop click, or Escape.
 *
 * No portal on purpose: keeping the child in its original tree position is what
 * lets us toggle fullscreen without remounting (and losing) the tool.
 */
export default function ToolFrame({
  lang = "en",
  title,
  children,
}: {
  lang?: Lang;
  title?: string;
  children: React.ReactNode;
}) {
  const t = COPY[lang];
  const [expanded, setExpanded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while fullscreen, Escape to close, restore focus on close.
  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const trigger = btnRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [expanded]);

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6 lg:p-10"
          : "relative"
      }
      onClick={expanded ? (e) => e.target === e.currentTarget && setExpanded(false) : undefined}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? title : undefined}
    >
      {/* Toggle. In-flow toolbar button when inline; floating close when full. */}
      <div className={expanded ? "" : "mb-2 flex justify-end"}>
        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          aria-label={expanded ? t.close : t.open}
          className={
            expanded
              ? "fixed right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              : "inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          }
        >
          {expanded ? (
            <>✕ {t.closeLabel}</>
          ) : (
            <>
              <span aria-hidden="true">⤢</span> {t.openLabel}
            </>
          )}
        </button>
      </div>

      {/* The tool itself. When fullscreen it's centred and scaled up a little. */}
      <div
        onClick={expanded ? (e) => e.stopPropagation() : undefined}
        className={
          expanded
            ? // Mobile: plain full-width, no zoom (it already fills the screen).
              // Desktop: same width & proportions as the normal tool page
              // (max-w-3xl), scaled up so the whole tool — whitespace and all —
              // is genuinely bigger without the layout getting cramped.
              "w-full max-w-3xl lg:scale-110 xl:scale-125"
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
}
