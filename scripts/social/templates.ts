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

export function imageDataUri(publicPath: string): string {
  const abs = path.join("public", publicPath.replace(/^\//, ""));
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).slice(1).toLowerCase();
  return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${buf.toString("base64")}`;
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
