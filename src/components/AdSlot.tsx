"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const LABEL = { en: "Advertisement", hr: "Oglas" } as const;

type Props = {
  /** AdSense ad-unit slot id (10 digits). */
  slot: string;
  lang?: "en" | "hr";
  /** In-article native format (default) or a standard responsive display unit. */
  format?: "in-article" | "display";
};

/**
 * A single AdSense ad unit. Renders nothing until a publisher id + slot exist
 * (so dev/preview stay clean), and collapses itself — label included — if
 * AdSense returns no ad (`data-ad-status="unfilled"`), so readers never see a
 * blank reserved gap. Consent (personalized vs not) is handled globally by
 * Google Consent Mode, set in GtmWithConsent.
 */
export default function AdSlot({ slot, lang = "en", format = "in-article" }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;

    // Request an ad for this unit exactly once per mount.
    if (!pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* adsbygoogle.js not ready or blocked — leave the slot empty. */
      }
    }

    // Hide the whole block if Google declines to fill it.
    const ins = insRef.current;
    if (!ins) return;
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
    return () => obs.disconnect();
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot || unfilled) return null;

  const formatProps =
    format === "in-article"
      ? { "data-ad-layout": "in-article", "data-ad-format": "fluid" }
      : { "data-ad-format": "auto", "data-full-width-responsive": "true" };

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
