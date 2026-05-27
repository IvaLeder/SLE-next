import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "../lib/posts";

export default function PostCard({
  post,
  lang,
  priority = false,
  headingLevel = "h3",
}: {
  post: PostMeta;
  lang: "en" | "hr";
  /** Set true for above-the-fold cards (LCP candidate). Default false → lazy-loaded. */
  priority?: boolean;
  /**
   * Heading tag for the card title. Use `"h2"` on listing pages where the card
   * is a top-level section (homepage, /activities, category, tag, author, 404
   * suggestions) so the page outline reads h1 → h2 with no skipped levels.
   * Default `"h3"` is correct under article "Related Posts" grids where an
   * `<h2>` already labels the surrounding section.
   */
  headingLevel?: "h2" | "h3";
}) {
  const HeadingTag = headingLevel;
  const readLabel = lang === "hr" ? "min čitanja" : "min read";
  const updatedLabel = lang === "hr" ? "Ažurirano" : "Updated";

  // Show the more recent of (dateModified, date) on the card itself —
  // readers care about freshness more than original publish on a grid view.
  const displayDate = post.dateModified ?? post.date;

  // `isRecentlyUpdated` is derived at build time in getAllPosts() so this
  // render stays pure (no Date.now() call here — React 19 purity rule).
  const isRecentlyUpdated = post.isRecentlyUpdated ?? false;

  return (
    <Link
      href={`/${lang}/${post.slug}`}
      className="group block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-[transform,box-shadow,color] border border-gray-100"
    >
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={post.coverImage || "/images/placeholder.svg"}
          alt={post.heroAlt || post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          // motion-safe + hover-media guards: don't animate for reduced-motion
          // users or on touch devices (where the scale lingers after tap).
          className="object-cover transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-105"
        />
        {isRecentlyUpdated && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-brand text-white shadow font-sans">
            {updatedLabel}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs uppercase font-semibold text-brand tracking-wide font-sans">
          {post.categories?.[0]}
        </div>

        <HeadingTag className="font-serif text-lg font-bold leading-snug group-hover:text-brand transition-colors">
          {post.title}
        </HeadingTag>

        {/* date + reading time in one meta line — UI sans + tabular figures so
            counts vertically align across cards in a grid. */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-sans tabular-nums">
          <time dateTime={displayDate}>
            {new Date(displayDate).toLocaleDateString(
              lang === "en" ? "en-US" : "hr-HR",
              { year: "numeric", month: "short", day: "numeric" }
            )}
          </time>
          {post.readingTimeMin && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeMin} {readLabel}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
