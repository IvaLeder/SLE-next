"use client";

import { useState } from "react";
import FilterChips from "./FilterChips";
import { categorySlugFromName } from "@/lib/categories";

// Emoji keyed by canonical subject slug so it works across both languages.
const CATEGORY_ICONS: Record<string, string> = {
  science: "🔬",
  engineering: "⚙️",
  math: "📐",
  technology: "💻",
  psychology: "🧠",
};

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

  const handle = (key: string | null) => {
    setActive(key);
    onChange(key);
  };

  return (
    <div className="my-6">
      <FilterChips
        chips={categories.map((c) => {
          const slug = categorySlugFromName(c);
          return { key: c, label: c, icon: slug ? CATEGORY_ICONS[slug] : undefined };
        })}
        active={active}
        onChange={handle}
        allLabel={lang === "hr" ? "Sve" : "All"}
        ariaLabel={lang === "hr" ? "Filtriraj po kategoriji" : "Filter by category"}
      />
    </div>
  );
}
