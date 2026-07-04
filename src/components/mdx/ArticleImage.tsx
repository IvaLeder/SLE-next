import Figure from "./Figure";
import { getImage } from "@/lib/assets";

/**
 * The zero-boilerplate article image:
 *
 *   <ArticleImage src="volcano" alt="Volcano erupting." />
 *
 * `src` is either a bare stem (filename without extension, resolved through
 * the pipeline manifest) or a full /images/… path. Dimensions, responsive
 * srcset, AVIF/WebP and the blur placeholder all come from the manifest —
 * nothing to write by hand. Children become the caption, same as <Figure>.
 *
 * Unknown stems render nothing (with a build-time warning) rather than a
 * broken <img> — `npm run images` reports the missing file too.
 */
export default function ArticleImage({
  src,
  alt,
  lang = "en",
  children,
}: {
  src: string;
  alt: string;
  lang?: "en" | "hr";
  children?: React.ReactNode;
}) {
  const image = getImage(src);

  if (!image && !src.startsWith("/")) {
    // A bare stem we can't resolve has no usable URL at all.
    console.warn(`[images] <ArticleImage src="${src}"> not found in manifest`);
    return null;
  }

  return (
    <Figure src={image?.src ?? src} alt={alt} lang={lang}>
      {children}
    </Figure>
  );
}
