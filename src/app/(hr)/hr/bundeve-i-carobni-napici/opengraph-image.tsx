import { renderPumpkinsOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Bundeve i čarobni napici - jesenski znanstveni laboratorij za djecu";

export default function Image() {
  return renderPumpkinsOg("hr");
}
