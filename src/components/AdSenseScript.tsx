import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";

/**
 * Loads the AdSense library once on article pages. No-op when the publisher id
 * isn't configured, so dev/preview never pull the ad script.
 *
 * Consent Mode (set beforeInteractive in the root layouts via GtmWithConsent)
 * is already on the dataLayer by the time this afterInteractive script runs, so
 * AdSense reads the ad-consent signals automatically — non-personalized before
 * consent, personalized after opt-in. No extra gating needed here.
 */
export default function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <Script
      id="adsbygoogle-lib"
      // lazyOnload (not afterInteractive): the AdSense library is ~388 KiB of
      // main-thread-heavy JS and was the single biggest "unused JavaScript"
      // offender in PageSpeed, congesting the render path and delaying the
      // (text) LCP. Loading it during browser idle after `load` keeps ads
      // serving while taking them off the critical path — a Core Web Vitals win
      // Google rewards. The first in-feed/in-article unit sits below the fold,
      // so deferral doesn't hurt above-the-fold ad viewability.
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
