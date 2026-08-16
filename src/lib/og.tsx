import { ImageResponse } from "next/og";

// Shared social-preview (OG) cards. 1200×630, generated at build time by the
// various opengraph-image routes. Tool cards live in tool-og.tsx; this file
// holds the site default (per route group) and the summer e-book card.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type Lang = "en" | "hr";

const SITE: Record<Lang, { eyebrow: string; title: [string, string]; subtitle: string }> = {
  en: {
    eyebrow: "STEM Little Explorers",
    title: ["Hands-on STEM", "for curious kids"],
    subtitle: "Experiments · Activities · Child development",
  },
  hr: {
    eyebrow: "STEM Little Explorers",
    title: ["STEM i znanost", "za znatiželjnu djecu"],
    subtitle: "Pokusi · Aktivnosti · Razvoj djeteta",
  },
};

const SUMMER: Record<Lang, { kicker: string; title: string; tagline: string }> = {
  en: {
    kicker: "Free summer e-book · STEM Little Explorers",
    title: "Summer of curiosity",
    tagline: "30+ screen-free science activities for kids, sorted by age. Free PDF - no sign-up.",
  },
  hr: {
    kicker: "Besplatna ljetna e-knjiga · STEM Little Explorers",
    title: "Ljeto znatiželje",
    tagline: "30+ znanstvenih aktivnosti za djecu bez ekrana, po dobi. Besplatni PDF - bez registracije.",
  },
};

const BACK_TO_SCHOOL: Record<Lang, { kicker: string; title: string; tagline: string }> = {
  en: {
    kicker: "Back-to-school guide · STEM Little Explorers",
    title: "Curious, calm and ready to learn",
    tagline: "School readiness · gentler routines · learning help · free 8-page printable",
  },
  hr: {
    kicker: "Vodič za početak škole · STEM Little Explorers",
    title: "Znatiželjno, mirno i spremno za učenje",
    tagline: "Spremnost za školu · nježnije rutine · pomoć pri učenju · besplatan paket od 8 stranica",
  },
};

/** Centred brand card used as the default OG image for each route group. */
export function renderSiteDefaultOg(lang: Lang): ImageResponse {
  const c = SITE[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.85, marginBottom: 24, letterSpacing: 4, textTransform: "uppercase" }}>
          {c.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 92,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: 32,
          }}
        >
          <span>{c.title[0]}</span>
          <span>{c.title[1]}</span>
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, textAlign: "center", maxWidth: 900 }}>{c.subtitle}</div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

/** Coral "Summer of curiosity" card for the seasonal landing pages. */
export function renderSummerOg(lang: Lang): ImageResponse {
  const c = SUMMER[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FB6F52 0%, #F25C7A 55%, #8E54B5 100%)",
          color: "white",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 26, opacity: 0.9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 }}>
          {c.kicker}
        </div>
        <div style={{ fontSize: 130, lineHeight: 1, marginBottom: 20 }}>☀️</div>
        <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040 }}>{c.title}</div>
        <div style={{ fontSize: 32, opacity: 0.92, marginTop: 24, maxWidth: 980, lineHeight: 1.35 }}>{c.tagline}</div>
      </div>
    ),
    { ...OG_SIZE, emoji: "twemoji" },
  );
}

/** Indigo school-notebook card for the bilingual back-to-school hub. */
export function renderBackToSchoolOg(lang: Lang): ImageResponse {
  const c = BACK_TO_SCHOOL[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #312E81 0%, #5744A0 52%, #A74375 100%)",
          color: "white",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 910 }}>
          <div style={{ fontSize: 25, opacity: 0.88, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 }}>
            {c.kicker}
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08 }}>{c.title}</div>
          <div style={{ fontSize: 29, opacity: 0.9, marginTop: 26, lineHeight: 1.35 }}>{c.tagline}</div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 178,
            height: 202,
            flexShrink: 0,
            marginLeft: 42,
            borderRadius: 40,
            border: "8px solid #F8B84E",
            background: "#FB6F52",
            boxShadow: "0 22px 40px rgba(22, 16, 68, .28)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 45,
              top: -40,
              display: "flex",
              width: 72,
              height: 48,
              border: "10px solid #F8B84E",
              borderBottom: "0px",
              borderRadius: "28px 28px 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 22,
              bottom: 24,
              display: "flex",
              width: 118,
              height: 72,
              borderRadius: 24,
              background: "#D95770",
              border: "5px solid rgba(255,255,255,.55)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 74,
              bottom: 44,
              display: "flex",
              width: 18,
              height: 18,
              borderRadius: 99,
              background: "#F8B84E",
            }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
