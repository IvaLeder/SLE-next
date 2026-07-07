// Produce two white-friendly logo variants from public/images/logo.png:
//   logo-disc.png  — original colored logo centered on a white circle ("coin")
//   logo-white.png — logo knocked out to a solid white silhouette (via alpha)
import sharp from "sharp";

const SRC = "public/images/logo.png";
const { width, height } = await sharp(SRC).metadata();

// --- silhouette: white pixels wherever the logo has any opacity ---
const alpha = await sharp(SRC).ensureAlpha().extractChannel(3).toColourspace("b-w").toBuffer();
const whiteRGB = await sharp({ create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } } }).png().toBuffer();
await sharp(whiteRGB).joinChannel(alpha).png().toFile("scripts/social/logo-white.png");

// --- coin: colored logo on a white disc with a little padding ---
const D = 220;
const pad = Math.round(D * 0.14);
const inner = D - pad * 2;
const disc = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="white"/></svg>`);
const logoResized = await sharp(SRC).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
await sharp(disc).composite([{ input: logoResized, top: pad, left: pad }]).png().toFile("scripts/social/logo-disc.png");

console.log("wrote scripts/social/logo-white.png and logo-disc.png");
