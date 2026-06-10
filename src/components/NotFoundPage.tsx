import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import PostCard from "./PostCard";
import { getAllPosts } from "@/lib/posts";

const COPY = {
  en: {
    title: "Page Not Found",
    text: "Sorry, the page you’re looking for doesn’t exist.",
    home: "Back to home",
    search: "Search posts",
    suggestions: "Or try one of these:",
  },
  hr: {
    title: "Stranica nije pronađena",
    text: "Nažalost, tražena stranica ne postoji.",
    home: "Povratak na naslovnicu",
    search: "Pretraži članke",
    suggestions: "Ili pokušajte s ovim:",
  },
} as const;

/**
 * Shared 404 page body — full chrome (Header/Footer) plus recovery paths:
 * home, search, and the four most-recent posts. Used by both the route-group
 * root not-found files and the per-language ones, so every 404 looks the same
 * and nobody lands on a dead end without navigation.
 *
 * not-found pages are statically rendered, so getAllPosts runs at build time.
 */
export default function NotFoundPage({ lang }: { lang: "en" | "hr" }) {
  const t = COPY[lang];
  const suggestions = getAllPosts(lang).slice(0, 4);

  return (
    <>
      <Header lang={lang} />
      <main id="main-content" className="max-w-4xl mx-auto p-6 py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand font-sans mb-2">
            404
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.title}</h1>
          <p className="text-gray-600 mb-6">{t.text}</p>
          <div className="flex flex-wrap justify-center gap-3 font-sans">
            <Link
              href={`/${lang}`}
              className="inline-block px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors"
            >
              {t.home}
            </Link>
            <Link
              href={`/${lang}/search`}
              className="inline-block px-5 py-2.5 bg-white text-brand text-sm font-semibold rounded-lg ring-1 ring-brand hover:bg-brand-soft transition-colors"
            >
              {t.search}
            </Link>
          </div>
        </div>

        {suggestions.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 font-sans">{t.suggestions}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((post, i) => (
                <PostCard key={post.slug} post={post} lang={lang} priority={i < 2} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
