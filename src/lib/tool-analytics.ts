import type { Lang } from "@/lib/tools";

export type ToolEventName =
  | "tool_view"
  | "tool_start"
  | "tool_result"
  | "tool_complete"
  | "tool_fullscreen"
  | "tool_download"
  | "tool_related_click"
  | "tool_hub_click";

export interface ToolEventData {
  tool_key: string;
  lang: Lang;
  source?: "detail" | "hub";
  placement?: "featured" | "group";
  action?: string;
}

/** Push only low-cardinality interaction metadata. Never pass values entered
 * by a visitor (names, dates, messages, weights, or generated results). */
export function trackToolEvent(event: ToolEventName, data: ToolEventData) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}
