"use client";

import { useState } from "react";
import FilterChips from "./FilterChips";

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
        chips={categories.map((c) => ({ key: c, label: c }))}
        active={active}
        onChange={handle}
        allLabel={lang === "hr" ? "Sve" : "All"}
        ariaLabel={lang === "hr" ? "Filtriraj po kategoriji" : "Filter by category"}
      />
    </div>
  );
}
