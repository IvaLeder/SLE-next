import Image from "next/image";
import Link from "next/link";
import { heroImages } from "@/lib/hero-images";

const content = {
  en: {
    tag: "For parents & educators",
    headline: "STEM & Science\nfor Curious Kids",
    sub: "Hands-on experiments, child development guides and psychology insights — practical ideas you can try today.",
    primary: { label: "Browse activities", href: "/en/activities" },
    secondary: { label: "Browse by subject", href: "/en/category/science" },
  },
  hr: {
    tag: "Za roditelje i odgajatelje",
    headline: "STEM i Znanosti\nza Znatiželjnu Djecu",
    sub: "Praktični pokusi, vodiči za razvoj djeteta i savjeti iz psihologije — ideje koje možete isprobati odmah.",
    primary: { label: "Pregledaj aktivnosti", href: "/hr/activities" },
    secondary: { label: "Pregledaj po kategoriji", href: "/hr/category/science" },
  },
};

export default function Hero({ lang }: { lang: "en" | "hr" }) {
  const t = content[lang];

  return (
    <div className="relative w-full h-[340px] md:h-[440px] overflow-hidden">
      <Image
        src={heroImages[lang]}
        alt={t.headline.replace("\n", " ")}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Gradient overlay — left-heavy so text is readable, right stays open */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-3">
          {t.tag}
        </span>

        {/* h1 on the homepage — good for SEO, describes the page purpose */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight whitespace-pre-line mb-4">
          {t.headline}
        </h1>

        <p className="text-gray-200 text-sm md:text-base mb-6 max-w-sm leading-relaxed">
          {t.sub}
        </p>

        <div className="flex flex-wrap gap-3 font-sans">
          <Link
            href={t.primary.href}
            className="inline-block px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t.primary.label} →
          </Link>
          <Link
            href={t.secondary.href}
            className="inline-block px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-lg ring-1 ring-white/30 transition-colors"
          >
            {t.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
