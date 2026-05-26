"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchPostsServer } from "@/lib/search-action";

type Result = {
  slug: string;
  lang: "en" | "hr";
  title: string;
  excerpt?: string;
};

const T = {
  en: {
    heading: (q: string) => (q ? `Results for "${q}"` : "Search"),
    placeholder: "Search posts…",
    noResults: "No matches found.",
    searching: "Searching…",
    count: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
    empty: "Type a query above to search 160+ posts.",
  },
  hr: {
    heading: (q: string) => (q ? `Rezultati za "${q}"` : "Pretraga"),
    placeholder: "Pretraži članke…",
    noResults: "Nema pronađenih rezultata.",
    searching: "Tražim…",
    count: (n: number) => `${n} ${n === 1 ? "rezultat" : "rezultata"}`,
    empty: "Unesite upit iznad za pretragu 160+ članaka.",
  },
};

export default function SearchResults({ lang }: { lang: "en" | "hr" }) {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [query,   setQuery]   = useState(initialQ);
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();
  const t = T[lang];

  // Run a search whenever the query changes (including on first mount).
  // We don't clear `results` here when the query is too short — instead the
  // render reads from `displayedResults` below. Keeps this effect free of
  // setState calls (React 19's react-hooks/set-state-in-effect rule).
  useEffect(() => {
    if (query.trim().length < 2) return;
    startTransition(async () => {
      const data = await searchPostsServer(query, lang);
      setResults(data as unknown as Result[]);
    });
  }, [query, lang]);

  // Gate at render time: hide the stale `results` state when the query is
  // shorter than 2 chars.
  const displayedResults: Result[] = query.trim().length >= 2 ? results : [];

  // Keep the URL ?q= in sync as the user types — makes results shareable
  // and supports browser back/forward. `replaceState` so we don't pollute
  // history with every keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [query]);

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.heading(initialQ)}</h1>

      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label={t.placeholder}
      />

      {/* Status line */}
      <p className="text-sm text-gray-500 mb-4" aria-live="polite">
        {isPending
          ? t.searching
          : query.trim().length < 2
            ? t.empty
            : displayedResults.length === 0
              ? t.noResults
              : t.count(displayedResults.length)}
      </p>

      {/* Results list — full width, more space than the dropdown */}
      <ul className="space-y-4">
        {displayedResults.map((r) => (
          <li key={r.slug} className="border-b pb-4 last:border-b-0">
            <Link
              href={`/${r.lang}/${r.slug}`}
              className="block group"
            >
              <h2 className="text-lg font-semibold group-hover:text-indigo-700">
                {r.title}
              </h2>
              {r.excerpt && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.excerpt}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
