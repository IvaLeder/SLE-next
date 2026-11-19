import { highlight } from "@/lib/search-text";
import type { SearchHit } from "@/lib/search-action";

/** Renders `text` with every word matching one of `terms` wrapped in <mark>.
 *  Matching ignores case and diacritics, like the search index itself. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((seg, i) =>
        seg.hit ? (
          <mark key={i} className="rounded-sm bg-yellow-100 px-0.5 text-inherit">
            {seg.text}
          </mark>
        ) : (
          seg.text
        ),
      )}
    </>
  );
}

/** Cover thumbnail for a result row: smallest WebP variant over its
 *  dominant colour, lazy-loaded. Decorative (the title sits right beside it). */
export function ResultThumb({ hit, className }: { hit: SearchHit; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-md bg-gray-100 ${className}`}
      style={hit.thumb?.color ? { backgroundColor: hit.thumb.color } : undefined}
    >
      {hit.thumb && (
        // Plain <img>: the image pipeline already produced this variant and
        // images.unoptimized is on, so next/image would add nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeURI(hit.thumb.url)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
