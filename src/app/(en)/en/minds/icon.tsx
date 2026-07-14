// Segment favicon for /en/minds: the stitched-compass logo mark.
// Drawing + rationale live in src/lib/minds-icon.tsx (shared by all
// Mind Explorers navigation surfaces).
import { mindsIcon, MINDS_ICON_SIZE, MINDS_ICON_CONTENT_TYPE } from "@/lib/minds-icon";

export const size = MINDS_ICON_SIZE;
export const contentType = MINDS_ICON_CONTENT_TYPE;

export default function Icon() {
  return mindsIcon();
}
