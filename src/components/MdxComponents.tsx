import Image from "next/image";
import { Components } from "@mdx-js/react";

const MarkdownImage = (props: any) => {
  const { src, alt, width, height } = props;

  return (
    <div className="my-6">
      <Image
        src={src}
        alt={alt || ""}
        width={width || 1200}
        height={height || 600}
        className="rounded"
      />
    </div>
  );
};

const H2 = (props: any) => (
  <h2 id={props.children.toString().toLowerCase().replace(/\s+/g, "-")} {...props} />
);

export const mdxComponents: Components = {
  img: MarkdownImage,
  h2: H2,
};