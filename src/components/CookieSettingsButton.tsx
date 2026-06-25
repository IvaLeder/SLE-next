"use client";

import { ADSENSE_CLIENT } from "@/lib/ads";

const LABEL = { en: "Cookie settings", hr: "Postavke kolačića" } as const;

type GoogleFc = {
  callbackQueue?: Array<(() => void) | Record<string, () => void>>;
  showRevocationMessage?: () => void;
};

/**
 * Footer "Cookie settings" link — re-opens Google's certified CMP (AdSense
 * Privacy & messaging / Funding Choices) so the visitor can review or withdraw
 * consent (GDPR: withdrawal must be as easy as giving it). Google's CMP is the
 * single source of consent truth on the site; we no longer ship our own banner.
 *
 * The CMP lib (adsbygoogle.js) only loads on article pages, so on other pages
 * `googlefc` may be absent. We queue the revocation callback and, if the lib
 * isn't there yet, load it on demand — Funding Choices drains `callbackQueue`
 * once it initialises, so the message opens either way. No-op in dev/preview
 * where no publisher id is configured.
 */
export default function CookieSettingsButton({ lang }: { lang: "en" | "hr" }) {
  function openConsentSettings() {
    const w = window as Window & { googlefc?: GoogleFc };
    w.googlefc = w.googlefc || {};
    w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
    // Funding Choices runs queued callbacks on init (and immediately if already
    // initialised), so this opens the message whether or not the lib is loaded.
    w.googlefc.callbackQueue.push(() => w.googlefc?.showRevocationMessage?.());

    // If the CMP lib isn't on this page yet, load it so the queue can drain.
    if (ADSENSE_CLIENT && !document.getElementById("adsbygoogle-lib-ondemand")) {
      const s = document.createElement("script");
      s.id = "adsbygoogle-lib-ondemand";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(s);
    }
  }

  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="text-gray-700 hover:text-brand hover:underline"
    >
      {LABEL[lang]}
    </button>
  );
}
