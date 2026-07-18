import Link from "next/link";

/**
 * "The First Map" / "Prva karta" — a lightweight landing page for the free
 * print keepsake that companions the Developmental Leaps article. A Mind
 * Explorers surface, so it renders inside <MindsTheme> (plum/gold/cream,
 * Fraunces headings) and uses the --me-* palette tokens from globals.css.
 *
 * Direct download, no email gate — the audience it ships to (newsletter + the
 * leaps article) is already here. PDFs live in /downloads; cover thumbnails
 * are the rendered page 1. HR copy is drafted for Iva's native review, same as
 * the minds hub / milestone-guide teasers.
 */

type Lang = "en" | "hr";

const ASSETS: Record<Lang, { pdf: string; cover: string; coverAlt: string }> = {
  en: {
    pdf: "/downloads/the-first-map.pdf",
    cover: "/images/the-first-map-cover.jpg",
    coverAlt:
      "Cover of The First Map: Aska the sheepdog and Lea the toddler on a hill, a gold star above them",
  },
  hr: {
    pdf: "/downloads/prva-karta.pdf",
    cover: "/images/prva-karta-cover.jpg",
    coverAlt:
      "Naslovnica Prve karte: ovčar Aska i mališanka Lea na brežuljku, sa zlatnom zvijezdom iznad njih",
  },
};

const LEAPS: Record<Lang, { n: number; week: number; name: string }[]> = {
  en: [
    { n: 1, week: 5, name: "Sensations" },
    { n: 2, week: 8, name: "Patterns" },
    { n: 3, week: 12, name: "Smooth transitions" },
    { n: 4, week: 19, name: "Events" },
    { n: 5, week: 26, name: "Relationships" },
    { n: 6, week: 37, name: "Categories" },
    { n: 7, week: 46, name: "Sequences" },
    { n: 8, week: 55, name: "Programs" },
    { n: 9, week: 64, name: "Principles" },
    { n: 10, week: 75, name: "Systems" },
  ],
  hr: [
    { n: 1, week: 5, name: "Osjeti" },
    { n: 2, week: 8, name: "Uzorci" },
    { n: 3, week: 12, name: "Glatki prijelazi" },
    { n: 4, week: 19, name: "Događaji" },
    { n: 5, week: 26, name: "Odnosi" },
    { n: 6, week: 37, name: "Kategorije" },
    { n: 7, week: 46, name: "Slijedovi" },
    { n: 8, week: 55, name: "Programi" },
    { n: 9, week: 64, name: "Principi" },
    { n: 10, week: 75, name: "Sustavi" },
  ],
};

const COPY: Record<
  Lang,
  {
    eyebrow: string;
    h1: string;
    heroLede: string;
    heroCta: string;
    heroMeta: string;
    intro: React.ReactNode;
    insideHeading: string;
    inside: { icon: string; title: string; body: string }[];
    leapsHeading: string;
    leapsNote: string;
    wk: string;
    cardHeading: string;
    cardBody: string;
    cardCta: string;
    cardMeta: string;
    calcHref: string;
    guideHref: string;
    footTail: React.ReactNode;
  }
> = {
  en: {
    eyebrow: "✦ Free print keepsake",
    h1: "The First Map",
    heroLede:
      "A gentle, illustrated guide to your baby’s ten developmental leaps, from week 5 to week 75. Print it, keep it close by, and know that every storm ends in a new skill.",
    heroCta: "Download the free PDF ↓",
    heroMeta: "21 pages · no sign-up",
    intro: (
      <>
        It is three in the morning. Last week your baby slept peacefully; tonight
        nothing works. She isn&rsquo;t sick, she isn&rsquo;t hungry, she just
        changed. In the first eighteen months a baby&rsquo;s brain reorganises
        ten times, and each change can feel like a storm.{" "}
        <strong>The First Map</strong> walks you through all ten, calmly.
      </>
    ),
    insideHeading: "What’s inside",
    inside: [
      { icon: "🌙", title: "All ten leaps, one per page", body: "What changes in each one, from week 5 to week 75, in plain language." },
      { icon: "🧭", title: "The three C’s, explained", body: "Why more crying, clinginess and worse sleep tend to arrive together." },
      { icon: "🤍", title: "How to walk through a leap", body: "Closeness as fuel, keeping the outside world predictable, sharing the load." },
      { icon: "✦", title: "A keepsake to print", body: "A calm, illustrated companion to keep forever." },
    ],
    leapsHeading: "The ten leaps at a glance",
    leapsNote: "Count from the due date, not the birth date. Every page in the keepsake takes one of these:",
    wk: "wk",
    cardHeading: "Take the map with you",
    cardBody: "Free to download, keep and print. No email, no sign-up, just tap the button and it is yours.",
    cardCta: "↓ Download The First Map",
    cardMeta: "21-page PDF · free",
    calcHref: "/en/tools/developmental-leap-calculator",
    guideHref: "/en/developmental-leaps",
    footTail: (
      <>
        Want to know which leap is happening right now?{" "}
        <Link href="/en/tools/developmental-leap-calculator" className="font-semibold hover:underline" style={{ color: "var(--me-plum)" }}>
          Try the developmental leap calculator
        </Link>{" "}
        or read the full{" "}
        <Link href="/en/developmental-leaps" className="font-semibold hover:underline" style={{ color: "var(--me-plum)" }}>
          guide to all ten leaps
        </Link>
        .
      </>
    ),
  },
  hr: {
    eyebrow: "✦ Besplatna knjižica za ispis",
    h1: "Prva karta",
    heroLede:
      "Nježan, ilustriran vodič kroz deset bebinih skokova u razvoju, od 5. do 75. tjedna. Ispišite ga, držite ga blizu i zapamtite: svaku oluju prati nova vještina.",
    heroCta: "Preuzmite besplatni PDF ↓",
    heroMeta: "21 stranica · bez registracije",
    intro: (
      <>
        Tri je ujutro. Prošli tjedan beba je spavala mirno; večeras ništa ne
        pomaže. Nije bolesna, nije gladna, samo se promijenila. U prvih osamnaest
        mjeseci bebin se mozak reorganizira deset puta, a svaka promjena zna
        djelovati kao oluja. <strong>Prva karta</strong> vodi vas kroz svih
        deset, mirno.
      </>
    ),
    insideHeading: "Što se nalazi unutra",
    inside: [
      { icon: "🌙", title: "Svih deset skokova, prekrasno ilustrirani", body: "Što se mijenja u svakom, od 5. do 75. tjedna, jednostavnim jezikom." },
      { icon: "🧭", title: "Tri P, objašnjena", body: "Zašto plač, priljepljivost i promjene raspoloženja obično dolaze zajedno." },
      { icon: "🤍", title: "Kako proći kroz skok", body: "Blizina kao gorivo, predvidljiv vanjski svijet i podjela tereta." },
      { icon: "✦", title: "Knjižica za ispis", body: "Miran, ilustriran suputnik za pomoć u najtežim trenucima." },
    ],
    leapsHeading: "Svih deset skokova na jednom mjestu",
    leapsNote: "Brojite od termina poroda, a ne od datuma rođenja. Svaka stranica knjižice posvećena je jednom skoku:",
    wk: "tj.",
    cardHeading: "Ponesite kartu sa sobom",
    cardBody: "Besplatno za preuzimanje, čuvanje i ispis. Bez emaila, bez registracije, samo kliknite gumb i vaša je.",
    cardCta: "↓ Preuzmite Prvu kartu",
    cardMeta: "PDF od 21 stranice · besplatno",
    calcHref: "/hr/alati/kalkulator-skokova-u-razvoju",
    guideHref: "/hr/skokovi-u-razvoju",
    footTail: (
      <>
        Želite znati koji se skok upravo događa?{" "}
        <Link href="/hr/alati/kalkulator-skokova-u-razvoju" className="font-semibold hover:underline" style={{ color: "var(--me-plum)" }}>
          Isprobajte kalkulator skokova u razvoju
        </Link>{" "}
        ili pročitajte cijeli{" "}
        <Link href="/hr/skokovi-u-razvoju" className="font-semibold hover:underline" style={{ color: "var(--me-plum)" }}>
          vodič kroz svih deset skokova
        </Link>
        .
      </>
    ),
  },
};

export default function FirstMapLanding({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const a = ASSETS[lang];
  const leaps = LEAPS[lang];

  return (
    <div style={{ color: "var(--me-cocoa)" }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
        style={{ background: "var(--me-plum)" }}
      >
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--me-gold)" }}>
              {t.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: "var(--me-cream)" }}>
              {t.h1}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed" style={{ color: "#EBE3F2" }}>
              {t.heroLede}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={a.pdf}
                id="first-map"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold transition-transform hover:scale-[1.03]"
                style={{ background: "var(--me-gold)", color: "var(--me-plum-deep)" }}
              >
                {t.heroCta}
              </a>
              <span className="font-sans text-sm" style={{ color: "#C9BBDD" }}>{t.heroMeta}</span>
            </div>
          </div>

          {/* Cover thumbnail */}
          <a href={a.pdf} id="first-map" download className="mx-auto block w-40 shrink-0 sm:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.cover}
              alt={a.coverAlt}
              width={595}
              height={842}
              className="w-full rounded-lg shadow-2xl ring-1 ring-black/10"
            />
          </a>
        </div>
      </section>

      {/* Intro */}
      <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed">{t.intro}</p>

      {/* What's inside */}
      <h2 className="mb-6 mt-12 text-2xl font-bold">{t.insideHeading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {t.inside.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 rounded-2xl border p-5"
            style={{ borderColor: "var(--me-border)", background: "var(--me-surface)" }}
          >
            <span className="text-2xl" aria-hidden="true">{f.icon}</span>
            <div>
              <p className="font-sans font-semibold leading-snug" style={{ color: "var(--me-plum)" }}>{f.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The ten leaps */}
      <h2 className="mb-2 mt-12 text-2xl font-bold">{t.leapsHeading}</h2>
      <p className="mb-6 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--me-cocoa)" }}>
        {t.leapsNote}
      </p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {leaps.map((l) => (
          <li
            key={l.n}
            className="flex items-baseline gap-2 rounded-xl px-3 py-2"
            style={{ background: "var(--me-surface)", border: "1px solid var(--me-border)" }}
          >
            <span className="font-sans text-xs font-bold" style={{ color: "var(--me-gold-deep)" }}>
              {String(l.n).padStart(2, "0")}
            </span>
            <span className="text-[15px]">
              <span className="font-semibold" style={{ color: "var(--me-plum)" }}>{l.name}</span>{" "}
              <span style={{ color: "#8a7f72" }}>· {t.wk} {l.week}</span>
            </span>
          </li>
        ))}
      </ol>

      {/* Download card */}
      <section className="mt-12 rounded-3xl p-6 text-center sm:p-10" style={{ background: "var(--me-plum)" }}>
        <div className="text-4xl" aria-hidden="true">✦</div>
        <h2 className="mt-3 text-2xl font-bold" style={{ color: "var(--me-cream)" }}>
          {t.cardHeading}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed" style={{ color: "#EBE3F2" }}>
          {t.cardBody}
        </p>
        <a
          href={a.pdf}
          id="first-map"
          className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold transition-transform hover:scale-[1.03]"
          style={{ background: "var(--me-gold)", color: "var(--me-plum-deep)" }}
        >
          {t.cardCta}
        </a>
        <p className="mt-3 font-sans text-xs" style={{ color: "#C9BBDD" }}>{t.cardMeta}</p>
      </section>

      {/* Ecosystem tie-ins */}
      <p className="mt-8 text-center text-[15px]" style={{ color: "var(--me-cocoa)" }}>
        {t.footTail}
      </p>
    </div>
  );
}
