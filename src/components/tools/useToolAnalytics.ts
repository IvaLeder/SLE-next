"use client";

import { useCallback, useRef } from "react";
import type { Lang } from "@/lib/tools";
import { trackToolEvent, type ToolEventName } from "@/lib/tool-analytics";

/** Report a milestone at most once per mounted tool. This keeps sliders,
 * typing, and repeated practice from flooding GA4 with duplicate events. */
export function useToolEventOnce(
  event: ToolEventName,
  toolKey: string,
  lang: Lang,
) {
  const sent = useRef(false);
  return useCallback(
    (action?: string) => {
      if (sent.current) return;
      sent.current = true;
      trackToolEvent(event, {
        tool_key: toolKey,
        lang,
        source: "detail",
        ...(action ? { action } : {}),
      });
    },
    [event, lang, toolKey],
  );
}
