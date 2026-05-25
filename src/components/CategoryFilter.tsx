"use client";

import { useState } from "react";

export default function CategoryFilter({
  categories,
  lang = "en",
  onChange,
}: {
  categories: string[];
  lang?: "en" | "hr";
  onChange: (selected: string | null) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  function select(cat: string | null) {
    setActive(cat);
    onChange(cat);
  }

  return (
    <div className="flex flex-wrap gap-2 my-6">
      {/* Issue 18: "All" now directly sets null instead of calling toggle(""),
          which was comparing null === "" (never true) and leaving the
          button in the wrong active state. */}
      <button
        onClick={() => select(null)}
        className={`px-3 py-1.5 rounded-full border text-sm transition ${
          active === null
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
        }`}
      >
        {lang === "hr" ? "Sve" : "All"}
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => select(active === cat ? null : cat)}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
            active === cat
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
