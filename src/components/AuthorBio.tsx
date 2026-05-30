import Link from "next/link";
import Image from "next/image";
import { getAuthor, authorSlug } from "@/lib/authors";

export default function AuthorBio({
  name,
  lang,
}: {
  name?: string;
  lang: "en" | "hr";
}) {
  const author = getAuthor(name);
  if (!author) return null;

  const initial = author.name.charAt(0).toUpperCase();
  const archiveHref = `/${lang}/author/${authorSlug(author.name)}`;
  const moreLabel = lang === "hr" ? "Više članaka autora →" : "More articles by this author →";

  return (
    <div className="mt-10 pt-6 border-t flex gap-4 items-start">
      {/* Avatar links to the author archive — readers who like the article can
          discover more from the same author with one tap. Real photo when we
          have one, falling back to the initial for authors without an avatar. */}
      <Link
        href={archiveHref}
        aria-label={author.name}
        className="flex-shrink-0 rounded-full transition-opacity hover:opacity-90"
      >
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-soft"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-brand select-none">
            {initial}
          </span>
        )}
      </Link>

      <div>
        <Link href={archiveHref} className="font-semibold text-gray-900 hover:text-brand transition-colors">
          {author.name}
        </Link>
        <p className="text-xs text-brand mb-1.5 font-sans">
          {lang === "hr" ? author.roleHr : author.role}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {lang === "hr" ? author.bioHr : author.bio}
        </p>
        <Link
          href={archiveHref}
          className="inline-block mt-2 text-xs font-semibold text-brand hover:text-brand-hover font-sans transition-colors"
        >
          {moreLabel}
        </Link>
      </div>
    </div>
  );
}
