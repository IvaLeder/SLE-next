import fs from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "@/components/Link";
import { imageSize } from "image-size";
import JsonLd from "@/components/JsonLd";
import { CompassMark } from "@/components/minds/motifs";
import { siteConfig } from "@/config/site";
import NewsletterSignupForm from "@/components/NewsletterSignupForm";
import { MINDS_SLUG } from "@/lib/minds";
import { getAllPosts } from "@/lib/posts";
import {
  PRINTABLE_GROUPS,
  PRINTABLES_SLUG,
  SUBSCRIBER_BONUS,
  printableThumb,
  printables,
  type Lang,
  type PrintableEntry,
  type PrintableGroup,
} from "@/lib/printables";
import { ACTIVE_CAMPAIGN, CAMPAIGNS } from "@/lib/seasonal";
import { TOOLS_SLUG, tools } from "@/lib/tools";

const COPY = {
  en: {
    eyebrow: "Free · No sign-up · Print at home or in class",
    title: "Free STEM printables for kids",
    intro:
      "Worksheets, lab sheets, cut-out templates and observation journals that go with our hands-on activities. Every one is a free PDF: download it, print it and start exploring.",
    newsletter: "Get new printables by email",
    signup: {
      eyebrow: "New printables by email",
      title: "Get each new printable in your inbox",
      titleBonus: "Get each new printable by email, plus a bonus pack",
      body: "Whenever we publish a new worksheet, template or journal, it arrives in our newsletter together with the activity it belongs to.",
      bonus: (title: string) => `As a thank-you you also get “${title}”, a pack you won’t find on this page.`,
    },
    browseLabel: "Jump to a printable group",
    inSeason: "In season now",
    seasonCta: "See the whole collection",
    download: "⬇ Download PDF",
    howTo: "How to use it",
    openGuide: "Open the guide",
    tool: "Online version",
    pdf: "PDF",
    thumbAlt: (title: string) => `First page of the ${title} printable`,
    pages: (n: number) => (n === 1 ? "1 page" : `${n} pages`),
    minds: "From Mind Explorers",
    groups: {
      science: {
        label: "Science & space",
        description: "Lab sheets and observation journals for kitchen experiments, the night sky and beyond.",
      },
      engineering: {
        label: "Engineering & codes",
        description: "Build it, test it, encode it: templates for young makers and secret-message senders.",
      },
      math: {
        label: "Math & patterns",
        description: "Hands-on sheets that turn math into something to cut, colour and test.",
      },
      minds: {
        label: "Feelings & growing up",
        description: "Gentle printables for big feelings, new starts and the very first year.",
      },
      seasonal: {
        label: "Seasonal packs",
        description: "Bigger bundles of activities for the holidays and the seasons.",
      },
    },
    tipsTitle: "Printing tips",
    tips: [
      ["📄", "Every sheet is A4. Printing on US Letter? Choose “Fit to page” in the print dialog."],
      ["✂️", "Cut-out templates like the cipher wheel and Möbius strips hold up better on thicker paper or card."],
      ["🖍️", "Most sheets are made to be coloured in, so black-and-white printing is fine."],
    ],
  },
  hr: {
    eyebrow: "Besplatno · Bez registracije · Za ispis kod kuće ili u razredu",
    title: "Besplatni STEM radni listovi i materijali za ispis",
    intro:
      "Radni listovi, laboratorijski listovi, predlošci za izrezivanje i dnevnici promatranja uz naše praktične aktivnosti. Svi su besplatni PDF-ovi: preuzmite ih, ispišite i krenite istraživati.",
    newsletter: "Primajte nove materijale e-poštom",
    signup: {
      eyebrow: "Novi materijali e-poštom",
      title: "Primajte svaki novi materijal za ispis u inbox",
      titleBonus: "Primajte nove materijale e-poštom, uz dodatni paket",
      body: "Kad objavimo novi radni list, predložak ili dnevnik, stiže vam u newsletteru zajedno s aktivnošću uz koju ide.",
      bonus: (title: string) => `Za dobrodošlicu dobivate i „${title}”, paket kojeg nema na ovoj stranici.`,
    },
    browseLabel: "Skočite na skupinu materijala",
    inSeason: "Aktualno",
    seasonCta: "Pogledajte cijelu kolekciju",
    download: "⬇ Preuzmi PDF",
    howTo: "Kako ga koristiti",
    openGuide: "Otvorite vodič",
    tool: "Online verzija",
    pdf: "PDF",
    thumbAlt: (title: string) => `Prva stranica materijala za ispis „${title}”`,
    pages: (n: number) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} stranica`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} stranice`;
      return `${n} stranica`;
    },
    minds: "Iz serijala Mind Explorers",
    groups: {
      science: {
        label: "Znanost i svemir",
        description: "Laboratorijski listovi i dnevnici promatranja za pokuse u kuhinji, noćno nebo i dalje.",
      },
      engineering: {
        label: "Inženjerstvo i šifre",
        description: "Izgradite, testirajte, šifrirajte: predlošci za male graditelje i pošiljatelje tajnih poruka.",
      },
      math: {
        label: "Matematika i uzorci",
        description: "Praktični listovi koji matematiku pretvaraju u nešto što se reže, boji i provjerava.",
      },
      minds: {
        label: "Osjećaji i odrastanje",
        description: "Nježni materijali za velike osjećaje, nove početke i prvu godinu života.",
      },
      seasonal: {
        label: "Sezonski paketi",
        description: "Veći paketi aktivnosti za praznike i godišnja doba.",
      },
    },
    tipsTitle: "Savjeti za ispis",
    tips: [
      ["📄", "Svi su listovi formata A4, pa se ispisuju bez ikakvog podešavanja."],
      ["✂️", "Predlošci za izrezivanje, poput kotača za šifriranje i Möbiusove vrpce, izdržljiviji su na debljem papiru ili kartonu."],
      ["🖍️", "Većina listova napravljena je za bojanje, pa je crno-bijeli ispis sasvim u redu."],
    ],
  },
} as const;

type Card = {
  entry: PrintableEntry;
  file: string;
  thumb: string;
  /** Real preview size: most sheets are A4 portrait, a few are landscape. */
  thumbSize: { width: number; height: number };
  /** Where the instructions live: the companion post or landing page. */
  homeHref: string;
  homeIsPage: boolean;
  /** "2 pages · 267 KB · PDF" */
  meta: string;
  tool?: { href: string; title: string };
};

/** Same rounding the hand-written <Printable> cards use: KB below ~1 MB,
 *  one decimal above. HR gets a decimal comma. */
function formatSize(bytes: number, lang: Lang): string {
  const kb = bytes / 1024;
  if (kb < 1000) return `${Math.round(kb)} KB`;
  const mb = (kb / 1024).toFixed(1).replace(/\.0$/, "");
  return `${lang === "hr" ? mb.replace(".", ",") : mb} MB`;
}

/** Published cards for one language, in registry order. Resolved at build
 *  time: a draft companion post or an unlaunched campaign hides the card. */
function resolveCards(lang: Lang): Card[] {
  const t = COPY[lang];
  const posts = new Map(getAllPosts(lang).map((p) => [p.translationKey, p]));

  return printables.flatMap((entry): Card[] => {
    const file = entry.file[lang];
    if (!file) return [];

    let homeHref: string;
    if ("post" in entry.home) {
      const post = posts.get(entry.home.post);
      if (!post) return [];
      homeHref = `/${lang}/${post.slug}`;
    } else {
      const { campaign } = entry.home;
      if (campaign && !CAMPAIGNS.find((c) => c.id === campaign)?.live) return [];
      homeHref = `/${lang}/${entry.home.page[lang]}`;
    }

    const bytes = fs.statSync(path.join(process.cwd(), "public", file)).size;
    const thumb = printableThumb(file);
    const thumbPath = path.join(process.cwd(), "public", thumb);
    // A missing preview is a validator warning, not a build failure.
    const thumbSize = fs.existsSync(thumbPath)
      ? imageSize(fs.readFileSync(thumbPath))
      : { width: 600, height: 849 };
    const tool = tools.find((x) => x.download?.id === entry.id);

    return [
      {
        entry,
        file,
        thumb,
        thumbSize: { width: thumbSize.width, height: thumbSize.height },
        homeHref,
        homeIsPage: "page" in entry.home,
        meta: [t.pages(entry.pages), formatSize(bytes, lang), t.pdf].join(" · "),
        tool: tool && {
          href: `/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`,
          title: tool.title[lang],
        },
      },
    ];
  });
}

/** The download link. `id` is the GTM handle, so each printable must appear
 *  only once per page (the spotlight takes it out of its group). */
function DownloadLink({
  card,
  lang,
  placement,
  className,
  style,
}: {
  card: Card;
  lang: Lang;
  placement: string;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <a
      id={card.entry.id}
      href={card.file}
      download
      data-analytics-event="resource_download"
      data-analytics-resource-id={card.entry.id}
      data-analytics-source="printables"
      data-analytics-placement={placement}
      data-analytics-lang={lang}
      className={className}
      style={style}
    >
      {COPY[lang].download}
    </a>
  );
}

/** Page-1 preview as a sheet of paper peeking out of a tinted mat; packs get
 *  a second sheet fanned behind it. */
function Sheet({ card, lang, size }: { card: Card; lang: Lang; size: "card" | "spotlight" }) {
  const width = size === "spotlight" ? "w-44 md:w-52" : "w-full sm:w-36";
  return (
    <div className={`relative ${width}`}>
      {card.entry.pages > 1 && (
        <span
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 -translate-y-1 rotate-3 rounded-sm bg-white shadow-md ring-1 ring-black/5"
        />
      )}
      <Image
        src={card.thumb}
        alt={COPY[lang].thumbAlt(card.entry.title[lang])}
        width={card.thumbSize.width}
        height={card.thumbSize.height}
        className="relative rounded-sm bg-white shadow-md ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1.5"
      />
    </div>
  );
}

function PrintableCard({ card, lang }: { card: Card; lang: Lang }) {
  const t = COPY[lang];
  const { entry } = card;
  return (
    // Phones get a side strip instead of the tall preview mat, which would
    // make the single-column list several screens longer.
    <article className="group flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-brand/30 hover:shadow-md sm:flex-col">
      <div className="flex w-24 shrink-0 items-start justify-center overflow-hidden bg-brand-soft/70 px-3 pt-5 sm:h-48 sm:w-auto sm:px-6 sm:pt-7">
        <Sheet card={card} lang={lang} size="card" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 font-sans sm:p-5">
        {entry.ages && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{entry.ages[lang]}</p>
        )}
        <h3 className="mt-1 text-lg font-bold leading-snug text-gray-900">{entry.title[lang]}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{entry.blurb[lang]}</p>
        <p className="mt-2 text-xs text-gray-500">{card.meta}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
          <DownloadLink
            card={card}
            lang={lang}
            placement="hub-card"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
          />
          <Link href={card.homeHref} className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline">
            {card.homeIsPage ? t.openGuide : t.howTo} <span aria-hidden="true">→</span>
          </Link>
          {card.tool && (
            <Link
              href={card.tool.href}
              title={card.tool.title}
              className="text-sm font-semibold text-brand hover:text-brand-hover hover:underline"
            >
              🧰 {t.tool}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** In-season pack, dressed in its campaign's banner colours. */
function Spotlight({ card, lang }: { card: Card; lang: Lang }) {
  const t = COPY[lang];
  const campaign = ACTIVE_CAMPAIGN!;
  return (
    <section
      aria-labelledby="in-season-heading"
      className="group relative mt-10 overflow-hidden rounded-3xl text-white shadow-md"
      style={{ background: campaign.background }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: campaign.texture, backgroundSize: "22px 22px" }}
      />
      <div className="relative flex flex-col gap-8 p-6 md:flex-row md:items-center md:p-10">
        <div className="flex justify-center md:order-2 md:w-64 md:shrink-0">
          <Sheet card={card} lang={lang} size="spotlight" />
        </div>
        <div className="font-sans md:flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: campaign.muted }}>
            <span aria-hidden="true">{campaign.icon}</span> {t.inSeason}
          </p>
          <h2 id="in-season-heading" className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
            {card.entry.title[lang]}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: campaign.muted }}>
            {card.entry.blurb[lang]}
          </p>
          <p className="mt-2 text-xs" style={{ color: campaign.muted }}>
            {[card.entry.ages?.[lang], card.meta].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <DownloadLink
              card={card}
              lang={lang}
              placement="hub-spotlight"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-white/90"
              style={{ color: campaign.ctaColor }}
            />
            <Link href={card.homeHref} className="text-sm font-semibold text-white hover:underline">
              {t.seasonCta} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PrintablesHub({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const cards = resolveCards(lang);

  // An in-season pack is lifted into the spotlight (and out of its group).
  const spotlight = cards.find(
    (c) => ACTIVE_CAMPAIGN && "page" in c.entry.home && c.entry.home.campaign === ACTIVE_CAMPAIGN.id,
  );
  const groups = PRINTABLE_GROUPS.map((key) => ({
    key,
    cards: cards.filter((c) => c.entry.group === key && c !== spotlight),
  })).filter((g) => g.cards.length > 0);

  const listed = [...(spotlight ? [spotlight] : []), ...groups.flatMap((g) => g.cards)];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    description: t.intro,
    url: `${siteConfig.url}/${lang}/${PRINTABLES_SLUG[lang]}`,
    numberOfItems: listed.length,
    itemListElement: listed.map((card, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "DigitalDocument",
        name: card.entry.title[lang],
        description: card.entry.blurb[lang],
        url: `${siteConfig.url}${card.file}`,
        image: `${siteConfig.url}${card.thumb}`,
        encodingFormat: "application/pdf",
        inLanguage: lang,
        isAccessibleForFree: true,
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="max-w-3xl">
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-700">{t.intro}</p>
        {/* Jumps to the signup band below the groups. */}
        <a
          href="#printables-signup"
          data-analytics-event="newsletter_cta_click"
          data-analytics-source="printables"
          data-analytics-placement="hub-intro"
          className="mt-3 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-newsletter hover:text-newsletter-hover hover:underline"
        >
          <span aria-hidden="true">📨</span> {t.newsletter} <span aria-hidden="true">↓</span>
        </a>
      </div>

      {spotlight && <Spotlight card={spotlight} lang={lang} />}

      <nav aria-label={t.browseLabel} className="mt-10 flex flex-wrap gap-2 font-sans text-sm">
        {groups.map((g) => (
          <a
            key={g.key}
            href={`#${g.key}`}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand-hover"
          >
            {t.groups[g.key].label} <span className="font-normal text-gray-400">{g.cards.length}</span>
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {groups.map((g) => (
          <GroupSection key={g.key} group={g.key} cards={g.cards} lang={lang} />
        ))}
      </div>

      <SignupBand lang={lang} />

      <aside className="mt-14 rounded-2xl border border-dashed border-brand/30 bg-brand-soft/30 p-6 font-sans">
        <h2 className="text-base font-bold text-gray-900">{t.tipsTitle}</h2>
        <ul className="mt-3 grid gap-3 text-sm leading-relaxed text-gray-600 md:grid-cols-3">
          {t.tips.map(([icon, tip]) => (
            <li key={icon} className="flex gap-2">
              <span aria-hidden="true">{icon}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

/** Newsletter signup for the hub. The page's own form replaces the footer
 *  band (the routes pass `newsletter={false}` to <Footer>). Once a
 *  SUBSCRIBER_BONUS pack exists in this language, the copy promises it. */
function SignupBand({ lang }: { lang: Lang }) {
  const t = COPY[lang].signup;
  const bonus = SUBSCRIBER_BONUS?.file[lang] ? SUBSCRIBER_BONUS : null;
  return (
    <section
      id="printables-signup"
      aria-labelledby="printables-signup-heading"
      className="mt-14 scroll-mt-24 overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft/80 via-white to-white shadow-sm"
    >
      <div className="grid items-center gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-brand/10"
          >
            {bonus ? "🎁" : "📨"}
          </span>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-brand">{t.eyebrow}</p>
            <h2
              id="printables-signup-heading"
              className="mt-1 font-sans text-xl font-bold leading-tight text-gray-900 md:text-2xl"
            >
              {bonus ? t.titleBonus : t.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
              {t.body}
              {bonus && ` ${t.bonus(bonus.title[lang])}`}
            </p>
          </div>
        </div>

        <NewsletterSignupForm lang={lang} variant="compact" source="printables" compactLayout="inline" />
      </div>
    </section>
  );
}

function GroupSection({ group, cards, lang }: { group: PrintableGroup; cards: Card[]; lang: Lang }) {
  const copy = COPY[lang].groups[group];
  const minds = group === "minds";

  const body = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${group}-heading`} className="font-sans text-2xl font-bold text-gray-900">
          {copy.label}
        </h2>
        {minds && (
          <Link
            href={`/${lang}/${MINDS_SLUG[lang]}`}
            className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-brand hover:text-brand-hover hover:underline"
          >
            <CompassMark size={16} className="shrink-0" />
            {COPY[lang].minds}
          </Link>
        )}
      </div>
      <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-gray-600">{copy.description}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <PrintableCard key={card.entry.id} card={card} lang={lang} />
        ))}
      </div>
    </>
  );

  // Mind Explorers printables sit on the sub-brand's cream panel, so the
  // shared cards pick up plum through the remapped brand tokens.
  return minds ? (
    <section id={group} aria-labelledby={`${group}-heading`} data-theme="minds" className="scroll-mt-24 rounded-3xl p-5 md:p-8">
      {body}
    </section>
  ) : (
    <section id={group} aria-labelledby={`${group}-heading`} className="scroll-mt-24">
      {body}
    </section>
  );
}
