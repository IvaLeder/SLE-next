import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Tool, Lang } from "@/lib/tools";

// Shared social-preview (OG) cards for the tools section — branded 1200×630
// images generated at build time by the opengraph-image routes.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Individual tools keep the playful coral gradient. The hub pairs generated
// STEM-lab artwork with code-rendered copy so the text is always crisp.
const TOOL_GRADIENT = "linear-gradient(135deg, #FB6F52 0%, #F25C7A 55%, #8E54B5 100%)";
const HUB_ART = `data:image/jpeg;base64,${readFileSync(
  join(process.cwd(), "src/lib/og-art/tools-hub-lab.jpg"),
).toString("base64")}`;

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
    tagline: "Besplatni mali alati za igru: tajne šifre, vizualizator razlomaka, Hanojski toranj i još mnogo toga.",
  },
} as const;

const HUB_VISUAL = {
  en: {
    eyebrow: "Play · discover · create",
    title: ["Free STEM tools", "& games for kids"],
    topics: "Codes  ·  Puzzles  ·  Colors  ·  Math",
    promise: "Free  ·  No sign-up  ·  Play in your browser",
  },
  hr: {
    eyebrow: "Igrajte · otkrijte · stvarajte",
    title: ["Besplatni STEM alati", "i igre za djecu"],
    topics: "Kodovi  ·  Zagonetke  ·  Boje  ·  Matematika",
    promise: "Besplatno  ·  Bez registracije  ·  U pregledniku",
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

function renderHubCard(lang: Lang): ImageResponse {
  const c = HUB_VISUAL[lang];

  return new ImageResponse(
    (
      <div
        aria-label={`${HUB[lang].title}. ${HUB[lang].tagline}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          background: "#180f43",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* next/image cannot render inside next/og's ImageResponse. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HUB_ART}
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(20,11,58,.98) 0%, rgba(20,11,58,.94) 37%, rgba(20,11,58,.46) 56%, rgba(20,11,58,.04) 76%)",
          }}
        />

        <div
          style={{
            position: "relative",
            width: 630,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "54px 0 48px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "linear-gradient(135deg, #FB6F52, #F8C75A)",
                boxShadow: "0 0 28px rgba(251,111,82,.5)",
                fontSize: 22,
              }}
            >
              <svg viewBox="0 0 24 24" width={22} height={22}>
                <path d="M12 1.8 14.6 9.4 22.2 12l-7.6 2.6L12 22.2l-2.6-7.6L1.8 12l7.6-2.6Z" fill="white" />
              </svg>
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 750, letterSpacing: 0.3 }}>
              STEM Little Explorers
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 58,
              color: "#72E1E8",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            {c.eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 14,
              fontSize: lang === "en" ? 64 : 57,
              fontWeight: 850,
              letterSpacing: -2.6,
              lineHeight: 1.01,
              textShadow: "0 4px 24px rgba(7,3,28,.4)",
            }}
          >
            <div style={{ display: "flex" }}>{c.title[0]}</div>
            <div style={{ display: "flex", color: "#F8C75A" }}>{c.title[1]}</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              color: "rgba(255,255,255,.84)",
              fontSize: 22,
              fontWeight: 650,
              letterSpacing: 0.2,
            }}
          >
            {c.topics}
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: "auto",
              border: "1px solid rgba(255,255,255,.24)",
              borderRadius: 999,
              background: "rgba(255,255,255,.1)",
              padding: "10px 17px",
              color: "rgba(255,255,255,.93)",
              fontSize: lang === "en" ? 17 : 16,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            {c.promise}
          </div>
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
  return renderHubCard(lang);
}
