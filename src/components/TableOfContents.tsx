import { TocItem } from "@/lib/toc";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;

  return (
    <nav className="mb-8 border-l-2 pl-4 space-y-1">
      <p className="font-semibold text-sm text-gray-700">Table of Contents</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className={`ml-${(item.level - 1) * 4}`}
          >
            <a
              href={`#${item.id}`}
              className="text-blue-700 hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}