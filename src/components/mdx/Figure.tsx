import Lightbox from "./Lightbox";

/**
 * Captioned image for MDX. Wraps <Lightbox> (so the image is optimised via
 * next/image AND tap-to-zoom, exactly like Markdown `![]()` images) in a real
 * <figure> with a <figcaption>.
 *
 * Usage in MDX:
 *   <Figure src="/images/posts/x.jpg" alt="…" width={600} height={428}>
 *     Caption text — may contain a [link](https://…).
 *   </Figure>
 *
 * The caption is MDX, so it can hold links/emphasis. MDX wraps it in a <p>;
 * `[&>p]:m-0` neutralises that paragraph's margin so the caption sits tight
 * under the image. The <figure> itself is centred + margined by the prose theme.
 */
export default function Figure({
  src,
  alt = "",
  width,
  height,
  lang = "en",
  children,
}: {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  lang?: "en" | "hr";
  children?: React.ReactNode;
}) {
  if (!src) return null;

  const w = width != null && width !== "" ? Number(width) : undefined;
  const h = height != null && height !== "" ? Number(height) : undefined;

  return (
    <figure>
      {/* marginClass="" — the <figure> owns the outer spacing, not the image. */}
      <Lightbox src={src} alt={alt} width={w} height={h} marginClass="" lang={lang} />
      {children != null && children !== false && children !== "" ? (
        <figcaption className="mt-3 text-sm text-gray-500 [&>p]:m-0">
          {children}
        </figcaption>
      ) : null}
    </figure>
  );
}
