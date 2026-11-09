import { renderAdventOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The STEM Advent Calendar - 24 days of Christmas science for kids";

export default function Image() {
  return renderAdventOg("en");
}
