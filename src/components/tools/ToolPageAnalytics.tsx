"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/tools";
import { trackToolEvent } from "@/lib/tool-analytics";

export default function ToolPageAnalytics({
  lang,
  toolKey,
  children,
}: {
  lang: Lang;
  toolKey: string;
  children: React.ReactNode;
}) {
  const started = useRef(false);

  useEffect(() => {
    trackToolEvent("tool_view", { tool_key: toolKey, lang, source: "detail" });
  }, [lang, toolKey]);

  const startOnce = (target: EventTarget | null) => {
    if (started.current || !(target instanceof Element)) return;
    if (!target.closest("[data-tool-interactive]")) return;
    started.current = true;
    trackToolEvent("tool_start", { tool_key: toolKey, lang, source: "detail" });
  };

  return (
    <div
      onPointerDownCapture={(event) => startOnce(event.target)}
      onKeyDownCapture={(event) => {
        if (event.key !== "Tab" && event.key !== "Escape") startOnce(event.target);
      }}
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest("a[download]")) {
          trackToolEvent("tool_download", { tool_key: toolKey, lang, source: "detail" });
        } else if (event.target.closest("[data-tool-related]")) {
          trackToolEvent("tool_related_click", { tool_key: toolKey, lang, source: "detail" });
        }
      }}
    >
      {children}
    </div>
  );
}
