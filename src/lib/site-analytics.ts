export type SiteEventName =
  | "contact_form_success"
  | "newsletter_cta_click"
  | "newsletter_signup_attempt"
  | "newsletter_signup_error"
  | "newsletter_signup_submitted"
  | "newsletter_signup_completed"
  | "resource_download";

export interface SiteEventData {
  lang: "en" | "hr";
  source?: string;
  placement?: string;
  resource_id?: string;
  error_code?: string;
}

const SAFE_VALUE = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

/**
 * Send only deliberately small, low-cardinality values to GTM. The allow-list
 * drops obvious free-form values such as email addresses, messages, URLs, and
 * sentences. Callers must still pass authored labels rather than visitor input.
 */
export function trackSiteEvent(event: SiteEventName, data: SiteEventData) {
  if (typeof window === "undefined") return;

  const payload: Record<string, string> = { event, lang: data.lang };
  for (const key of ["source", "placement", "resource_id", "error_code"] as const) {
    const value = data[key];
    if (value && SAFE_VALUE.test(value)) payload[key] = value;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}
