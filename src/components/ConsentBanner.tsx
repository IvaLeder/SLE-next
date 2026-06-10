"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";
// Fired whenever the consent choice changes in THIS tab (choose/withdraw), so
// the banner re-evaluates immediately. Cross-tab changes arrive via "storage".
const CHANGE_EVENT = "cookie-consent-change";

// Consent Mode v2 categories. `security_storage` stays granted (set in the
// default script) — it's fraud-prevention and doesn't need consent.
const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
  functionality_storage: "granted",
  personalization_storage: "granted",
} as const;

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
} as const;

declare global {
  interface Window {
    // Defined by the consent-defaults script in GtmWithConsent.
    gtag?: (...args: unknown[]) => void;
  }
}

const COPY = {
  en: {
    label: "Cookie consent",
    text: "We use cookies to understand how the site is used and improve it.",
    privacy: "Privacy Policy",
    accept: "Accept",
    decline: "Decline",
  },
  hr: {
    label: "Privola za kolačiće",
    text: "Koristimo kolačiće kako bismo razumjeli korištenje stranice i poboljšali je.",
    privacy: "Politika privatnosti",
    accept: "Prihvati",
    decline: "Odbij",
  },
} as const;

// Session-scoped fallback so a choice still dismisses the banner when
// localStorage is blocked (e.g. Safari private mode).
let sessionChoice: "granted" | "denied" | null = null;

// Has the visitor already chosen? Read via useSyncExternalStore so SSR renders
// nothing (server snapshot = true) and the client flips to the real value after
// hydration — no hydration mismatch, and no setState-in-effect. The store
// notifies on CHANGE_EVENT (same tab) and "storage" (other tabs).
function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function hasStoredChoice() {
  try {
    const v = localStorage.getItem(STORAGE_KEY) ?? sessionChoice;
    return v === "granted" || v === "denied";
  } catch {
    return sessionChoice !== null;
  }
}
const hasStoredChoiceServer = () => true;

/**
 * Withdraw the stored consent choice and re-show the banner — wired to the
 * "Cookie settings" footer link (GDPR: withdrawing consent must be as easy as
 * giving it). Reverts Consent Mode to denied until the visitor chooses again.
 */
export function clearConsentChoice() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage blocked — session fallback below still clears */
  }
  sessionChoice = null;
  window.gtag?.("consent", "update", DENIED);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * GDPR cookie-consent banner. Renders only when no prior choice is stored.
 * On Accept/Decline it updates Google Consent Mode (`gtag('consent','update')`)
 * and persists the choice in localStorage; the GtmWithConsent default script
 * re-applies a stored "granted" on subsequent visits before GTM evaluates.
 *
 * Non-modal by design (doesn't trap focus or block the page) — it's a
 * complementary region, reachable by keyboard, dismissed by an explicit choice.
 */
export default function ConsentBanner({ lang }: { lang: "en" | "hr" }) {
  const t = COPY[lang];
  const choiceMade = useSyncExternalStore(
    subscribe,
    hasStoredChoice,
    hasStoredChoiceServer
  );

  function choose(granted: boolean) {
    const v = granted ? "granted" : "denied";
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // localStorage blocked — sessionChoice below still dismisses the banner
      // for this session, and the consent update applies either way.
    }
    sessionChoice = v;
    window.gtag?.("consent", "update", granted ? GRANTED : DENIED);
    // Notify the store so the banner hides without local dismissed-state.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  if (choiceMade) return null;

  const btnBase =
    "min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold font-sans transition-colors";

  return (
    <section
      aria-label={t.label}
      data-no-print
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-gray-200 bg-white/95 backdrop-blur shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:gap-4">
        <p className="text-sm leading-relaxed text-gray-700 font-sans">
          {t.text}{" "}
          <Link
            href={`/${lang}/privacy`}
            className="text-brand underline hover:text-brand-hover"
          >
            {t.privacy}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className={`${btnBase} border border-gray-300 text-gray-700 hover:bg-gray-50`}
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className={`${btnBase} bg-brand text-white hover:bg-brand-hover`}
          >
            {t.accept}
          </button>
        </div>
      </div>
    </section>
  );
}
