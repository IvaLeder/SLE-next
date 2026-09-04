"use client";

import { useEffect, useRef } from "react";
import { parseNewsletterSource, type Lang } from "@/lib/newsletter";
import { trackSiteEvent } from "@/lib/site-analytics";

/** Report a successful API redirect or Mailchimp confirmation without carrying
 * email, name, audience id, or any other subscriber data into analytics. */
export default function NewsletterStatusAnalytics({
  lang,
  kind,
}: {
  lang: Lang;
  kind: "thankYou" | "welcome";
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const querySource = new URLSearchParams(window.location.search).get("source");
    const source = parseNewsletterSource(querySource) ?? (kind === "welcome" ? "confirmation" : "unknown");
    trackSiteEvent(
      kind === "welcome" ? "newsletter_signup_completed" : "newsletter_signup_submitted",
      { lang, source },
    );
  }, [kind, lang]);

  return null;
}
