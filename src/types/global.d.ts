// Global ambient types.

export {};

declare global {
  interface Window {
    // Google Tag Manager's dataLayer. Initialised by the Consent Mode script in
    // GtmWithConsent (beforeInteractive), so it exists before any component runs
    // — but typed optional so callers still guard with `?.` defensively.
    dataLayer?: Record<string, unknown>[];
  }
}
