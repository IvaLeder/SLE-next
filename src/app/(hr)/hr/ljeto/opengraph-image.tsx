import { renderSummerOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ljeto znatiželje — besplatna ljetna STEM e-knjiga za djecu, bez registracije";

export default function Image() {
  return renderSummerOg("hr");
}
