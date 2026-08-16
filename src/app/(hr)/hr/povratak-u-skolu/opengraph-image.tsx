import { renderBackToSchoolOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Znatiželjno, mirno i spremno za učenje - vodič za početak škole za obitelji i odgojno-obrazovne djelatnike";

export default function Image() {
  return renderBackToSchoolOg("hr");
}
