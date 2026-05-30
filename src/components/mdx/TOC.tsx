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

    // Legitimate use of setState in effect: this synchronises with the DOM
    // (an external system), which is exactly what useEffect is for. The lint
    // rule's typical concern (cascading re-renders) doesn't apply since this
    // runs once after mount and never again.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(tree);
    // MDX content is static after hydration — scan once, no observer needed.
  }, []);

  if (items.length === 0) return null;

  return (
    <aside className="mb-8 text-sm font-sans">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-700"
        aria-expanded={open}
      >
        <span>On this page</span>
        <span aria-hidden="true" className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      <div
        className={`rounded-xl border border-gray-100 bg-gray-50 p-4 md:p-5 ${
          open ? "mt-3 block" : "hidden md:block"
        }`}
      >
        <div className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-gray-500 md:block">
          On this page
        </div>

        <div className="space-y-2">
          {items.map((h2) => (
            <div key={h2.id}>
              <a
                href={`#${h2.id}`}
                className="block font-medium text-gray-700 transition-colors hover:text-brand"
              >
                {h2.text}
              </a>

              {h2.children && h2.children.length > 0 && (
                <div className="mt-1 ml-3 space-y-1 border-l border-gray-200 pl-3">
                  {h2.children.map((h3) => (
                    <div key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        className="block text-gray-600 transition-colors hover:text-brand"
                      >
                        {h3.text}
                      </a>
                      {h3.children && h3.children.length > 0 && (
                        <div className="mt-1 ml-3 space-y-1 border-l border-gray-200 pl-3">
                          {h3.children.map((h4) => (
                            <a
                              key={h4.id}
                              href={`#${h4.id}`}
                              className="block text-gray-500 transition-colors hover:text-brand"
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
      </div>
    </aside>
  );
}
