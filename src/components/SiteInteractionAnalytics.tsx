"use client";

import { useEffect } from "react";
import { trackSiteEvent, type SiteEventName } from "@/lib/site-analytics";

const CLICK_EVENTS = new Set<SiteEventName>([
  "newsletter_cta_click",
  "resource_download",
]);

/**
 * One delegated listener covers declaratively marked links across server
 * components. Only authored data-* values are reported; link text, URLs and
 * visitor-entered values never enter the event payload.
 */
export default function SiteInteractionAnalytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-analytics-event]");
      if (!target) return;

      const eventName = target.dataset.analyticsEvent as SiteEventName | undefined;
      if (!eventName || !CLICK_EVENTS.has(eventName)) return;

      const documentLang = document.documentElement.lang === "hr" ? "hr" : "en";
      trackSiteEvent(eventName, {
        lang: target.dataset.analyticsLang === "hr" ? "hr" : documentLang,
        source: target.dataset.analyticsSource,
        placement: target.dataset.analyticsPlacement,
        resource_id: target.dataset.analyticsResourceId,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
