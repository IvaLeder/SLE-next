import type { ReactNode } from "react";
import { Fraunces } from "next/font/google";

// Display face for Mind Explorers headings only — body copy stays Lora
// (Phase 0 decision, BACKLOG §1c). Loaded here rather than in the root
// layouts so STEM pages never download it; latin-ext covers č ć đ š ž.
// The SOFT axis carries the brand sheet's "soft optical settings" — the
// actual variation values are applied in globals.css under [data-theme="minds"].
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

/**
 * Theme scope for Mind Explorers (the psychology sub-brand).
 *
 * Wrap a page or subtree and the [data-theme="minds"] block in globals.css
 * re-themes every brand/newsletter-token component inside it to the
 * plum/gold/cream palette, and headings switch to Fraunces.
 *
 * See mind-explorers-brand-sheet.md (repo root) and BACKLOG §1c.
 */
export default function MindsTheme({ children }: { children: ReactNode }) {
  return (
    <div data-theme="minds" className={fraunces.variable}>
      {children}
    </div>
  );
}
