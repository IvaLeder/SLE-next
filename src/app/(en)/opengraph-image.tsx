import { renderSiteDefaultOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Default OG image for the English route group — used when a page doesn't
// define its own. Generated as a 1200×630 PNG at build time.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers — hands-on STEM activities for curious kids";

export default function Image() {
  return renderSiteDefaultOg("en");
}
