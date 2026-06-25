import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";

// Public env var — bundled into the client. Absent in local/preview =>
// nothing is injected, so dev traffic stays out of analytics.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Google Tag Manager loader with Google Consent Mode v2 regional defaults.
 *
 * Why this exists as a wrapper:
 *   GTM must be paired with a consent-default script that runs BEFORE GTM,
 *   otherwise tags fire (and cookies write) before consent is resolved.
 *   Encapsulating both calls together makes that invariant local — callers
 *   can't accidentally render one without the other. Both root layouts
 *   ((en) + (hr)) render this, so isolating it keeps them in lockstep.
 *
 * Consent UI:
 *   The visible consent prompt is Google's certified CMP (AdSense → Privacy &
 *   messaging / Funding Choices), loaded by the AdSense library on article
 *   pages. It writes the IAB TCF string AND drives Consent Mode, so we do NOT
 *   ship our own banner — a second prompt would mean two conflicting consent
 *   records. This component only sets the Consent Mode *defaults* that apply
 *   before/until the CMP resolves.
 *
 * GDPR posture (see the inline comments below):
 *   - EEA + UK + Switzerland default to "denied" until the visitor opts in via
 *     Google's CMP — no analytics/ads cookies until then (GDPR-defensible).
 *   - Everywhere else defaults to "granted" (no prior opt-in legally required),
 *     which fixes the chronic undercounting of our non-EEA (SG-heavy) audience.
 *   - `security_storage: granted` covers fraud-prevention / CSRF (legitimate
 *     interest, no consent needed).
 *
 * Loading order is critical:
 *   - `beforeInteractive` runs in <head> during SSR, before any GTM script can
 *     execute. Only works in root layouts — that's where we render it.
 *   - GoogleTagManager uses `afterInteractive` internally; by the time it fires
 *     the consent defaults are already on the dataLayer.
 */
export default function GtmWithConsent() {
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

          // Regional Consent Mode defaults. Google resolves the visitor's region
          // server-side (no IP geolocation needed here) and applies the most
          // specific matching 'default'.
          //
          // 1) Global default = GRANTED. Most of our audience is outside the EEA
          //    (Singapore-heavy on EN), where prior opt-in isn't legally required,
          //    so tracking these visitors by default fixes the chronic
          //    undercounting. The region override below tightens this for the EEA.
          gtag('consent', 'default', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            personalization_storage: 'granted',
            security_storage: 'granted'
          });

          // 2) EEA + UK + Switzerland override = DENIED until the visitor opts in
          //    via Google's CMP (GDPR / UK GDPR / Swiss FADP need prior opt-in).
          //    NOTE: Croatia (HR) is in this list, so our Croatian audience is
          //    correctly deny-by-default. Region matching is by visitor geo, not
          //    by site language. security_storage stays granted (legitimate
          //    interest, fraud-prevention).
          gtag('consent', 'default', {
            region: [
              'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
              'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
              'IS','LI','NO','GB','CH'
            ],
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted'
          });
        `}
      </Script>
      <GoogleTagManager gtmId={GTM_ID} />
    </>
  );
}
