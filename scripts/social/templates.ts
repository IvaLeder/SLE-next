/**
 * Rendering templates for social-image generation (createElement, no JSX, so
 * this runs under plain `node` type-stripping). Two families:
 *   - photo-composite (articles): panelCard (tall) + scrimCard (near-square)
 *   - branded-graphic (summer / tools / specials): brandedCard + decorLayer
 * Shared brand system: Inter font, white logo + wordmark, gradient + decor.
 */
import { createElement as h } from "react";
import fs from "node:fs";
import path from "node:path";

const HERE = import.meta.dirname;

// ---- brand -----------------------------------------------------------------
export const GRADIENTS = {
  brand: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#ec4899 100%)",
  coral: "linear-gradient(135deg,#FB6F52 0%,#F25C7A 55%,#8E54B5 100%)",
  hub:   "linear-gradient(135deg,#4338ca 0%,#6d28d9 50%,#8b5cf6 100%)",
};
const WORDMARK = "STEM Little Explorers";

// Inter, bundled so builds are deterministic and offline-safe.
const font = (w: number) => fs.readFileSync(path.join(HERE, `fonts/Inter-${w}.ttf`));
export const FONTS = [
  { name: "Inter", data: font(400), weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: font(700), weight: 700 as const, style: "normal" as const },
  { name: "Inter", data: font(800), weight: 800 as const, style: "normal" as const },
];

// White knockout logo (reads on any gradient / dark scrim).
const LOGO = `data:image/png;base64,${fs.readFileSync(path.join(HERE, "logo-white.png")).toString("base64")}`;

export function fileDataUri(filePath: string): string {
  const abs = path.resolve(filePath);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).slice(1).toLowerCase();
  return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${buf.toString("base64")}`;
}

export function imageDataUri(publicPath: string): string {
  return fileDataUri(path.join("public", publicPath.replace(/^\//, "")));
}

function brandRow(fontSize = 30) {
  return h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 18 } },
    h("img", { src: LOGO, width: fontSize * 1.9, height: fontSize * 1.9 }),
    h("div", { style: { display: "flex", fontSize, fontWeight: 800, letterSpacing: 0.5, color: "#fff" } }, WORDMARK)
  );
}

// ---- generic decorative layer (any gradient / any format) ------------------
function circle({ size, top, left, fill, ring }: { size: number; top: number; left: number; fill?: string; ring?: string }) {
  return h("div", {
    style: {
      position: "absolute", top, left, width: size, height: size, borderRadius: 9999,
      ...(fill ? { background: fill } : {}),
      ...(ring ? { border: `${Math.max(2, Math.round(size * 0.035))}px solid ${ring}` } : {}),
    },
  });
}
export function decorLayer(W: number, H: number) {
  const m = Math.min(W, H);
  const a = (v: number) => `rgba(255,255,255,${v})`;
  return h(
    "div",
    { style: { position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", overflow: "hidden" } },
    circle({ size: m * 0.62, top: -m * 0.2, left: W - m * 0.34, fill: a(0.07) }),
    circle({ size: m * 0.42, top: H - m * 0.26, left: -m * 0.14, ring: a(0.16) }),
    circle({ size: m * 0.16, top: H * 0.34, left: W * 0.82, ring: a(0.18) }),
    circle({ size: m * 0.1, top: H * 0.14, left: W * 0.12, fill: a(0.1) }),
    circle({ size: m * 0.035, top: H * 0.24, left: W * 0.7, fill: a(0.22) }),
    circle({ size: m * 0.028, top: H * 0.7, left: W * 0.28, fill: a(0.2) }),
    circle({ size: m * 0.03, top: H * 0.82, left: W * 0.86, fill: a(0.18) })
  );
}

// ---- article template A: big photo + thin gradient strip (tall) ------------
function panelCard(W: number, H: number, photo: string, title: string, photoFrac: number, titleSize: number) {
  return h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter" } },
    h("img", { src: photo, width: W, height: Math.round(H * photoFrac), style: { objectFit: "cover" } }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, background: GRADIENTS.brand, color: "#fff", padding: 56 } },
      h("div", { style: { display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.05 } }, title),
      brandRow()
    )
  );
}

// ---- article template B: full-bleed photo + scrim (near-square) ------------
function scrimCard(W: number, H: number, photo: string, title: string, titleSize: number) {
  const layer = { position: "absolute" as const, top: 0, left: 0, width: W, height: H, display: "flex" };
  return h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Inter" } },
    h("img", { src: photo, width: W, height: H, style: { ...layer, objectFit: "cover" } }),
    h("div", { style: { ...layer, background: "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(23,10,45,0.55) 62%, rgba(23,10,45,0.94) 100%)" } }),
    h(
      "div",
      { style: { ...layer, flexDirection: "column", justifyContent: "flex-end", gap: 24, padding: 56, color: "#fff" } },
      h("div", { style: { display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.05, textShadow: "0 2px 12px rgba(0,0,0,0.45)" } }, title),
      brandRow()
    )
  );
}

// ---- branded-graphic template (summer / tools / specials) ------------------
export interface BrandedContent { kicker: string; emoji: string; title: string; tagline: string }
function brandedCard(W: number, H: number, gradient: string, c: BrandedContent, sun: number, titleSize: number, taglineSize: number) {
  return h(
    "div",
    { style: { position: "relative", width: "100%", height: "100%", display: "flex", background: gradient, color: "#fff", overflow: "hidden", fontFamily: "Inter" } },
    decorLayer(W, H),
    h(
      "div",
      { style: { position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 72, justifyContent: "space-between" } },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" } },
        h("div", { style: { display: "flex", fontSize: 26, opacity: 0.9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 28 } }, c.kicker),
        c.emoji ? h("div", { style: { display: "flex", fontSize: sun, lineHeight: 1, marginBottom: 20 } }, c.emoji) : null,
        h("div", { style: { display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.08 } }, c.title),
        h("div", { style: { display: "flex", fontSize: taglineSize, opacity: 0.94, marginTop: 24, lineHeight: 1.35 } }, c.tagline)
      ),
      brandRow()
    )
  );
}

// ---- tools hub: format-specific portrait art + crisp social copy ----------
export interface ToolsHubSocialContent {
  eyebrow: string;
  title: [string, string];
  topics: string;
  promise: string;
}

export function toolsHubSocialEl(
  format: "pinterest" | "instagram",
  W: number,
  H: number,
  photo: string,
  c: ToolsHubSocialContent,
) {
  const instagram = format === "instagram";
  const layer = { position: "absolute" as const, top: 0, left: 0, width: W, height: H, display: "flex" };

  return h(
    "div",
    {
      style: {
        position: "relative", width: "100%", height: "100%", display: "flex",
        overflow: "hidden", background: "#140b3a", color: "#fff", fontFamily: "Inter",
      },
    },
    h("img", { src: photo, width: W, height: H, style: { ...layer, objectFit: "cover" } }),
    h("div", {
      style: {
        ...layer,
        background: "linear-gradient(to bottom, rgba(9,4,32,.78) 0%, rgba(9,4,32,.62) 37%, rgba(9,4,32,.16) 58%, rgba(9,4,32,0) 76%)",
      },
    }),
    h(
      "div",
      {
        style: {
          position: "relative", width: "100%", height: "100%", display: "flex",
          flexDirection: "column", alignItems: "center",
          padding: instagram ? "52px 58px 0" : "66px 58px 0", textAlign: "center",
        },
      },
      brandRow(instagram ? 30 : 31),
      h(
        "div",
        {
          style: {
            display: "flex", marginTop: instagram ? 44 : 74, color: "#72E1E8",
            fontSize: instagram ? 23 : 25,
            fontWeight: 800, letterSpacing: 3, textTransform: "uppercase",
          },
        },
        c.eyebrow,
      ),
      h(
        "div",
        {
          style: {
            display: "flex", flexDirection: "column", alignItems: "center",
            marginTop: instagram ? 14 : 18, fontSize: instagram ? 78 : 86,
            fontWeight: 800, letterSpacing: -3, lineHeight: 1.02,
            textShadow: "0 5px 28px rgba(5,2,20,.5)",
          },
        },
        h("div", { style: { display: "flex" } }, c.title[0]),
        h("div", { style: { display: "flex", color: "#F8C75A" } }, c.title[1]),
      ),
      c.topics
        ? h(
          "div",
          {
            style: {
              display: "flex", marginTop: instagram ? 20 : 28, color: "rgba(255,255,255,.88)",
              fontSize: instagram ? 25 : 27, fontWeight: 700, letterSpacing: .3,
            },
          },
          c.topics,
        )
        : null,
      h(
        "div",
        {
          style: {
            display: "flex", marginTop: instagram ? 22 : 30, border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 999, background: "rgba(255,255,255,.1)", padding: "13px 22px",
            color: "rgba(255,255,255,.96)", fontSize: 22, fontWeight: 700, letterSpacing: .5,
          },
        },
        c.promise,
      ),
    ),
  );
}

// ---- back-to-school campaign ----------------------------------------------
export interface CampaignContent {
  kicker: string;
  title: string;
  tagline: string;
  cta: string;
  accent: string;
}

function campaignPanelCard(W: number, H: number, photo: string, c: CampaignContent) {
  const story = H / W > 1.6;
  const photoHeight = Math.round(H * (story ? 0.57 : 0.55));
  const titleSize = story ? 76 : 64;
  return h(
    "div",
    { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fffaf2", fontFamily: "Inter" } },
    h("img", { src: photo, width: W, height: photoHeight, style: { objectFit: "cover" } }),
    h(
      "div",
      {
        style: {
          position: "relative", display: "flex", flex: 1, flexDirection: "column",
          justifyContent: "space-between", overflow: "hidden",
          background: "linear-gradient(135deg,#312E81 0%,#5744A0 58%,#A74375 100%)",
          color: "#fff", padding: story ? "58px 64px 62px" : "48px 56px 52px",
        },
      },
      circle({ size: 310, top: -180, left: W - 210, fill: "rgba(255,255,255,.07)" }),
      h(
        "div",
        { style: { position: "relative", display: "flex", flexDirection: "column" } },
        h("div", {
          style: {
            display: "flex", color: c.accent, fontSize: story ? 26 : 23, fontWeight: 800,
            letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 18,
          },
        }, c.kicker),
        h("div", { style: { display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.03, letterSpacing: -2 } }, c.title),
        h("div", { style: { display: "flex", fontSize: story ? 31 : 27, lineHeight: 1.32, opacity: .94, marginTop: 20 } }, c.tagline),
      ),
      h(
        "div",
        { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 } },
        brandRow(story ? 27 : 25),
        h("div", {
          style: {
            display: "flex", flexShrink: 0, borderRadius: 999, background: c.accent,
            color: "#312E81", padding: "12px 20px", fontSize: story ? 22 : 20, fontWeight: 800,
          },
        }, c.cta),
      ),
    ),
  );
}

function campaignScrimCard(W: number, H: number, photo: string, c: CampaignContent) {
  const instagram = H > W;
  const layer = { position: "absolute" as const, top: 0, left: 0, width: W, height: H, display: "flex" };
  return h(
    "div",
    { style: { position: "relative", width: "100%", height: "100%", display: "flex", overflow: "hidden", fontFamily: "Inter" } },
    h("img", { src: photo, width: W, height: H, style: { ...layer, objectFit: "cover" } }),
    h("div", { style: { ...layer, background: "linear-gradient(to bottom,rgba(35,20,54,.04) 18%,rgba(35,20,54,.3) 47%,rgba(35,20,54,.96) 100%)" } }),
    h(
      "div",
      {
        style: {
          ...layer, flexDirection: "column", justifyContent: "flex-end", color: "#fff",
          padding: instagram ? 58 : 54,
        },
      },
      h("div", {
        style: {
          display: "flex", color: c.accent, fontSize: instagram ? 24 : 21, fontWeight: 800,
          letterSpacing: 2.3, textTransform: "uppercase", marginBottom: 15,
        },
      }, c.kicker),
      h("div", { style: { display: "flex", fontSize: instagram ? 68 : 56, fontWeight: 800, lineHeight: 1.03, letterSpacing: -2 } }, c.title),
      h("div", { style: { display: "flex", fontSize: instagram ? 29 : 25, lineHeight: 1.3, marginTop: 16, opacity: .94 } }, c.tagline),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: instagram ? 34 : 26, gap: 20 } },
        brandRow(instagram ? 26 : 23),
        h("div", {
          style: {
            display: "flex", flexShrink: 0, borderRadius: 999, background: c.accent,
            color: "#312E81", padding: "11px 18px", fontSize: instagram ? 21 : 18, fontWeight: 800,
          },
        }, c.cta),
      ),
    ),
  );
}

export function campaignArticleEl(name: string, W: number, H: number, photo: string, c: CampaignContent) {
  return name === "pinterest" || name === "story"
    ? campaignPanelCard(W, H, photo, c)
    : campaignScrimCard(W, H, photo, c);
}

export function backToSchoolHubEl(name: string, W: number, H: number, c: CampaignContent) {
  const landscape = W / H > 1.2;
  const story = H / W > 1.6;
  const titleSize = landscape ? 64 : story ? 86 : 76;
  const pad = landscape ? 64 : 68;
  return h(
    "div",
    {
      style: {
        position: "relative", width: "100%", height: "100%", display: "flex", overflow: "hidden",
        flexDirection: landscape ? "row" : "column",
        background: "linear-gradient(135deg,#312E81 0%,#5744A0 54%,#A74375 100%)",
        color: "#fff", padding: pad, fontFamily: "Inter",
      },
    },
    decorLayer(W, H),
    h(
      "div",
      {
        style: {
          position: "relative", display: "flex", flex: landscape ? 1.25 : 1,
          flexDirection: "column", justifyContent: "space-between",
        },
      },
      brandRow(landscape ? 27 : 28),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", marginTop: landscape ? 28 : 42 } },
        h("div", {
          style: {
            display: "flex", color: c.accent, fontSize: landscape ? 22 : 25, fontWeight: 800,
            letterSpacing: 2.6, textTransform: "uppercase", marginBottom: 20,
          },
        }, c.kicker),
        h("div", { style: { display: "flex", fontSize: titleSize, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.5 } }, c.title),
        h("div", { style: { display: "flex", fontSize: landscape ? 27 : 31, lineHeight: 1.35, opacity: .94, marginTop: 24 } }, c.tagline),
      ),
      h("div", {
        style: {
          display: "flex", alignSelf: "flex-start", borderRadius: 999, background: c.accent,
          color: "#312E81", padding: "13px 22px", fontSize: 22, fontWeight: 800, marginTop: 34,
        },
      }, c.cta),
    ),
    h(
      "div",
      {
        style: {
          position: "relative", display: "flex", flex: landscape ? .75 : 0,
          minHeight: landscape ? 0 : story ? 530 : 410,
          alignItems: "center", justifyContent: "center", marginTop: landscape ? 0 : 36,
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex", flexDirection: "column", width: landscape ? 390 : story ? 670 : 590,
            borderRadius: 34, background: "#FFF9EF", color: "#312E81", padding: landscape ? 34 : 38,
            boxShadow: "0 24px 50px rgba(22,16,68,.3)", transform: "rotate(-2deg)",
          },
        },
        h("div", { style: { display: "flex", color: "#A74375", fontSize: landscape ? 19 : 22, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" } }, "Your gentle start"),
        ["Understand readiness", "Build calmer routines", "Make learning click"].map((label, i) =>
          h(
            "div",
            { key: label, style: { display: "flex", alignItems: "center", gap: 15, marginTop: landscape ? 22 : 27, fontSize: landscape ? 23 : 30, fontWeight: 700 } },
            h("div", { style: { display: "flex", width: 34, height: 34, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 99, background: ["#F8B84E", "#F4A6B7", "#77C8C4"][i], color: "#312E81", fontSize: 19, fontWeight: 800 } }, `${i + 1}`),
            label,
          ),
        ),
        h("div", { style: { display: "flex", marginTop: landscape ? 28 : 34, borderTop: "2px dashed #D8CBE7", paddingTop: landscape ? 22 : 28, color: "#C84E68", fontSize: landscape ? 22 : 27, fontWeight: 800 } }, "+ Free 8-page printable"),
      ),
    ),
  );
}

// ---- multiplication strategy cards ---------------------------------------
export interface LearningCardContent {
  kicker: string;
  title: string;
  tagline: string;
  rows: Array<{ main: string; note?: string }>;
  footer: string;
  accent?: string;
}

export function learningCardEl(W: number, H: number, c: LearningCardContent) {
  const accent = c.accent ?? "#E76F68";
  const compact = H / W < 1.35;
  return h(
    "div",
    {
      style: {
        position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column",
        overflow: "hidden", background: "#FFF8EC", color: "#38224C", padding: compact ? 58 : 64,
        fontFamily: "Inter",
      },
    },
    h("div", { style: { position: "absolute", top: -120, right: -100, display: "flex", width: 390, height: 390, borderRadius: 999, background: `${accent}20` } }),
    h("div", { style: { position: "absolute", bottom: -180, left: -170, display: "flex", width: 430, height: 430, borderRadius: 999, border: `34px solid ${accent}18` } }),
    h(
      "div",
      { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" } },
      h("div", { style: { display: "flex", color: accent, fontSize: 23, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase" } }, c.kicker),
      h("div", { style: { display: "flex", width: 62, height: 62, borderRadius: 18, alignItems: "center", justifyContent: "center", background: accent, color: "#fff", fontSize: 38, fontWeight: 800 } }, "×"),
    ),
    h("div", { style: { position: "relative", display: "flex", fontSize: compact ? 66 : 72, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.4, marginTop: compact ? 26 : 34 } }, c.title),
    h("div", { style: { position: "relative", display: "flex", fontSize: compact ? 27 : 29, lineHeight: 1.35, color: "#66516F", marginTop: 20 } }, c.tagline),
    h(
      "div",
      { style: { position: "relative", display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: compact ? 15 : 18, marginTop: compact ? 22 : 30 } },
      c.rows.map((row) =>
        h(
          "div",
          {
            key: `${row.main}-${row.note ?? ""}`,
            style: {
              display: "flex", flexDirection: "column", borderRadius: 22, border: `2px solid ${accent}2e`,
              background: "rgba(255,255,255,.84)", padding: compact ? "17px 23px" : "20px 25px",
              boxShadow: "0 8px 20px rgba(56,34,76,.06)",
            },
          },
          h("div", { style: { display: "flex", color: "#38224C", fontSize: compact ? 31 : 34, fontWeight: 800, lineHeight: 1.2 } }, row.main),
          row.note ? h("div", { style: { display: "flex", color: "#75617C", fontSize: compact ? 21 : 23, lineHeight: 1.3, marginTop: 6 } }, row.note) : null,
        ),
      ),
    ),
    h(
      "div",
      { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px dashed #D8CBE0", paddingTop: compact ? 24 : 28, marginTop: 24, gap: 22 } },
      h("div", { style: { display: "flex", color: accent, fontSize: compact ? 22 : 24, fontWeight: 800 } }, c.footer),
      h(
        "div",
        { style: { display: "flex", flexShrink: 0, borderRadius: 18, background: "#38224C", padding: "8px 13px" } },
        brandRow(18),
      ),
    ),
  );
}

// ---- formats ---------------------------------------------------------------
export const DIMS: Record<string, [number, number]> = {
  pinterest: [1000, 1500], story: [1080, 1920], instagram: [1080, 1350], gmb: [1200, 900],
};

export function articleEl(name: string, W: number, H: number, photo: string, title: string) {
  if (name === "pinterest") return panelCard(W, H, photo, title, 0.72, 62);
  if (name === "story")     return panelCard(W, H, photo, title, 0.76, 68);
  if (name === "instagram") return scrimCard(W, H, photo, title, 62);
  return scrimCard(W, H, photo, title, 54); // gmb
}

export function brandedEl(name: string, W: number, H: number, gradient: string, c: BrandedContent) {
  const s = {
    pinterest: [150, 78, 32], story: [170, 88, 36], instagram: [150, 80, 34], gmb: [110, 62, 30],
  }[name] as [number, number, number];
  return brandedCard(W, H, gradient, c, s[0], s[1], s[2]);
}
