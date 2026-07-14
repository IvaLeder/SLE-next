// Segment favicon for the milestone pillar: the stitched compass. The pillar
// is the hub's #1 pillar-card destination and already a themed Mind Explorers
// surface — the tab icon follows the theme so the hub → pillar journey
// doesn't visually "leave" the sub-brand. Drawing + the navigation-surfaces
// rule live in src/lib/minds-icon.tsx.
import { mindsIcon, MINDS_ICON_SIZE, MINDS_ICON_CONTENT_TYPE } from "@/lib/minds-icon";

export const size = MINDS_ICON_SIZE;
export const contentType = MINDS_ICON_CONTENT_TYPE;

export default function Icon() {
  return mindsIcon();
}
