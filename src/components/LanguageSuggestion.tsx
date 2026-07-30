"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

// Soft language nudge for Croatian-speaking visitors who land on an English
// page (the common case: Google links straight to /en/..., so the
// Accept-Language redirect in proxy.ts never fires for search traffic).
//
// Deliberately a *suggestion*, not a redirect: /en/* URLs stay stable for
// Googlebot and for the many Croatian readers who want the English version.
// Everything happens client-side after hydration, so static rendering and
// hreflang are untouched.
//
// Positioned `fixed` so it can never shift the page (CLS + ad viewability),
// and it reserves the bottom-right corner where ReadingProgress floats its
// back-to-top button.

const STORAGE_KEY = "sle-lang-nudge";

type Props = {
  /** Croatian twin of the current page (or /hr when there is no translation). */
  switchUrl: string;
  /** True when switchUrl is the /hr home fallback, so the copy stays generic. */
  siteWide: boolean;
};

/**
 * True when Croatian outranks English in the browser's ordered language list.
 * Someone whose list is ["en-GB", "hr"] reads English by choice, so they are
 * not nudged; a Croatian phone reports ["hr-HR"] and is.
 */
function prefersCroatian(): boolean {
  const list =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
  const tags = list.filter(Boolean).map((t) => t.toLowerCase());
  const hr = tags.findIndex((t) => t.startsWith("hr"));
  const en = tags.findIndex((t) => t.startsWith("en"));
  return hr !== -1 && (en === -1 || hr < en);
}

/** Should this visitor be offered Croatian? Browser-only, never on the server. */
function eligibleNow(): boolean {
  // Escape hatch for checking the live card without changing your device
  // language: append ?lang-nudge=1 to any English URL.
  const forced = new URLSearchParams(window.location.search).has("lang-nudge");
  if (forced) return true;

  try {
    if (localStorage.getItem(STORAGE_KEY) === "off") return false;
  } catch {
    // Storage blocked (private mode / cookie-less browser) — show the nudge
    // anyway; the worst case is that it reappears on a later visit.
  }
  return prefersCroatian();
}

// Nothing to subscribe to: the answer only changes when we write to storage,
// and that happens in this component's own click handlers.
const noSubscribe = () => () => {};

export default function LanguageSuggestion({ switchUrl, siteWide }: Props) {
  // useSyncExternalStore rather than an effect: the server snapshot is `false`,
  // so the server markup and the hydrating client render agree, and the real
  // answer lands right after hydration without a mismatch warning.
  const eligible = useSyncExternalStore(noSubscribe, eligibleNow, () => false);
  const [dismissed, setDismissed] = useState(false);

  // Both actions retire the nudge for good. After a switch the reader has seen
  // the language toggle, which now also sits in the mobile header bar.
  const retire = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "off");
    } catch {
      /* nothing to persist to — fine */
    }
  };

  if (!eligible || dismissed) return null;

  return (
    <div
      data-no-print
      lang="hr"
      role="region"
      aria-label="Odabir jezika"
      className="fixed z-[70] bottom-3 left-3 right-[4.5rem] sm:left-auto sm:right-4 sm:w-80 rounded-lg border border-gray-200 bg-white p-3 pr-9 shadow-lg font-sans text-sm"
    >
      <button
        type="button"
        onClick={retire}
        aria-label="Zatvori i ostani na engleskom"
        className="absolute top-1 right-1 w-8 h-8 leading-none text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-muted rounded"
      >
        ✕
      </button>

      <p className="leading-snug">
        {siteWide
          ? "Naš sadržaj dostupan je i na hrvatskom."
          : "Ova stranica dostupna je i na hrvatskom."}
      </p>

      <Link
        href={switchUrl}
        hrefLang="hr"
        onClick={retire}
        className="mt-2 inline-flex items-center min-h-[40px] px-3 rounded bg-brand text-white font-semibold hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-muted focus:ring-offset-2"
      >
        {siteWide ? "Idi na hrvatsku verziju" : "Čitaj na hrvatskom"}
      </Link>
    </div>
  );
}
