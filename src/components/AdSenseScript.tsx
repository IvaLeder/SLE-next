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
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
