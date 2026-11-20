import Link from "@/components/Link";
import { statusCopy, exploreCopy, type Lang } from "@/lib/newsletter";
import NewsletterStatusAnalytics from "@/components/NewsletterStatusAnalytics";
import { SUBSCRIBER_BONUS } from "@/lib/printables";

const BONUS_COPY = {
  en: { eyebrow: "Your bonus pack", download: "⬇ Download PDF", pages: (n: number) => (n === 1 ? "1 page" : `${n} pages`) },
  hr: {
    eyebrow: "Vaš dodatni paket",
    download: "⬇ Preuzmi PDF",
    pages: (n: number) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? `${n} stranice` : `${n} stranica`;
    },
  },
} as const;

// Body of the two post-signup status pages. The welcome page is the completed
// single-opt-in conversion; the thank-you page remains for the optional
// double-opt-in mode and legacy confirmation emails.
export default function NewsletterStatusPage({
  lang,
  kind,
}: {
  lang: Lang;
  kind: "thankYou" | "welcome";
}) {
  const c = statusCopy[kind][lang];
  const explore = exploreCopy[lang];
  // Subscriber-only printable: shown once the signup is complete.
  const bonusFile = kind === "welcome" ? SUBSCRIBER_BONUS?.file[lang] : undefined;

  return (
    <div className="text-center">
      <NewsletterStatusAnalytics lang={lang} kind={kind} />
      <p aria-hidden="true" className="text-5xl">
        {c.emoji}
      </p>
      <h1 className="mt-4 font-sans text-3xl font-bold text-gray-900 sm:text-4xl">
        {c.title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600">{c.body}</p>

      {SUBSCRIBER_BONUS && bonusFile && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft/30 p-5 text-left font-sans">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            <span aria-hidden="true">🎁</span> {BONUS_COPY[lang].eyebrow}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">{SUBSCRIBER_BONUS.title[lang]}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{SUBSCRIBER_BONUS.blurb[lang]}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              id={SUBSCRIBER_BONUS.id}
              href={bonusFile}
              download
              data-analytics-event="resource_download"
              data-analytics-resource-id={SUBSCRIBER_BONUS.id}
              data-analytics-source="welcome"
              data-analytics-placement="bonus-pack"
              data-analytics-lang={lang}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              {BONUS_COPY[lang].download}
            </a>
            <span className="text-xs text-gray-500">{BONUS_COPY[lang].pages(SUBSCRIBER_BONUS.pages)} · PDF</span>
          </div>
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-sans text-xl font-bold text-gray-900">{explore.heading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {explore.cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <span aria-hidden="true" className="text-3xl">
                {card.icon}
              </span>
              <p className="mt-2 font-sans font-semibold text-gray-900">{card.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{card.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
