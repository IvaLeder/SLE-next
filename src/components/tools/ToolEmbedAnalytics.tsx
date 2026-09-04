"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/tools";
import { trackToolEvent } from "@/lib/tool-analytics";
import { ToolAnalyticsProvider } from "@/components/tools/ToolAnalyticsContext";

/** Add view/start milestones to article embeds and identify their result events
 * as article interactions rather than standalone tool-page interactions. */
export default function ToolEmbedAnalytics({
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
    trackToolEvent("tool_view", { tool_key: toolKey, lang, source: "article" });
  }, [lang, toolKey]);

  const startOnce = () => {
    if (started.current) return;
    started.current = true;
    trackToolEvent("tool_start", { tool_key: toolKey, lang, source: "article" });
  };

  return (
    <ToolAnalyticsProvider source="article">
      <div
        onPointerDownCapture={startOnce}
        onKeyDownCapture={(event) => {
          if (event.key !== "Tab" && event.key !== "Escape") startOnce();
        }}
      >
        {children}
      </div>
    </ToolAnalyticsProvider>
  );
}
