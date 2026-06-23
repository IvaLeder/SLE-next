import { renderSiteDefaultOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Default OG image for the Croatian route group — without this, every /hr/*
// page that doesn't set its own image had no social preview.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers — praktične STEM aktivnosti za znatiželjnu djecu";

export default function Image() {
  return renderSiteDefaultOg("hr");
}
