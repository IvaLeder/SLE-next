import { renderAdventOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM adventski kalendar - 24 dana božićne znanosti za djecu";

export default function Image() {
  return renderAdventOg("hr");
}
