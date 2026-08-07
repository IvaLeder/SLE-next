"use client";

import type { Lang } from "@/lib/tools";
import { trackToolEvent } from "@/lib/tool-analytics";

export default function ToolsHubAnalytics({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLElement>("[data-tool-key]");
        const toolKey = link?.dataset.toolKey;
        if (!toolKey) return;
        trackToolEvent("tool_hub_click", {
          tool_key: toolKey,
          lang,
          source: "hub",
          placement: link.dataset.toolPlacement === "featured" ? "featured" : "group",
        });
      }}
    >
      {children}
    </div>
  );
}
