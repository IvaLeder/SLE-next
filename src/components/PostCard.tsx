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
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs uppercase font-semibold text-indigo-600 tracking-wide">
          {post.categories?.[0]}
        </div>

        <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-indigo-700 transition-colors">
          {post.title}
        </h3>

        {/* Issue 17: date + reading time in one meta line */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(
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
