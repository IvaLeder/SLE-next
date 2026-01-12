"use client";

import Image from "next/image";

export default function MarkdownImage({
  src,
  alt = "",
}: {
  src: string;
  alt?: string;
}) {
  if (!src) return null;

  // Ensure local images work even if Markdown paths are relative
  const fixedSrc = src.startsWith("http")
    ? src
    : `/images/posts/${src.replace(/^\.?\//, "")}`;

  return (
    <div className="my-6 w-full">
      <Image
        src={fixedSrc}
        alt={alt}
        width={1200}       // Large enough for desktop
        height={800}
        className="rounded-md"
        style={{ width: "100%", height: "auto" }} // responsive
        sizes="(max-width: 768px) 100vw, 768px"
        priority={false} // Set true only for hero image
      />
      {alt && (
        <p className="text-sm text-gray-500 mt-1 text-center">{alt}</p>
      )}
    </div>
  );
}