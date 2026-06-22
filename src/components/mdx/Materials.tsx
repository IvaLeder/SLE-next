import { type Lang } from "@/lib/affiliate";

const COPY = {
  en: {
    title: "What you'll need",
    disclosure:
      "As an Amazon Associate, we earn from qualifying purchases — at no extra cost to you.",
  },
  hr: {
    title: "Što vam je potrebno",
    disclosure:
      "Kao Amazon suradnik zarađujemo od kvalificiranih kupnji — bez dodatnog troška za vas.",
  },
} as const;

/**
 * Shoppable "what you'll need" box. Wraps a list of <Material> children, each of
 * which links out to the language's configured storefront (see
 * src/lib/affiliate.ts). The box shows the required affiliate disclosure.
 *
 * Use child components with string props — NOT an array prop:
 *   <Materials>
 *   <Material name="Pony beads" q="pony beads bulk" />
 *   <Material name="Pipe cleaners" href="https://..." />
 *   </Materials>
 *
 * (next-mdx-remote passes only string attributes through; object/array
 * expression props like `items={[…]}` are dropped, so we model each item as its
 * own element.) `lang` is injected by the MDX components factory.
 */
export default function Materials({
  lang = "en",
  title,
  children,
}: {
  lang?: Lang;
  title?: string;
  children?: React.ReactNode;
}) {
  const t = COPY[lang];

  return (
    <aside
      data-no-print
      className="not-prose my-8 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5 font-sans"
    >
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
        <span aria-hidden="true">🛒</span> {title ?? t.title}
      </p>
      <ul className="space-y-1.5">{children}</ul>
      <p className="mt-3 text-xs leading-relaxed text-gray-400">{t.disclosure}</p>
    </aside>
  );
}
