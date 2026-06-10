"use client";

import { clearConsentChoice } from "./ConsentBanner";

const LABEL = { en: "Cookie settings", hr: "Postavke kolačića" } as const;

/**
 * Footer "Cookie settings" link — withdraws the stored consent choice and
 * re-opens the consent banner so the visitor can decide again (GDPR requires
 * withdrawal to be as easy as consent). Styled to match the footer's links.
 */
export default function CookieSettingsButton({ lang }: { lang: "en" | "hr" }) {
  return (
    <button
      type="button"
      onClick={clearConsentChoice}
      className="text-gray-700 hover:text-brand hover:underline"
    >
      {LABEL[lang]}
    </button>
  );
}
