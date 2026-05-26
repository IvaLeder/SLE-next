import YouTube from "./YouTube";
import { Callout } from "./Callout";
import NextImage, { type ImageProps } from "next/image";
import { SubscribeButton } from "../SubscribeButton";

// Markdown ![alt](src) gets rewritten to <NextImage>. The rehype-slug plugin
// already assigns IDs to h1/h2/h3 so we don't override them here — overriding
// would either no-op (id was already set by rehype-slug, and JSX spread is
// last-write-wins) or double-slugify.
//
// Image dimensions: Markdown doesn't carry width/height. Without them we'd
// get layout shift, so we render with a fixed aspect-ratio wrapper and let
// Next.js fill responsively. Authors can override via <Image src=… width=… />.
type MdxImgProps = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
};

function MdxImg({ src, alt = "", width, height }: MdxImgProps) {
  if (!src) return null;

  // If explicit dimensions are provided in MDX (e.g. via the <Image /> JSX form),
  // use them verbatim — no aspect-ratio wrapper needed.
  if (width && height) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={Number(width)}
        height={Number(height)}
        sizes="(min-width: 768px) 768px, 100vw"
        className="my-6 rounded-md w-full h-auto"
      />
    );
  }

  // Markdown-style image: known src, unknown intrinsic size. Use fill mode with
  // a 16:9 aspect-ratio wrapper so the slot is reserved before the image loads
  // (zero CLS) without lying about dimensions.
  return (
    <div className="my-6 relative w-full aspect-[16/9] overflow-hidden rounded-md">
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

export const mdxComponents = {
  img: MdxImg,
  Image: (props: ImageProps) => <NextImage {...props} className="my-6 rounded-md" />,
  Subscribe: SubscribeButton,
  YouTube,
  Callout,
};
