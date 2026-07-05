import Link from "next/link";
import { SUMMER_SLUG, type Lang } from "@/lib/summer-ebook";

const COPY = {
  en: {
    eyebrow: "Free summer e-book",
    title: "Summer of curiosity",
    sub: "30+ screen-free science activities for kids, sorted by age.",
    cta: "Download free",
    note: "No sign-up",
  },
  hr: {
    eyebrow: "Besplatna ljetna e-knjiga",
    title: "Ljeto znatiželje",
    sub: "30+ znanstvenih aktivnosti za djecu bez ekrana, po dobi.",
    cta: "Preuzmite besplatno",
    note: "Bez registracije",
  },
} as const;

/**
 * Slim seasonal promo for the "Summer of curiosity" e-book, shown under the
 * homepage hero. Coral brand to match the landing page; remove after summer.
 */
export default function SummerBanner({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const href = `/${lang}/${SUMMER_SLUG[lang]}`;

  return (
    <Link
      href={href}
      className="group relative mx-auto mt-8 flex max-w-6xl items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 text-white transition-transform hover:scale-[1.005] sm:px-6"
      style={{ background: "linear-gradient(135deg, #FB6F52 0%, #F25C7A 55%, #8E54B5 100%)" }}
    >
      <span className="text-3xl leading-none sm:text-4xl" aria-hidden="true">☀️</span>

      <div className="min-w-0 flex-1">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#FFE3D6" }}>
          {t.eyebrow}
        </p>
        <p className="font-sans text-base font-bold leading-tight sm:text-lg">{t.title}</p>
        <p className="mt-0.5 hidden text-sm leading-snug sm:block" style={{ color: "#FFEAE0" }}>
          {t.sub}
        </p>
      </div>

      <span className="flex flex-none flex-col items-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold transition-transform group-hover:scale-[1.03]"
          style={{ color: "#B23A1B" }}
        >
          ↓ {t.cta}
        </span>
        <span className="mt-1 font-sans text-[11px]" style={{ color: "#FFD9CE" }}>{t.note}</span>
      </span>
    </Link>
  );
}
