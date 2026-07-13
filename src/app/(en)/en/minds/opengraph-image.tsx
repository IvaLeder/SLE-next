import { renderMindsOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/minds-og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Mind Explorers: maps for growing minds. Part of STEM Little Explorers.";

export default function Image() {
  return renderMindsOg("en");
}
