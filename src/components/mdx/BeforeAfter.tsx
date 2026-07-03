"use client";

import { useState } from "react";
import Image from "next/image";

type Lang = "en" | "hr";

const COPY = {
  en: { before: "Before", after: "After", slider: "Comparison slider" },
  hr: { before: "Prije", after: "Poslije", slider: "Klizač za usporedbu" },
} as const;

interface BeforeAfterProps {
  lang?: Lang;
  /** image srcs, e.g. /images/posts/… */
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** corner badges — default to Before/After (Prije/Poslije) */
  beforeLabel?: string;
  afterLabel?: string;
  /** width/height, e.g. "1.5". Injected by the MDX factory from the before
   *  image's real dimensions; only pass explicitly for remote images. */
  ratio?: number | string;
}

/**
 * Draggable before/after image comparison:
 *
 *   <BeforeAfter
 *     before="/images/posts/fresh-apple.jpg"
 *     after="/images/posts/oxidized-apple.jpg"
 *     beforeAlt="Freshly cut apple" afterAlt="Browned apple after an hour" />
 *
 * The drag surface is a full-area transparent <input type="range">, so
 * keyboard (arrow keys), mouse, and touch all work with no pointer math.
 */
export default function BeforeAfter({
  lang = "en",
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  ratio,
}: BeforeAfterProps) {
  const t = COPY[lang];
  const [value, setValue] = useState(50);

  const labelBefore = beforeLabel ?? t.before;
  const labelAfter = afterLabel ?? t.after;

  return (
    <div className="not-prose my-8">
      <div
        className="relative w-full select-none overflow-hidden rounded-lg bg-gray-100"
        style={{ aspectRatio: String(ratio ?? "16 / 9") }}
      >
        <Image
          src={after}
          alt={afterAlt ?? labelAfter}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          loading="lazy"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <Image
            src={before}
            alt={beforeAlt ?? labelBefore}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            loading="lazy"
            className="object-cover"
          />
        </div>

        {/* divider + handle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]"
          style={{ left: `${value}%` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-sans text-xs font-bold text-gray-700 shadow-lg"
          style={{ left: `${value}%` }}
        >
          ⇄
        </div>

        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 font-sans text-xs font-semibold text-white">
          {labelBefore}
        </span>
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 font-sans text-xs font-semibold text-white">
          {labelAfter}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          // browser form-restore (reload/back-nav) would desync the thumb
          // from React state — this input's position is purely UI state
          autoComplete="off"
          aria-label={t.slider}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
