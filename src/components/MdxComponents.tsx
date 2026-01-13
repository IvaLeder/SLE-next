import Image from "next/image";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

/* ------------------------------
   Image override
------------------------------ */

type MarkdownImageProps = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
};

const MarkdownImage = ({
  src,
  alt = "",
  width,
  height,
}: MarkdownImageProps) => {
  if (!src) return null;

  return (
    <div className="my-6">
      <Image
        src={src}
        alt={alt}
        width={Number(width) || 1200}
        height={Number(height) || 600}
        className="rounded"
      />
    </div>
  );
};

/* ------------------------------
   Headings
------------------------------ */

type HeadingProps = ComponentProps<"h2">;

const H2 = (props: HeadingProps) => <h2 {...props} />;

/* ------------------------------
   MDX component map
------------------------------ */

export const mdxComponents: MDXComponents = {
  img: MarkdownImage,
  h2: H2,
};