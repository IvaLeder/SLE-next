import { readFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import YouTube from "./YouTube";
import { Callout } from "./Callout";
import NextImage, { type ImageProps } from "next/image";
import Lightbox from "./Lightbox";
import Figure from "./Figure";
import Materials from "./Materials";
import Material from "./Material";
import NameInBinary from "../tools/NameInBinary";
import CaesarCipher from "../tools/CaesarCipher";
import TowerOfHanoi from "../tools/TowerOfHanoi";
import FractionVisualizer from "../tools/FractionVisualizer";
import { SubscribeButton } from "../SubscribeButton";

// Markdown ![alt](src) and <Image src=…/> in MDX both flow through here.
// Routed to <Lightbox> so any inline content image is tap-to-zoom.
// rehype-slug already assigns IDs to h1/h2/h3 so we don't override headings.
type MdxImgProps = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
};

// Build-time cache so the same image isn't read off disk twice.
const dimsCache = new Map<string, { width: number; height: number } | null>();

/**
 * Read a local image's real pixel dimensions from disk (build-time only).
 * Markdown `![](src)` can't carry width/height, which forced Lightbox into a
 * 16:9 `object-cover` crop. Reading the true size here lets every inline image
 * render at its natural aspect ratio — uncropped, and still zero-CLS because
 * next/image reserves space from the dimensions. Returns null for remote URLs
 * or anything we can't measure (falls back to the old 16:9 box).
 */
function localImageDimensions(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/")) return null;
  if (dimsCache.has(src)) return dimsCache.get(src)!;

  let result: { width: number; height: number } | null = null;
  try {
    const { width, height } = imageSize(readFileSync(join(process.cwd(), "public", src)));
    if (width && height) result = { width, height };
  } catch {
    result = null;
  }
  dimsCache.set(src, result);
  return result;
}

function MdxImg({ src, alt = "", width, height, lang }: MdxImgProps & { lang: Lang }) {
  if (!src) return null;

  let w = width ? Number(width) : undefined;
  let h = height ? Number(height) : undefined;

  // Fill in dimensions for local images that didn't supply them (i.e. Markdown
  // images), so they render uncropped at their natural ratio.
  if (!w || !h) {
    const dims = localImageDimensions(src);
    if (dims) {
      w = dims.width;
      h = dims.height;
    }
  }

  return <Lightbox src={src} alt={alt} width={w} height={h} lang={lang} />;
}

// `a` in MDX → secure external links. Same-origin links pass through unchanged.
// Heuristic: anything starting with http(s):// is treated as external.
function MdxLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);
  if (!isExternal) {
    return <a href={href} {...rest}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

type Lang = "en" | "hr";

// Components with user-facing labels (Lightbox zoom, YouTube play, Subscribe)
// need the article's language for their aria-labels — MDX content can't carry
// it, so the page binds it once here via PostBody.
export function mdxComponents(lang: Lang = "en") {
  return {
    a: MdxLink,
    img: (props: MdxImgProps) => <MdxImg {...props} lang={lang} />,
    Image: (props: ImageProps) => <NextImage {...props} className="my-6 rounded-md" />,
    Figure: (props: React.ComponentProps<typeof Figure>) => (
      <Figure lang={lang} {...props} />
    ),
    Materials: (props: React.ComponentProps<typeof Materials>) => (
      <Materials lang={lang} {...props} />
    ),
    Material: (props: React.ComponentProps<typeof Material>) => (
      <Material lang={lang} {...props} />
    ),
    NameInBinary: () => <NameInBinary lang={lang} />,
    CaesarCipher: () => <CaesarCipher lang={lang} />,
    TowerOfHanoi: () => <TowerOfHanoi lang={lang} />,
    FractionVisualizer: () => <FractionVisualizer lang={lang} />,
    Subscribe: (props: React.ComponentProps<typeof SubscribeButton>) => (
      <SubscribeButton lang={lang} {...props} />
    ),
    YouTube: (props: React.ComponentProps<typeof YouTube>) => (
      <YouTube lang={lang} {...props} />
    ),
    Callout,
  };
}
