"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import { searchPosts } from "@/lib/search-client";
import type { SearchResponse } from "@/lib/search-core";
import { CATEGORY_DISPLAY, CATEGORY_ICONS, CATEGORY_SLUGS, subjectHref } from "@/lib/categories";
import { Highlight, ResultThumb } from "./SearchHighlight";

const DEBOUNCE_MS = 250;

const T = {
  en: {
    heading: (q: string) => (q ? `Results for "${q}"` : "Search"),
    placeholder: "Search posts…",
    noResults: (q: string) => `No posts match "${q}".`,
    noResultsHint: "Check the spelling, try a shorter word, or browse a subject:",
    searching: "Searching…",
    count: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
    empty: (n: number) => `Search all ${n} articles by topic, material or question.`,
    tryLabel: "Try:",
    subjectsLabel: "Or browse a subject:",
    suggestions: ["slime", "volcano", "rocket", "origami", "tantrums", "Christmas"],
  },
  hr: {
    heading: (q: string) => (q ? `Rezultati za "${q}"` : "Pretraga"),
    placeholder: "Pretraži članke…",
    noResults: (q: string) => `Nijedan članak ne odgovara upitu "${q}".`,
    noResultsHint: "Provjerite pravopis, pokušajte s kraćom riječi ili pregledajte područje:",
    searching: "Tražim…",
    count: (n: number) =>
      `${n} ${n % 10 === 1 && n % 100 !== 11 ? "rezultat" : "rezultata"}`,
    empty: (n: number) => `Pretražite svih ${n} članaka po temi, materijalu ili pitanju.`,
    tryLabel: "Probajte:",
    subjectsLabel: "Ili pregledajte područje:",
    suggestions: ["sluz", "vulkan", "raketa", "origami", "ispadi bijesa", "Božić"],
  },
};

const chip =
  "inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-brand-ring hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring";

export default function SearchResults({
  lang,
  postCount,
}: {
  lang: "en" | "hr";
  /** Published posts in this language, for the empty-state line. */
  postCount: number;
}) {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  // The last response, tagged with the exact input it answers.
  const [response, setResponse] = useState<(SearchResponse & { input: string }) | null>(null);
  const [isPending, startTransition] = useTransition();
  const latestQuery = useRef(query);
  // The ?q= query from the URL searches immediately; typing is debounced.
  const firstRun = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = T[lang];

  // Debounced search whenever the query changes. The query from the URL runs
  // straight away on first mount. No setState in the effect body itself
  // (React 19's react-hooks/set-state-in-effect rule): staleness is worked
  // out at render time from `response.input`.
  useEffect(() => {
    latestQuery.current = query;
    const delay = firstRun.current ? 0 : DEBOUNCE_MS;
    firstRun.current = false;
    if (query.trim().length < 2) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchPosts(query, lang);
        // A slow response for an older input must not overwrite a newer one.
        if (latestQuery.current === query) setResponse({ ...data, input: query });
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [query, lang]);

  // Keep the URL ?q= in sync as the user types — makes results shareable
  // and supports browser back/forward. `replaceState` so we don't pollute
  // history with every keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [query]);

  const longEnough = query.trim().length >= 2;
  const isFresh = response?.input === query;
  const loading = longEnough && (!isFresh || isPending);
  // While the next batch loads, keep the previous one on screen (dimmed)
  // rather than blanking the list on every keystroke.
  const hits = longEnough && response ? response.hits : [];
  const total = longEnough && response ? response.total : 0;
  const shownQuery = longEnough && response ? response.input.trim() : "";
  const noResults = longEnough && isFresh && !isPending && total === 0;

  const subjects = (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_SLUGS.map((slug) => (
        <Link key={slug} href={subjectHref(lang, slug)} className={chip}>
          <span aria-hidden="true">{CATEGORY_ICONS[slug]}</span>
          {CATEGORY_DISPLAY[lang][slug]}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {t.heading(longEnough ? shownQuery || query.trim() : "")}
      </h1>

      <form
        role="search"
        onSubmit={(e) => {
          // Results are live; Enter just dismisses the mobile keyboard so the
          // list isn't hidden behind it.
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <input
          ref={inputRef}
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          enterKeyHint="search"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-brand-ring"
          aria-label={t.placeholder}
        />
      </form>

      {/* Status line */}
      <p className="text-sm text-gray-500 mb-6" aria-live="polite">
        {!longEnough
          ? t.empty(postCount)
          : noResults
            ? ""
            : loading
              ? t.searching
              : t.count(total)}
      </p>

      {!longEnough && (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t.tryLabel}</p>
            <div className="flex flex-wrap gap-2">
              {t.suggestions.map((s) => (
                <button key={s} type="button" className={chip} onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{t.subjectsLabel}</p>
            {subjects}
          </div>
        </div>
      )}

      {noResults && (
        <div className="rounded-xl border border-dashed border-gray-300 p-6">
          <p className="font-semibold text-gray-900">{t.noResults(query.trim())}</p>
          <p className="mt-1 mb-4 text-sm text-gray-600">{t.noResultsHint}</p>
          {subjects}
        </div>
      )}

      {hits.length > 0 && !noResults && (
        <ul
          className={`divide-y divide-gray-100 transition-opacity ${loading ? "opacity-60" : ""}`}
          aria-busy={loading}
        >
          {hits.map((r) => (
            <li key={r.slug}>
              <Link href={`/${r.lang}/${r.slug}`} className="group flex gap-4 py-4">
                <ResultThumb hit={r} className="aspect-[16/9] w-28 sm:w-40 self-start" />
                <div className="min-w-0">
                  {r.category && (
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {r.categoryIcon && <span aria-hidden="true">{r.categoryIcon} </span>}
                      {r.category}
                    </p>
                  )}
                  <h2 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-brand-hover">
                    <Highlight text={r.title} terms={r.terms} />
                  </h2>
                  {r.snippet && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                      <Highlight text={r.snippet} terms={r.terms} />
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
