"use client";

import type { Lang } from "@/lib/tools";
import { trackToolEvent } from "@/lib/tool-analytics";

export default function ToolLinksAnalytics({
  lang,
  source,
  children,
}: {
  lang: Lang;
  source: "home" | "article";
  children: React.ReactNode;
}) {
  return (
    <div
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLElement>("[data-tool-key]");
        const toolKey = link?.dataset.toolKey;
        if (!toolKey) return;
        trackToolEvent("tool_discovery_click", {
          tool_key: toolKey,
          lang,
          source,
          placement: source === "home" ? "featured" : "contextual",
        });
      }}
    >
      {children}
    </div>
  );
}
