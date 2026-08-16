import { renderBackToSchoolOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Curious, calm and ready to learn - a back-to-school guide for families and educators";

export default function Image() {
  return renderBackToSchoolOg("en");
}
