"use client";

import { useEffect, useState } from "react";

/**
 * Slim top progress bar + back-to-top button.
 *
 * - Progress bar tracks how far down the page the reader has scrolled.
 * - Back-to-top button appears after 800 px of scroll; smooth-scrolls home.
 * - Both bail out for users who prefer reduced motion (skip the bar entirely
 *   — it's decorative — and the back-to-top button uses an instant jump).
 *
 * Single `scroll` listener with rAF throttling so it's cheap on long posts.
 */
export default function ReadingProgress({ lang = "en" }: { lang?: "en" | "hr" }) {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop]   = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
      setShowTop(scrollTop > 800);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  };

  const label = lang === "hr" ? "Na vrh" : "Back to top";

  return (
    <>
      {/* Progress bar sits flush at the top, just under the sticky header.
          Hidden via `data-no-print` (see globals.css print rule). */}
      <div
        data-no-print
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none motion-reduce:hidden"
      >
        <div
          className="h-full bg-indigo-600 transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back-to-top — bottom-right floating button, hidden until scrolled. */}
      <button
        data-no-print
        type="button"
        onClick={handleTop}
        aria-label={label}
        className={`fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-opacity ${
          showTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 mx-auto" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
