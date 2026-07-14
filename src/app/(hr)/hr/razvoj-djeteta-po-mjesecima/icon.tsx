// Segment favicon for the HR milestone pillar: the stitched compass. Same
// rationale as the EN twin — the pillar is a themed Mind Explorers surface
// reached straight from the hub. Drawing + the navigation-surfaces rule live
// in src/lib/minds-icon.tsx.
import { mindsIcon, MINDS_ICON_SIZE, MINDS_ICON_CONTENT_TYPE } from "@/lib/minds-icon";

export const size = MINDS_ICON_SIZE;
export const contentType = MINDS_ICON_CONTENT_TYPE;

export default function Icon() {
  return mindsIcon();
}
