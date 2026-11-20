// Static export: rendered once at build time.
export const dynamic = "force-static";

import { renderPrintablesOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers: besplatni STEM materijali za ispis";

export default function Image() {
  return renderPrintablesOg("hr");
}
