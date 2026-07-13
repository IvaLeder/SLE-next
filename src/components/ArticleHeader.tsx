import Link from "next/link";
import Image from "next/image";
import { categorySlugFromName } from "@/lib/categories";
import { getAuthor, authorSlug } from "@/lib/authors";
import type { Post } from "@/lib/posts";

const LABELS = {
  en: {
    locale: "en-US",
    updated: (d: string) => `Updated ${d}`,
    published: (d: string) => `Originally published ${d}`,
    read: (m: number) => `${m} min read`,
  },
  hr: {
    locale: "hr-HR",
    updated: (d: string) => `Ažurirano ${d}`,
    published: (d: string) => `Izvorno objavljeno ${d}`,
    read: (m: number) => `${m} min čitanja`,
  },
} as const;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Article header: category eyebrow → title → byline (author photo, name, date,
 * reading time). Shared by the EN and HR `[slug]` pages so the date/update logic
 * lives in one place.
 */
export default function ArticleHeader({
  post,
  lang,
}: {
  post: Post;
  lang: "en" | "hr";
}) {
  const t = LABELS[lang];
  const author = getAuthor(post.author);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(t.locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const hasUpdate =
    !!post.dateModified &&
    new Date(post.dateModified).getTime() - new Date(post.date).getTime() >
      THIRTY_DAYS_MS;

  const archiveHref = author ? `/${lang}/author/${authorSlug(author.name)}` : null;

  return (
    <header className="mb-8">
      {/* Category eyebrow — sits above the title for a clear hierarchy */}
      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.map((cat) => {
            const slug = categorySlugFromName(cat);
            if (!slug) return null;
            return (
              <Link
                key={cat}
                href={`/${lang}/category/${slug}`}
                className="font-sans text-xs font-semibold uppercase tracking-wide text-brand bg-brand-soft px-2.5 py-1 rounded-full hover:bg-brand-tint transition-colors"
              >
                {cat}
              </Link>
            );
          })}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
        {post.title}
      </h1>

      {/* Byline: author photo + name · date · reading time */}
      <div className="flex items-center gap-3 font-sans">
        {author?.avatar && archiveHref && (
          <Link href={archiveHref} aria-label={author.name} className="flex-shrink-0">
            <Image
              src={author.avatar}
              alt={author.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-brand-soft"
            />
          </Link>
        )}

        <div className="text-sm leading-snug">
          {author && archiveHref && (
            <Link
              href={archiveHref}
              className="font-semibold text-gray-900 hover:text-brand transition-colors"
            >
              {author.name}
            </Link>
          )}

          <div className="flex items-center gap-2 text-gray-500 tabular-nums">
            <time dateTime={hasUpdate ? post.dateModified : post.date}>
              {hasUpdate ? t.updated(fmt(post.dateModified!)) : fmt(post.date)}
            </time>
            {post.readingTimeMin && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t.read(post.readingTimeMin)}</span>
              </>
            )}
          </div>

          {hasUpdate && (
            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
              {t.published(fmt(post.date))}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
