import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { mindsCopy } from "@/lib/minds";

// Social-preview (OG) card for the Mind Explorers hub — night mode per the
// brand sheet (§3: day mode is for reading, night mode is for attention;
// §11: plum-deep background, cream title, gold motif, nothing else loud).
// The OG renderer (satori) has no system fonts, so a static Fraunces 600 TTF
// is bundled at src/lib/og-fonts/ (SIL OFL; static instance because satori
// can't consume variable fonts or woff2). Read at build time — the OG routes
// are statically generated.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PLUM_DEEP = "#2A2440";
const GOLD = "#E8B454";
const ROSE = "#D9A5A0";
const CREAM = "#FAF6EE";

const ENDORSEMENT = {
  en: "Part of STEM Little Explorers",
  hr: "Dio STEM Little Explorers",
} as const;

const frauncesData = readFileSync(
  join(process.cwd(), "src/lib/og-fonts/fraunces-600.ttf"),
);

export function renderMindsOg(lang: "en" | "hr"): ImageResponse {
  const copy = mindsCopy[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: PLUM_DEEP,
          color: CREAM,
          padding: 80,
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: GOLD,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          {ENDORSEMENT[lang]}
        </div>

        {/* wordmark lockup: stitched compass + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <svg viewBox="0 0 48 48" width={110} height={110} fill="none">
            <path
              d="M24 3 L29.5 18.5 L45 24 L29.5 29.5 L24 45 L18.5 29.5 L3 24 L18.5 18.5 Z"
              stroke={GOLD}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="3 2.5"
            />
            <circle cx="24" cy="24" r="3.2" fill={GOLD} />
          </svg>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 700, lineHeight: 1 }}>
            Mind Explorers
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 42,
            color: ROSE,
            marginTop: 30,
          }}
        >
          {copy.tagline}
        </div>

        {/* the stitch path, glowing gold across the bottom */}
        <svg
          viewBox="0 0 1040 40"
          width={1040}
          height={40}
          fill="none"
          style={{ marginTop: 56 }}
        >
          <path
            d="M10 20 C 130 -6, 250 46, 370 20 C 490 -6, 610 46, 730 20 C 850 -6, 950 40, 1030 16"
            stroke={GOLD}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="18 13"
          />
        </svg>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Fraunces", data: frauncesData, weight: 600, style: "normal" },
      ],
    },
  );
}
