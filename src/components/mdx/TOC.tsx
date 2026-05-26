"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  text: string;
  level: number; // 2, 3, 4
  children?: TocItem[];
};

// CSS scroll-margin handles the sticky-header offset declaratively — far
// cleaner than measuring with JS. The value should match the header height.
const SCROLL_MARGIN_PX = 72;

export default function TOC() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open,  setOpen]  = useState(false); // mobile collapse

  useEffect(() => {
    const container = document.getElementById("post-content");
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll<HTMLElement>("h2, h3, h4")
    );

    // Apply CSS scroll-margin so #anchor jumps land below the sticky header.
    // Doing it here keeps the styling co-located with the TOC behaviour.
    for (const h of headings) {
      h.style.scrollMarginTop = `${SCROLL_MARGIN_PX}px`;
    }

    const generateId = (text: string) =>
      text.toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");

    const seen = new Set<string>();
    const flat: TocItem[] = [];

    for (const h of headings) {
      const text = h.textContent?.trim() ?? "";
      if (!text) continue;

      // rehype-slug usually sets the id already; only generate a fallback
      // when missing (e.g. heading produced by a JSX component).
      let id = h.id;
      if (!id) {
        id = generateId(text);
        let n = 1;
        const base = id;
        while (seen.has(id)) id = `${base}-${n++}`;
        h.id = id;
      }
      seen.add(id);

      flat.push({
        id,
        text,
        level: Number(h.tagName.replace("H", "")),
        children: [],
      });
    }

    // Nest H3 under last H2, H4 under last H3.
    const tree: TocItem[] = [];
    let lastH2: TocItem | null = null;
    let lastH3: TocItem | null = null;

    for (const item of flat) {
      if (item.level === 2) {
        tree.push(item);
        lastH2 = item;
        lastH3 = null;
      } else if (item.level === 3 && lastH2) {
        lastH2.children!.push(item);
        lastH3 = item;
      } else if (item.level === 4 && lastH3) {
        lastH3.children!.push(item);
      }
    }

    setItems(tree);
    // MDX content is static after hydration — scan once, no observer needed.
  }, []);

  if (items.length === 0) return null;

  return (
    <aside className="mb-8 text-sm">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden font-semibold mb-3 py-2 px-3 bg-gray-100 rounded w-full text-left"
        aria-expanded={open}
      >
        On this page {open ? "▲" : "▼"}
      </button>

      <div className={`border-l pl-4 space-y-2 ${open ? "block" : "hidden md:block"}`}>
        <div className="font-semibold mb-2 hidden md:block">On this page</div>

        {items.map((h2) => (
          <div key={h2.id}>
            <a href={`#${h2.id}`} className="block hover:underline font-medium">
              {h2.text}
            </a>

            {h2.children && h2.children.length > 0 && (
              <div className="ml-4 space-y-1">
                {h2.children.map((h3) => (
                  <div key={h3.id}>
                    <a href={`#${h3.id}`} className="block hover:underline text-gray-600">
                      {h3.text}
                    </a>
                    {h3.children && h3.children.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {h3.children.map((h4) => (
                          <a key={h4.id} href={`#${h4.id}`} className="block hover:underline text-gray-500">
                            {h4.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
