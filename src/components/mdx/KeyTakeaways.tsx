import React from "react";
import { type Lang } from "@/lib/affiliate";

const COPY = {
  en: { title: "Key takeaways" },
  hr: { title: "Najvažnije ukratko" },
} as const;

/**
 * Summary box for the end of long articles:
 *
 *   <KeyTakeaways>
 *   - First point…
 *   - Second point…
 *   </KeyTakeaways>
 *
 * Children are ordinary markdown (usually a list). Stays in prose flow so the
 * list keeps typography styling; prints (parents skim these on paper).
 */
export default function KeyTakeaways({
  lang = "en",
  title,
  children,
}: {
  lang?: Lang;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 rounded-2xl border border-brand-soft bg-brand-soft/40 px-6 py-5 print:border-gray-300">
      <p className="mb-3 mt-0 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wide text-brand">
        <span aria-hidden="true">🎒</span> {title ?? COPY[lang].title}
      </p>
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </section>
  );
}
