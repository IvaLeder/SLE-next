import Link from "next/link";
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
          discover more from the same author with one tap. */}
      <Link
        href={archiveHref}
        aria-label={author.name}
        className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-brand font-bold text-lg select-none hover:bg-indigo-200 transition-colors"
      >
        {initial}
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
