"use client";

import { useEffect, useRef, useState } from "react";

type TocItem = {
  id: string;
  text: string;
  level: number; // 2, 3, 4
  children?: TocItem[];
};

export default function TOC() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(false); // mobile collapse
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const container = document.getElementById("post-content");
    if (!container) return;

    function generateId(text: string) {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function scanHeadings() {
      const headings = Array.from(
        (container as HTMLElement).querySelectorAll("h2, h3, h4")
      ) as HTMLElement[];

      const seen = new Set<string>();
      const flat: TocItem[] = [];

      headings.forEach((h) => {
        const text = h.textContent?.trim() ?? "";
        if (!text) return;

        let id = h.id;
        if (!id) {
          id = generateId(text);
          const base = id;
          let counter = 1;
          while (seen.has(id)) {
            id = `${base}-${counter++}`;
          }
          h.id = id;
        }

        seen.add(id);

        flat.push({
          id,
          text,
          level: Number(h.tagName.replace("H", "")),
          children: [],
        });
      });

      // Build nested structure H2 → H3 → H4
      const tree: TocItem[] = [];
      let lastH2: TocItem | null = null;
      let lastH3: TocItem | null = null;

      flat.forEach((item) => {
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
      });

      setItems(tree);
    }

    scanHeadings();

    // Observe MDX hydration
    observerRef.current = new MutationObserver(scanHeadings);
    observerRef.current.observe(container as HTMLElement, {
      childList: true,
      subtree: true,
    });

    return () => observerRef.current?.disconnect();
  }, []);

  if (items.length === 0) return null;

  // Smooth scroll with offset (e.g., fixed header 80px)
  function handleClick(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <aside className="mb-8 text-sm">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden font-semibold mb-3 py-2 px-3 bg-gray-100 rounded w-full text-left"
      >
        On this page {open ? "▲" : "▼"}
      </button>

      <div
        className={`border-l pl-4 space-y-2 ${
          open ? "block" : "hidden md:block"
        }`}
      >
        <div className="font-semibold mb-2 hidden md:block">On this page</div>

        {/* Render Nested Tree */}
        {items.map((h2) => (
          <div key={h2.id}>
            <a
              href={`#${h2.id}`}
              onClick={(e) => handleClick(e, h2.id)}
              className="block hover:underline font-medium"
            >
              {h2.text}
            </a>

            {/* H3 inside H2 */}
            {h2.children && h2.children.length > 0 && (
              <div className="ml-4 space-y-1">
                {h2.children.map((h3) => (
                  <div key={h3.id}>
                    <a
                      href={`#${h3.id}`}
                      onClick={(e) => handleClick(e, h3.id)}
                      className="block hover:underline text-gray-600"
                    >
                      {h3.text}
                    </a>

                    {/* H4 inside H3 */}
                    {h3.children && h3.children.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {h3.children.map((h4) => (
                          <a
                            key={h4.id}
                            href={`#${h4.id}`}
                            onClick={(e) => handleClick(e, h4.id)}
                            className="block hover:underline text-gray-500"
                          >
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