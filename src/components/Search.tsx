"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { searchPostsServer } from "@/lib/search-action";

type Result = {
  slug: string;
  lang: "en" | "hr";
  title: string;
  excerpt?: string;
};

const DEBOUNCE_MS = 250;

export default function Search({ lang }: { lang: "en" | "hr" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placeholder    = lang === "en" ? "Search posts…" : "Pretraži članke…";
  const noResultsLabel = lang === "en" ? "No matches" : "Nema rezultata";
  const searchingLabel = lang === "en" ? "Searching…" : "Tražim…";
  const viewAllLabel   = lang === "en" ? "View all results →" : "Pogledaj sve rezultate →";

  // Debounced fetch — schedule a server call DEBOUNCE_MS after the last keystroke.
  // We don't clear `results` here; instead we filter at render time via
  // `displayedResults` below. That keeps this effect free of setState calls
  // (React 19's react-hooks/set-state-in-effect rule).
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) return;

    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchPostsServer(query, lang);
        setResults(data as unknown as Result[]);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, lang]);

  // Render-time gate: only show results once the query is long enough.
  // The underlying `results` state may still hold the last fetched batch.
  const displayedResults: Result[] = query.trim().length >= 2 ? results : [];

  // Close dropdown on outside-click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showDropdown =
    open && query.trim().length >= 2 && (isPending || displayedResults.length > 0 || !isPending);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto z-50">
          {isPending && (
            <p className="px-4 py-3 text-sm text-gray-500">{searchingLabel}</p>
          )}

          {!isPending && displayedResults.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">{noResultsLabel}</p>
          )}

          {!isPending && displayedResults.length > 0 && (
            <>
              <ul>
                {displayedResults.slice(0, 6).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/${r.lang}/${r.slug}`}
                      onClick={() => {
                        setQuery("");
                        setOpen(false);
                      }}
                      className="block px-4 py-2 hover:bg-indigo-50"
                    >
                      <p className="font-semibold text-sm">{r.title}</p>
                      {r.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-2">{r.excerpt}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Always show the "view all" link — the dedicated /search page
                  shows the full list and supports shareable URLs. */}
              <Link
                href={`/${lang}/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
                className="block border-t border-gray-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                {viewAllLabel}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
