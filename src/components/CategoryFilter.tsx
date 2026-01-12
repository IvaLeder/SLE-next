"use client";

import { useState } from "react";

export default function CategoryFilter({
  categories,
  onChange,
}: {
  categories: string[];
  onChange: (selected: string | null) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  function toggle(cat: string) {
    const newValue = active === cat ? null : cat;
    setActive(newValue);
    onChange(newValue);
  }

  return (
    <div className="flex flex-wrap gap-2 my-6">
      <button
        onClick={() => toggle("")}
        className={`px-3 py-1.5 rounded-full border text-sm transition
          ${active === null ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border-gray-300"}
        `}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => toggle(cat)}
          className={`px-3 py-1.5 rounded-full border text-sm transition
            ${active === cat
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border-gray-300"
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}