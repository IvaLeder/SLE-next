import { renderToolsHubOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/tool-og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers: free interactive STEM tools";

export default function Image() {
  return renderToolsHubOg("en");
}
