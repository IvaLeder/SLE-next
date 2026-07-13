import { ImageResponse } from "next/og";

// Segment favicon for /en/minds: the stitched-compass logo mark (sheet §10).
// Solid stroke — the stitch dashes don't survive 32px (spec, BACKLOG §1c).
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6EE",
          borderRadius: 6,
        }}
      >
        <svg viewBox="0 0 48 48" width={28} height={28} fill="none">
          <path
            d="M24 3 L29.5 18.5 L45 24 L29.5 29.5 L24 45 L18.5 29.5 L3 24 L18.5 18.5 Z"
            stroke="#4C3A72"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24" r="4" fill="#E8B454" />
        </svg>
      </div>
    ),
    size,
  );
}
