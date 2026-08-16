import Link from "next/link";
import { BACK_TO_SCHOOL_SLUG, type BackToSchoolLang } from "@/lib/back-to-school";

const COPY: Record<
  BackToSchoolLang,
  { eyebrow: string; title: string; body: string; cta: string; note: string }
> = {
  en: {
    eyebrow: "Free back-to-school toolkit",
    title: "Curious, calm and ready for school",
    body: "Readiness, gentler routines, learning help and an 8-page printable.",
    cta: "Explore the guide →",
    note: "Free · no sign-up",
  },
  hr: {
    eyebrow: "Besplatan paket za početak škole",
    title: "Znatiželjno, mirno i spremno za školu",
    body: "Spremnost, nježnije rutine, pomoć pri učenju i paket od 8 stranica.",
    cta: "Istražite naš vodič →",
    note: "Besplatno · bez registracije",
  },
};

/**
 * Seasonal promo shown under the homepage hero and article headers.
 * Replace or remove it when the back-to-school campaign ends.
 */
export default function BackToSchoolBanner({ lang }: { lang: BackToSchoolLang }) {
  const copy = COPY[lang];

  return (
    <Link
      href={`/${lang}/${BACK_TO_SCHOOL_SLUG[lang]}`}
      data-no-print
      className="group relative mx-auto mt-8 flex max-w-6xl flex-wrap items-center gap-3 overflow-hidden rounded-2xl px-5 py-4 text-white transition-transform hover:scale-[1.005] sm:flex-nowrap sm:gap-4 sm:px-6"
      style={{ background: "linear-gradient(135deg, #3730A3 0%, #6D4DB3 58%, #D95770 100%)" }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />

      <span className="relative text-3xl leading-none sm:text-4xl" aria-hidden="true">🎒</span>

      <div className="relative min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-auto">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-indigo-100">
          {copy.eyebrow}
        </p>
        <p className="font-sans text-base font-bold leading-tight sm:text-lg">
          {copy.title}
        </p>
        <p className="mt-0.5 hidden text-sm leading-snug text-indigo-100 sm:block">
          {copy.body}
        </p>
      </div>

      <span className="relative ml-auto flex w-full flex-none items-center justify-end gap-3 sm:ml-0 sm:w-auto sm:flex-col sm:gap-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold text-indigo-800 transition-transform group-hover:scale-[1.03]">
          {copy.cta}
        </span>
        <span className="font-sans text-[11px] text-indigo-100 sm:mt-1">{copy.note}</span>
      </span>
    </Link>
  );
}
