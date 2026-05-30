"use client";

import { useState } from "react";
import FilterChips from "./FilterChips";
import { categorySlugFromName, CATEGORY_ICONS } from "@/lib/categories";

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
