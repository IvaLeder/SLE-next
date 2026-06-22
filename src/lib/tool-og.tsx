import { ImageResponse } from "next/og";
import type { Tool, Lang } from "@/lib/tools";

// Shared social-preview (OG) cards for the tools section — branded 1200×630
// images generated at build time by the opengraph-image routes.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Individual tools get the playful coral gradient; the hub gets the brand
// indigo→violet of the homepage hero.
const TOOL_GRADIENT = "linear-gradient(135deg, #FB6F52 0%, #F25C7A 55%, #8E54B5 100%)";
const HUB_GRADIENT = "linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #8b5cf6 100%)";

const KICKER: Record<Lang, string> = {
  en: "Free interactive tool · STEM Little Explorers",
  hr: "Besplatni interaktivni alat · STEM Little Explorers",
};
const HUB = {
  en: {
    kicker: "Free interactive tools · STEM Little Explorers",
    title: "STEM tools & toys",
    tagline: "Free little tools to play with — secret codes, binary names and more.",
  },
  hr: {
    kicker: "Besplatni interaktivni alati · STEM Little Explorers",
    title: "STEM alati i igre",
    tagline: "Besplatni mali alati za igru — tajne šifre, imena u binarnom kodu i još mnogo toga.",
  },
} as const;

function renderCard(opts: {
  kicker: string;
  icon: string;
  title: string;
  tagline: string;
  gradient: string;
}): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: opts.gradient,
          color: "white",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            opacity: 0.9,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          {opts.kicker}
        </div>
        <div style={{ fontSize: 130, lineHeight: 1, marginBottom: 20 }}>{opts.icon}</div>
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.12, maxWidth: 1040 }}>
          {opts.title}
        </div>
        <div style={{ fontSize: 32, opacity: 0.92, marginTop: 24, maxWidth: 980, lineHeight: 1.35 }}>
          {opts.tagline}
        </div>
      </div>
    ),
    { ...OG_SIZE, emoji: "twemoji" },
  );
}

export function renderToolOg(tool: Tool, lang: Lang): ImageResponse {
  return renderCard({
    kicker: KICKER[lang],
    icon: tool.icon,
    title: tool.title[lang],
    tagline: tool.tagline[lang],
    gradient: TOOL_GRADIENT,
  });
}

export function renderToolsHubOg(lang: Lang): ImageResponse {
  return renderCard({
    kicker: HUB[lang].kicker,
    icon: "🧰",
    title: HUB[lang].title,
    tagline: HUB[lang].tagline,
    gradient: HUB_GRADIENT,
  });
}
