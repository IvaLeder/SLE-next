import type { Sharp } from "sharp";
import type { ResolvedConfig } from "../config.ts";

/**
 * Visual metadata shared by the image processors: tiny blur preview +
 * dominant/average colours. Consumed by components as an instant placeholder
 * while the real image loads (blur as CSS background — needs no client JS).
 */

export interface Visuals {
  blurDataURL: string;
  dominantColor: string;
  averageColor: string;
}

const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");

export async function extractVisuals(image: Sharp, cfg: ResolvedConfig): Promise<Visuals> {
  const { placeholder } = cfg.images;
  const [blur, stats] = await Promise.all([
    image
      .clone()
      .resize({ width: placeholder.width, withoutEnlargement: true })
      .webp({ quality: placeholder.quality, alphaQuality: 20 })
      .toBuffer(),
    image.clone().stats(),
  ]);

  const { dominant, channels } = stats;
  return {
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    dominantColor: `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`,
    averageColor: `#${toHex(channels[0]?.mean ?? 0)}${toHex(channels[1]?.mean ?? 0)}${toHex(channels[2]?.mean ?? 0)}`,
  };
}
