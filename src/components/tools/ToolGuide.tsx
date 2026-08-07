import type { Lang } from "@/lib/tools";
import type { ToolContent } from "@/lib/tool-content";

const COPY = {
  en: {
    how: "How to use this tool",
    learn: "What you can learn",
    note: "Important note",
  },
  hr: {
    how: "Kako koristiti ovaj alat",
    learn: "Što možete naučiti",
    note: "Važna napomena",
  },
} as const;

export default function ToolGuide({ lang, content }: { lang: Lang; content: ToolContent }) {
  const t = COPY[lang];

  return (
    <section className="mt-10 border-t border-gray-200 pt-8" aria-label={t.how}>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-sans text-2xl font-bold text-gray-900">{t.how}</h2>
          <ol className="mt-4 space-y-3">
            {content.steps[lang].map((step, index) => (
              <li key={step} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-sans text-sm font-bold text-brand">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="font-sans text-2xl font-bold text-gray-900">{t.learn}</h2>
          <ul className="mt-4 space-y-3">
            {content.learns[lang].map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
                <span className="mt-1 text-brand" aria-hidden="true">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {content.note && (
        <aside className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <p className="font-sans font-semibold">{t.note}</p>
          <p className="mt-1">{content.note[lang]}</p>
        </aside>
      )}
    </section>
  );
}
