"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const LABEL = { en: "Advertisement", hr: "Oglas" } as const;

/** How early (before a unit scrolls into view) to request its ad. Roughly one
 *  mobile screen — enough lead time to render, short enough that units the
 *  reader never reaches never request. */
const ROOT_MARGIN = "600px 0px";

type Props = {
  /** AdSense ad-unit slot id (10 digits). */
  slot: string;
  lang?: "en" | "hr";
  /** In-article native format (default), a standard responsive display unit,
   *  or an in-feed native unit (requires `layoutKey`). */
  format?: "in-article" | "display" | "in-feed";
  /** Google-generated layout key for in-feed units (from the ad unit's code). */
  layoutKey?: string;
  /** "inline" (default): labeled block for article flow.
   *  "card": PostCard-style shell so the unit can sit inside a post grid. */
  variant?: "inline" | "card";
};

/**
 * A single AdSense ad unit. Renders nothing until a publisher id + slot exist
 * (so dev/preview stay clean), and collapses itself — label included — if
 * AdSense returns no ad (`data-ad-status="unfilled"`), so readers never see a
 * blank reserved gap. Consent (personalized vs not) is handled globally by
 * Google Consent Mode, set in GtmWithConsent.
 */
export default function AdSlot({
  slot,
  lang = "en",
  format = "in-article",
  layoutKey,
  variant = "inline",
}: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;

    const ins = insRef.current;
    if (!ins) return;

    /**
     * Request an ad for this unit exactly once — and only once the unit is
     * near the viewport.
     *
     * AdSense counts an impression when a unit *renders*, not when it is seen,
     * so pushing every unit at mount burns an unviewed impression on each unit
     * the reader never scrolls to. On these (long) articles that dragged
     * account-wide Active View from ~89% to ~24%, and viewability is what the
     * auction bids on — so the unseen units were also depressing the price of
     * the seen ones. Gating on proximity means a unit the reader never reaches
     * simply never requests, which costs nothing.
     *
     * ROOT_MARGIN is generous enough that the ad has rendered by the time it
     * scrolls into view; units already on screen (e.g. the first in-feed card)
     * fire immediately, since IntersectionObserver reports initial state.
     */
    const request = () => {
      if (pushed.current) return;
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* adsbygoogle.js not ready or blocked — leave the slot empty. */
      }
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      request(); // Very old browser: fall back to the previous eager behaviour.
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            request();
            io?.disconnect();
          }
        },
        { rootMargin: ROOT_MARGIN }
      );
      io.observe(ins);
    }

    // Hide the whole block if Google declines to fill it.
    const sync = () => {
      if (ins.getAttribute("data-ad-status") === "unfilled") {
        // DOM-sync setState (same pattern as TOC) — runs once when AdSense
        // marks the unit unfilled, not a render cascade.
         
        setUnfilled(true);
      }
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => {
      io?.disconnect();
      obs.disconnect();
    };
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot || unfilled) return null;

  const formatProps =
    format === "in-article"
      ? { "data-ad-layout": "in-article", "data-ad-format": "fluid" }
      : format === "in-feed"
        ? { "data-ad-format": "fluid", "data-ad-layout-key": layoutKey }
        : { "data-ad-format": "auto", "data-full-width-responsive": "true" };

  if (variant === "card") {
    // Grid-cell shell matching PostCard's chrome; the whole card (border,
    // label and all) still collapses via the unfilled check above.
    return (
      <div
        data-no-print
        className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow"
      >
        <span className="mb-2 block font-sans text-[11px] uppercase tracking-wider text-gray-400">
          {LABEL[lang]}
        </span>
        <ins
          ref={insRef}
          className="adsbygoogle flex-1"
          style={{ display: "block", minHeight: 250 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          {...formatProps}
        />
      </div>
    );
  }

  return (
    <div data-no-print className="not-prose my-10 text-center">
      <span className="mb-1 block font-sans text-[11px] uppercase tracking-wider text-gray-400">
        {LABEL[lang]}
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 100, textAlign: "center" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        {...formatProps}
      />
    </div>
  );
}
