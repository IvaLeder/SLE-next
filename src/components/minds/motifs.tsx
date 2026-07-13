import type { ReactNode } from "react";

/**
 * Mind Explorers motif components — the "embroidered map" decorative
 * vocabulary from brand sheet §5. These are the ONLY decorations allowed on
 * minds surfaces, and the restraint rule applies: one motif per layout.
 *
 * All colours read the minds theme tokens with hard-coded brand fallbacks,
 * so the components also render correctly if ever used outside the scope.
 *
 * The values here ARE the UI-scale spec (the sheet has none): stitch = single
 * 2px line, dash 7/5, round caps, winding never straight; compass = 48
 * viewBox, dash 3/2.5, gold centre knot; knot = 12px gold fill with
 * gold-deep ring. Fold into sheet v1.4+ as §5b.
 */

/**
 * Stitch path §5.1 — a single winding running-stitch line, used as a section
 * divider on minds surfaces. Renders at a fixed 320×20 design size scaled by
 * width; keep it modest (max-w-xs/sm) so it reads as an ornament, not a rule.
 */
export function StitchDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 28"
      className={`h-7 w-full max-w-xs ${className}`}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M6 14 C 42 -2, 78 30, 114 14 C 150 -2, 186 30, 222 14 C 254 0, 288 24, 314 12"
        stroke="var(--me-motif, #C99B3F)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="7 5"
      />
    </svg>
  );
}

/**
 * Compass mark §5.3 / §10 — the logo-mark candidate: a four-point compass
 * star drawn as running stitches with a gold french knot at the centre.
 * Same star family as Luma and Aska's collar tag. Legible down to 16px
 * (favicon); the stitch dashes read from ~32px up. Also the "you are here"
 * marker in diagrams.
 */
export function CompassMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M24 3 L29.5 18.5 L45 24 L29.5 29.5 L24 45 L18.5 29.5 L3 24 L18.5 18.5 Z"
        stroke="var(--me-heading, #4C3A72)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray="3 2.5"
      />
      <circle
        cx="24"
        cy="24"
        r="3.2"
        fill="var(--me-gold, #E8B454)"
        stroke="var(--me-motif, #C99B3F)"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * Paper frame §5.4 — cream cut-paper frame with layered drop shadow, for
 * portraits, key illustrations and (later) video end-card pages. CSS
 * approximation of the ornate frame from the approved pose sheet: a slightly
 * rotated second paper layer peeks out behind. No surface uses it yet —
 * first candidates are Nova vignette images and the YouTube end-card page.
 */
export function PaperFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[1.75rem] bg-[var(--me-cream,#FAF6EE)] p-3 shadow-[0_1px_2px_rgba(42,36,64,0.10),0_6px_16px_rgba(42,36,64,0.14)] before:absolute before:inset-0 before:-z-10 before:rotate-[1.2deg] before:rounded-[1.75rem] before:bg-[var(--me-surface,#FFFDF8)] before:shadow-[0_2px_8px_rgba(42,36,64,0.10)] ${className}`}
    >
      <div className="overflow-hidden rounded-[1.25rem]">{children}</div>
    </div>
  );
}
