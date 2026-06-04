import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import ConsentBanner from "./ConsentBanner";

// Public env var — bundled into the client. Absent in local/preview =>
// nothing is injected, so dev traffic stays out of analytics.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Google Tag Manager loader with Google Consent Mode v2 defaults.
 *
 * Why this exists as a wrapper:
 *   1. GTM must be paired with a consent-default script that runs BEFORE GTM,
 *      otherwise tags fire (and cookies write) before the user has a chance to
 *      consent. Encapsulating both calls together makes that invariant local —
 *      callers can't accidentally render one without the other.
 *   2. Both root layouts ((en) + (hr)) need identical wiring, so isolating it
 *      keeps them in lockstep when we later add a consent banner.
 *
 * GDPR posture:
 *   - All storage categories default to "denied" → no analytics/ads cookies
 *     are written until the visitor accepts (deny-by-default = GDPR-defensible).
 *   - `security_storage: granted` covers fraud-prevention / CSRF, which has a
 *     legitimate-interest basis and doesn't need explicit consent.
 *   - Consent is granted by <ConsentBanner>, which calls
 *     `gtag('consent','update', …)` and stores the choice. Returning visitors
 *     who accepted are re-granted synchronously below — BEFORE GTM evaluates —
 *     so their first pageview is consented (not just subsequent ones).
 *   - `window.gtag` is exposed here so the banner reuses this exact shim (the
 *     `arguments`-object shape Consent Mode requires).
 *
 * Loading order is critical:
 *   - `beforeInteractive` runs in <head> during SSR, before any GTM script
 *     can execute. Only works in root layouts — that's where we render it.
 *   - GoogleTagManager uses `afterInteractive` internally, which fires after
 *     hydration. By then the consent defaults (and any stored grant) are on
 *     the dataLayer.
 */
export default function GtmWithConsent({ lang }: { lang: "en" | "hr" }) {
  if (!GTM_ID) return null;

  return (
    <>
      {/* The lint rule below is a Pages-Router relic — `beforeInteractive` IS
          supported inside App Router root layouts, which is where this renders.
          We need it: Consent Mode defaults must land on the dataLayer BEFORE
          GTM evaluates them. */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="gtm-consent-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){ dataLayer.push(arguments); };
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted'
          });
          try {
            if (localStorage.getItem('cookie-consent') === 'granted') {
              gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted',
                functionality_storage: 'granted',
                personalization_storage: 'granted'
              });
            }
          } catch (e) {}
        `}
      </Script>
      <GoogleTagManager gtmId={GTM_ID} />
      <ConsentBanner lang={lang} />
    </>
  );
}
