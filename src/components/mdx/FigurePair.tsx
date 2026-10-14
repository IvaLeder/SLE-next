/**
 * Two captioned images side by side, for "this vs that" comparisons
 * (a fast punch vs gentle fingers, wet vs dry...). Children are two
 * ordinary <Figure>s, so each keeps its own alt, caption and tap-to-zoom:
 *
 *   <FigurePair>
 *   <Figure src="/images/posts/a.jpg" alt="…">Fast punch: it stays solid.</Figure>
 *   <Figure src="/images/posts/b.jpg" alt="…">Gentle fingers: they sink in.</Figure>
 *   </FigurePair>
 *
 * Stays two columns even on phones, because the comparison is the point;
 * use images with the same ratio and framing so they line up.
 * Use BeforeAfter instead when the two shots are pixel-aligned and a drag
 * slider tells the story better.
 */
export default function FigurePair({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-8 grid grid-cols-2 items-start gap-3 sm:gap-5 [&_figure]:m-0 [&_picture]:m-0 [&_figcaption]:mt-2 [&_figcaption]:text-xs sm:[&_figcaption]:text-sm">
      {children}
    </div>
  );
}
