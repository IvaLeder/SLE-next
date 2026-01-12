"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { searchPostsServer } from "@/lib/search-action";

export default function Search({ lang }: { lang: "en" | "hr" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      startTransition(async () => {
        const data = await searchPostsServer(value, lang);
        setResults(data);
      });
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={lang === "en" ? "Search posts..." : "Pretraži članke..."}
        className="w-full border p-2 rounded"
      />

      {isPending && <p className="text-sm text-gray-500">Searching…</p>}

      {results.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 max-h-60 overflow-auto shadow-md rounded z-50">
          {results.map((r) => (
            <li key={r.slug} className="px-4 py-2 hover:bg-gray-100">
              <Link href={`/${r.lang}/${r.slug}`} onClick={() => setQuery("")}>
                <p className="font-semibold">{r.title}</p>
                {r.excerpt && (
                  <p className="text-sm text-gray-500">{r.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}