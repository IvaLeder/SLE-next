import { renderPrintablesOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers: besplatni STEM materijali za ispis";

export default function Image() {
  return renderPrintablesOg("hr");
}
