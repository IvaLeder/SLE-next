import { renderPumpkinsOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Pumpkins & Potions - an autumn science lab for kids";

export default function Image() {
  return renderPumpkinsOg("en");
}
