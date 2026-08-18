import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

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

const BACK_TO_SCHOOL: Record<Lang, { kicker: string; title: string; tagline: string; badge: string }> = {
  en: {
    kicker: "STEM Little Explorers · Back-to-school guide",
    title: "Curious, calm and ready to learn",
    tagline: "School readiness · calmer routines · multiplication that makes sense",
    badge: "3 guides + free 8-page printable",
  },
  hr: {
    kicker: "STEM Little Explorers · Vodič za početak škole",
    title: "Znatiželjno, smireno i spremno za učenje",
    tagline: "Spremnost za školu · lagane rutine · množenje s razumijevanjem",
    badge: "3 članka + besplatan paket od 8 stranica",
  },
};

function publicImageDataUri(publicPath: string): string {
  const absolutePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const extension = path.extname(absolutePath).slice(1).toLowerCase();
  const mime = extension === "jpg" ? "jpeg" : extension;
  return `data:image/${mime};base64,${fs.readFileSync(absolutePath).toString("base64")}`;
}

function backToSchoolOgFonts() {
  const font = (weight: number) => fs.readFileSync(path.join(process.cwd(), "scripts", "social", "fonts", `Inter-${weight}.ttf`));
  return [
    { name: "Inter", data: font(400), weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: font(700), weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: font(800), weight: 800 as const, style: "normal" as const },
  ];
}

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
          fontFamily: lang === "en" ? "Inter" : "system-ui, sans-serif",
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

/** Visual collage card for the bilingual back-to-school hub and Facebook. */
export function renderBackToSchoolOg(lang: Lang): ImageResponse {
  const c = BACK_TO_SCHOOL[lang];
  const images = {
    readiness: publicImageDataUri("/images/posts/school-readiness-beyond-letters-and-numbers-cover.png"),
    calm: publicImageDataUri("/images/posts/curious-and-calm-back-to-school-cover.png"),
    multiplication: publicImageDataUri("/images/posts/multiplication-tables-cover.jpg"),
  };
  const visualCard = (
    src: string,
    top: number,
    left: number,
    width: number,
    height: number,
    rotation: number,
    objectPosition: string,
  ) => (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height,
        display: "flex",
        overflow: "hidden",
        borderRadius: 28,
        border: "7px solid #FFF9EF",
        background: "#FFF9EF",
        boxShadow: "0 22px 40px rgba(23, 14, 61, .35)",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img src={src} width={width} height={height} style={{ objectFit: "cover", objectPosition }} />
    </div>
  );
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          background: "linear-gradient(135deg, #312E81 0%, #51419A 54%, #A74375 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -190,
            left: -160,
            display: "flex",
            width: 470,
            height: 470,
            borderRadius: 999,
            border: "34px solid rgba(255,255,255,.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -230,
            left: 300,
            display: "flex",
            width: 500,
            height: 500,
            borderRadius: 999,
            background: "rgba(255,255,255,.045)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 705,
            height: "100%",
            padding: "54px 26px 54px 64px",
          }}
        >
          <div style={{ display: "flex", color: "#F8C75A", fontSize: 22, fontWeight: 700, letterSpacing: 2.3, textTransform: "uppercase", marginBottom: 24 }}>
            {c.kicker}
          </div>
          <div style={{ display: "flex", fontSize: lang === "en" ? 67 : 59, fontWeight: 800, lineHeight: 1.02, letterSpacing: -1.6 }}>
            {c.title}
          </div>
          <div style={{ display: "flex", fontSize: lang === "en" ? 27 : 25, opacity: 0.93, marginTop: 24, lineHeight: 1.35, maxWidth: 610 }}>
            {c.tagline}
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 30,
              padding: "12px 20px",
              borderRadius: 999,
              background: "#F8C75A",
              color: "#312E81",
              fontSize: lang === "en" ? 22 : 20,
              fontWeight: 800,
            }}
          >
            {c.badge}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              width: "100%",
              height: "100%",
              background: "linear-gradient(to right, rgba(49,46,129,.78) 0%, rgba(49,46,129,.08) 38%, rgba(49,46,129,0) 100%)",
            }}
          />
          {visualCard(images.readiness, 48, 28, 430, 190, 3, "center 48%")}
          {visualCard(images.calm, 221, 94, 410, 194, -2, "center 55%")}
          {visualCard(images.multiplication, 404, 22, 450, 190, 2, "center 52%")}
        </div>
      </div>
    ),
    lang === "en" ? { ...OG_SIZE, fonts: backToSchoolOgFonts() } : { ...OG_SIZE },
  );
}
