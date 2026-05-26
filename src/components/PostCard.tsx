import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "../lib/posts";

export default function PostCard({
  post,
  lang,
  priority = false,
}: {
  post: PostMeta;
  lang: "en" | "hr";
  /** Set true for above-the-fold cards (LCP candidate). Default false → lazy-loaded. */
  priority?: boolean;
}) {
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
      className="group block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="relative w-full h-48">
        <Image
          src={post.coverImage || "/images/placeholder.svg"}
          alt={post.heroAlt || post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isRecentlyUpdated && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-indigo-600 text-white shadow">
            {updatedLabel}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs uppercase font-semibold text-indigo-600 tracking-wide">
          {post.categories?.[0]}
        </div>

        <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-indigo-700 transition-colors">
          {post.title}
        </h3>

        {/* Issue 17: date + reading time in one meta line.
            Date shown is `dateModified` when set, otherwise the publish date —
            cards stay single-line; the "Updated" chip (top-left of cover)
            already tells readers the article has been refreshed. */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
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
