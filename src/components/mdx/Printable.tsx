import React from "react";
import { type Lang } from "@/lib/affiliate";

const COPY = {
  en: { eyebrow: "Free printable", download: "⬇ Download PDF" },
  hr: { eyebrow: "Besplatno za ispis", download: "⬇ Preuzmi PDF" },
} as const;

/** "3 pages" / "3 stranice" — Croatian needs real pluralization:
 *  1 stranica, 2–4 stranice, 5+ stranica (except 12–14 → stranica). */
function pageCount(lang: Lang, n: number): string {
  if (lang === "en") return n === 1 ? "1 page" : `${n} pages`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} stranica`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} stranice`;
  return `${n} stranica`;
}

interface PrintableProps {
  lang?: Lang;
  /** Stable tracking id on the download link; GTM's Click ID reads it.
   *  Same value in both languages so EN + HR report as one printable. */
  id?: string;
  /** e.g. /downloads/summer-of-curiosity.pdf */
  href: string;
  title: string;
  /** page count, e.g. pages="3" */
  pages?: number | string;
  /** file size, shown as-is, e.g. "1.2 MB" */
  size?: string;
  /** optional one-line description */
  children?: React.ReactNode;
}

/**
 * Download card for PDF worksheets/printables:
 *
 *   <Printable id="rainbow-rice" href="/downloads/rainbow-rice.pdf" title="Rainbow rice worksheet" pages="3" size="1.2 MB">
 *   Coloring template plus a step-by-step picture guide.
 *   </Printable>
 *
 * `id` is the GTM tracking handle: give the EN and HR copies of the same
 * printable the same id, and don't reuse an id twice on one page.
 *
 * Dashed border on purpose — reads as "cut me out". A download card is
 * useless on paper, so it's hidden in print.
 */
export default function Printable({
  lang = "en",
  id,
  href,
  title,
  pages,
  size,
  children,
}: PrintableProps) {
  const t = COPY[lang];
  const meta = [
    pages != null ? pageCount(lang, Number(pages)) : null,
    size ?? null,
  ].filter(Boolean);

  return (
    <div
      data-no-print
      className="not-prose my-8 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft/30 p-5 font-sans"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm"
        >
          📄
        </span>

        <div className="min-w-0 flex-1 basis-48">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            ✂️ {t.eyebrow}
          </p>
          <p className="mt-0.5 text-base font-bold text-gray-900">{title}</p>
          {meta.length > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">{meta.join(" · ")}</p>
          )}
        </div>

        <a
          id={id}
          href={href}
          download
          className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          {t.download}
        </a>
      </div>

      {/* div, not p: MDX delivers the description already wrapped in a <p> */}
      {children && (
        <div className="mt-3 text-sm leading-relaxed text-gray-600 [&>*]:my-0">
          {children}
        </div>
      )}
    </div>
  );
}
