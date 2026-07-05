import { renderSummerOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Summer of curiosity — free summer STEM e-book for kids";

export default function Image() {
  return renderSummerOg("en");
}
