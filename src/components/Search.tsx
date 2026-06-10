"use client";

import { useState, useTransition, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchPostsServer } from "@/lib/search-action";

type Result = {
  slug: string;
  lang: "en" | "hr";
  title: string;
  excerpt?: string;
};

const DEBOUNCE_MS = 250;
const MAX_SHOWN = 6;

export default function Search({ lang }: { lang: "en" | "hr" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  // Index of the keyboard-highlighted option (-1 = none). Spans the result
  // links plus the trailing "view all" link.
  const [active, setActive] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  // Search renders twice (desktop nav + mobile menu), so listbox/option ids
  // must be unique per instance for aria-controls/activedescendant.
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const placeholder    = lang === "en" ? "Search posts…" : "Pretraži članke…";
  const noResultsLabel = lang === "en" ? "No matches" : "Nema rezultata";
  const searchingLabel = lang === "en" ? "Searching…" : "Tražim…";
  const viewAllLabel   = lang === "en" ? "View all results →" : "Pogledaj sve rezultate →";
  const countLabel = (n: number) =>
    lang === "en"
      ? `${n} ${n === 1 ? "result" : "results"}`
      : `${n} ${n === 1 ? "rezultat" : "rezultata"}`;

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
  const shown = displayedResults.slice(0, MAX_SHOWN);
  // Options = result links + the "view all" link (when there are results).
  const optionCount = shown.length > 0 ? shown.length + 1 : 0;
  // Clamp: the result set may have shrunk under the highlighted index.
  const activeIndex = active < optionCount ? active : -1;
  const activeId = activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined;

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

  const showDropdown = open && query.trim().length >= 2;

  const searchPageHref = `/${lang}/search?q=${encodeURIComponent(query)}`;

  const navigateTo = (href: string) => {
    setQuery("");
    setOpen(false);
    setActive(-1);
    router.push(href);
  };

  // Combobox keyboard support: arrows move the highlight (aria-activedescendant
  // — focus stays in the input so typing keeps working), Enter opens the
  // highlighted result, or the full results page when nothing is highlighted.
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (optionCount === 0) return;
      e.preventDefault();
      setOpen(true);
      const down = e.key === "ArrowDown";
      setActive((a) => {
        const current = a < optionCount ? a : -1;
        if (down) return (current + 1) % optionCount;
        return current <= 0 ? optionCount - 1 : current - 1;
      });
    } else if (e.key === "Enter") {
      if (query.trim().length < 2) return;
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < shown.length) {
        const r = shown[activeIndex];
        navigateTo(`/${r.lang}/${r.slug}`);
      } else {
        // No highlight (or highlight on "view all") → full results page.
        navigateTo(searchPageHref);
      }
    } else if (e.key === "Escape") {
      setActive(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={onInputKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Screen-reader status — announces result count without stealing focus.
          Rendered persistently so live-region changes are reliably picked up. */}
      <span role="status" aria-live="polite" className="sr-only">
        {query.trim().length >= 2
          ? isPending
            ? searchingLabel
            : displayedResults.length === 0
              ? noResultsLabel
              : countLabel(displayedResults.length)
          : ""}
      </span>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto z-50">
          {isPending && (
            <p className="px-4 py-3 text-sm text-gray-500">{searchingLabel}</p>
          )}

          {!isPending && shown.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">{noResultsLabel}</p>
          )}

          {!isPending && shown.length > 0 && (
            <ul role="listbox" id={listboxId} aria-label={placeholder}>
              {shown.map((r, i) => (
                <li key={r.slug} role="presentation">
                  <Link
                    href={`/${r.lang}/${r.slug}`}
                    role="option"
                    id={`${baseId}-opt-${i}`}
                    aria-selected={activeIndex === i}
                    onClick={() => {
                      setQuery("");
                      setOpen(false);
                      setActive(-1);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`block px-4 py-2 hover:bg-indigo-50 ${
                      activeIndex === i ? "bg-indigo-50" : ""
                    }`}
                  >
                    <p className="font-semibold text-sm">{r.title}</p>
                    {r.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2">{r.excerpt}</p>
                    )}
                  </Link>
                </li>
              ))}
              {/* Always show the "view all" link — the dedicated /search page
                  shows the full list and supports shareable URLs. */}
              <li role="presentation">
                <Link
                  href={searchPageHref}
                  role="option"
                  id={`${baseId}-opt-${shown.length}`}
                  aria-selected={activeIndex === shown.length}
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                    setActive(-1);
                  }}
                  onMouseEnter={() => setActive(shown.length)}
                  className={`block border-t border-gray-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 ${
                    activeIndex === shown.length ? "bg-indigo-50" : ""
                  }`}
                >
                  {viewAllLabel}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
