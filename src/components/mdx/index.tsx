import YouTube from "./YouTube";
import { Callout } from "./Callout";
import NextImage from "next/image";
import { SubscribeButton } from "../SubscribeButton";

export const mdxComponents = {
  // Headings with stable, safe IDs
  h1: (props: any) => <h1 id={slugify(props.children)} {...props} />,
  h2: (props: any) => <h2 id={slugify(props.children)} {...props} />,
  h3: (props: any) => <h3 id={slugify(props.children)} {...props} />,

  // Images
  img: (props: any) => (
    <NextImage
      {...props}
      alt={props.alt || ""}
      width={props.width || 1200}
      height={props.height || 800}
    />
  ),

  Image: NextImage,
  Subscribe: SubscribeButton,
  YouTube,
  Callout,
};

function slugify(text: any) {
  const raw = Array.isArray(text) ? text.join(" ") : text;
  if (!raw) return "";
  return raw
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}