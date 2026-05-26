import YouTube from "./YouTube";
import { Callout } from "./Callout";
import NextImage, { type ImageProps } from "next/image";
import Lightbox from "./Lightbox";
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

function MdxImg({ src, alt = "", width, height }: MdxImgProps) {
  if (!src) return null;
  return (
    <Lightbox
      src={src}
      alt={alt}
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
    />
  );
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

export const mdxComponents = {
  a: MdxLink,
  img: MdxImg,
  Image: (props: ImageProps) => <NextImage {...props} className="my-6 rounded-md" />,
  Subscribe: SubscribeButton,
  YouTube,
  Callout,
};
