import { ImageResponse } from "next/og";

/**
 * The stitched-compass segment favicon (brand sheet §10), shared by every
 * Mind Explorers navigation surface: the hub (/en/minds · /hr/um) and the
 * hub's pillar-card destinations (milestone pillar, parenting tag).
 *
 * Rule (2026-07-14): sub-brand NAVIGATION surfaces carry the compass;
 * individual psychology articles are endorsed content and keep the site
 * favicon. Solid stroke — the stitch dashes don't survive 32px (BACKLOG §1c).
 *
 * Static-route segments re-export via an icon.tsx; the dynamic /tag/[tag]
 * route can't vary icon.tsx per param, so it uses the hand-drawn twin at
 * public/mind-explorers-icon.svg through `icons` metadata instead. Keep the
 * two drawings in sync.
 */
export const MINDS_ICON_SIZE = { width: 32, height: 32 };
export const MINDS_ICON_CONTENT_TYPE = "image/png";

export function mindsIcon() {
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
    MINDS_ICON_SIZE,
  );
}
