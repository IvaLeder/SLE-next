import Link from "next/link";
import {
  summerCopy,
  summerSections,
  SUMMER_PDF,
  type Lang,
} from "@/lib/summer-ebook";

const TEASER = {
  en: {
    heroCta: "Download the free e-book",
    heroNote: "Free PDF · no sign-up required",
    whatsInside: "What's inside",
    count: (n: number) => `${n} activities`,
    bonusTitle: "Plus three bonuses",
    bonusBingo: "Summer-science bingo card",
    bonusRainy: "Rainy-day rescue picks",
    bonusTips: "Parent survival tips",
    getTitle: "Download your free copy ☀️",
    getBody:
      "No email, no sign-up, just tap the button and the e-book is yours to keep, print and share.",
    whatYouGet: "Your free 10-page PDF includes:",
    download: "Download the PDF",
    downloadMeta: "10-page PDF · free",
    noEmail: "No email required",
  },
  hr: {
    heroCta: "Preuzmite besplatnu e-knjigu",
    heroNote: "Besplatni PDF · bez registracije",
    whatsInside: "Što vas čeka unutra",
    count: (n: number) => `${n} aktivnosti`,
    bonusTitle: "Plus tri bonusa",
    bonusBingo: "Kartica za ljetni bingo",
    bonusRainy: "Izbor za kišne dane",
    bonusTips: "Savjeti za roditelje",
    getTitle: "Preuzmite svoj besplatni primjerak ☀️",
    getBody:
      "Bez emaila, bez registracije, samo kliknite gumb i e-knjiga je vaša za čuvanje, ispis i dijeljenje.",
    whatYouGet: "Vaš besplatni PDF od 10 stranica uključuje:",
    download: "Preuzmite PDF",
    downloadMeta: "PDF od 10 stranica · besplatno",
    noEmail: "Bez upisivanja emaila",
  },
} as const;

const BONUS_COLOR = "#8E54B5";

export default function SummerLanding({ lang }: { lang: Lang }) {
  const t = summerCopy[lang];
  const x = TEASER[lang];
  const pdf = SUMMER_PDF[lang];
  const total = summerSections.reduce((n, s) => n + s.activities.length, 0);

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12"
        style={{ background: "#FB6F52" }}
      >
        <svg viewBox="0 0 160 160" className="pointer-events-none absolute -right-6 -top-8 h-40 w-40" aria-hidden="true">
          <g stroke="#FFD166" strokeWidth="8" strokeLinecap="round">
            <line x1="90" y1="8" x2="90" y2="30" /><line x1="90" y1="150" x2="90" y2="128" />
            <line x1="8" y1="90" x2="30" y2="90" /><line x1="150" y1="90" x2="128" y2="90" />
            <line x1="33" y1="33" x2="48" y2="48" /><line x1="147" y1="33" x2="132" y2="48" />
            <line x1="33" y1="147" x2="48" y2="132" /><line x1="147" y1="147" x2="132" y2="132" />
          </g>
          <circle cx="90" cy="90" r="38" fill="#FFD166" />
        </svg>

        <p className="relative font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: "#FFE3D6" }}>
          {t.eyebrow}
        </p>
        <h1 className="relative mt-3 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">{t.title}</h1>
        <p className="relative mt-4 max-w-lg text-lg leading-relaxed" style={{ color: "#FFEAE0" }}>
          {t.subtitle}
        </p>
        <div className="relative mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={pdf}
            download
            id="summer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-sans text-sm font-semibold transition-transform hover:scale-[1.03]"
            style={{ color: "#B23A1B" }}
          >
            {x.heroCta} ↓
          </a>
          <span className="font-sans text-sm" style={{ color: "#FFD9CE" }}>{x.heroNote}</span>
        </div>
      </section>

      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-700">{t.intro}</p>

      <h2 className="mb-6 mt-12 font-sans text-2xl font-bold">{x.whatsInside}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {summerSections.map((sec) => (
          <div key={sec.key} className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-2" style={{ background: sec.color }} />
            <div className="flex items-start gap-3 p-5">
              <span className="text-3xl" aria-hidden="true">{sec.icon}</span>
              <div>
                <span
                  className="inline-block rounded-full px-3 py-0.5 font-sans text-xs font-semibold"
                  style={{ background: `${sec.color}1f`, color: sec.color }}
                >
                  {sec.age[lang]}
                </span>
                <p className="mt-1.5 font-sans font-semibold leading-snug text-gray-900">{sec.title[lang]}</p>
                <p className="mt-1 font-sans text-sm text-gray-500">{x.count(sec.activities.length)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-8 font-sans text-sm font-semibold uppercase tracking-wide text-gray-500">
        {x.bonusTitle}
      </h3>
      <div className="flex flex-wrap gap-2">
        {[
          { icon: "🎯", label: x.bonusBingo },
          { icon: "🌧️", label: x.bonusRainy },
          { icon: "🌞", label: x.bonusTips },
        ].map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-semibold"
            style={{ background: `${BONUS_COLOR}14`, color: BONUS_COLOR }}
          >
            <span aria-hidden="true">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>

      <section id="get" className="mt-12 scroll-mt-20 rounded-3xl bg-orange-50 p-6 sm:p-8">
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div>
            <h2 className="font-sans text-2xl font-bold text-gray-900">{x.getTitle}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-700">{x.getBody}</p>
            <p className="mt-4 font-sans text-sm font-semibold text-gray-700">{x.whatYouGet}</p>
            <ul className="mt-2 space-y-1.5">
              {summerSections.map((sec) => (
                <li key={sec.key} className="flex items-start gap-2 text-[15px] text-gray-700">
                  <span aria-hidden="true">{sec.icon}</span>
                  <span>
                    {sec.title[lang]} <span className="text-gray-400">· {x.count(sec.activities.length)}</span>
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-[15px] text-gray-700">
                <span aria-hidden="true">🎁</span>
                <span>{x.bonusBingo}, {x.bonusRainy} &amp; {x.bonusTips}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="text-5xl" aria-hidden="true">📘</div>
            <p className="mt-3 font-sans text-sm font-semibold text-gray-900">{x.downloadMeta}</p>
            <a
              id="summer"
              href={pdf}
              download
              className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: "#FB6F52" }}
            >
              ↓ {x.download}
            </a>
            <p className="mt-3 font-sans text-xs text-gray-400">{x.noEmail}</p>
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-[15px] text-gray-600">
        {total}+ {lang === "hr" ? "aktivnosti" : "activities"} ·{" "}
        <Link href={`/${lang}/activities`} className="font-semibold text-[#FB6F52] hover:underline">
          {t.ctaButton} →
        </Link>
      </p>
    </div>
  );
}
