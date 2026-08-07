import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { tools, TOOLS_SLUG, type Lang, type Tool } from "@/lib/tools";
import ToolsHubAnalytics from "@/components/tools/ToolsHubAnalytics";

const COPY = {
  en: {
    eyebrow: "Free · No sign-up · Play in your browser",
    title: "Free STEM tools & games for kids",
    intro:
      "Turn a name into binary, crack secret codes, explore fractions, practise telling time and more. Pick a tool and start experimenting — nothing to install.",
    featuredTitle: "Start exploring",
    featuredIntro: "Four favourites for curious kids, families and classrooms.",
    featuredBadge: "Featured",
    browse: "Browse by topic",
    browseLabel: "Jump to a tool group",
    tryTool: "Try this tool",
    groups: {
      math: {
        label: "Math & logic",
        description: "Make numbers visible, solve a classic puzzle and practise useful skills.",
      },
      codes: {
        label: "Codes & communication",
        description: "Write secret messages and discover how computers and telegraphs communicate.",
      },
      create: {
        label: "Create & explore",
        description: "Follow patterns, mix colours or let chance choose the next hands-on activity.",
      },
      parents: {
        label: "For parents",
        description: "A practical personalised guide for the early months of development.",
      },
    },
  },
  hr: {
    eyebrow: "Besplatno · Bez registracije · Igrajte u pregledniku",
    title: "Besplatni STEM alati i igre za djecu",
    intro:
      "Pretvorite ime u binarni kod, razbijajte tajne šifre, istražujte razlomke, vježbajte gledanje na sat i još mnogo toga. Odaberite alat i krenite — ne trebate ništa instalirati.",
    featuredTitle: "Krenite u istraživanje",
    featuredIntro: "Četiri omiljena alata za znatiželjnu djecu, obitelji i učionice.",
    featuredBadge: "Izdvojeno",
    browse: "Istražite po temi",
    browseLabel: "Skočite na skupinu alata",
    tryTool: "Isprobajte alat",
    groups: {
      math: {
        label: "Matematika i logika",
        description: "Učinite brojeve vidljivima, riješite klasičnu zagonetku i vježbajte korisne vještine.",
      },
      codes: {
        label: "Kodovi i komunikacija",
        description: "Pišite tajne poruke i otkrijte kako komuniciraju računala i telegrafi.",
      },
      create: {
        label: "Stvarajte i istražujte",
        description: "Nastavite niz, miješajte boje ili prepustite slučaju izbor sljedeće praktične aktivnosti.",
      },
      parents: {
        label: "Za roditelje",
        description: "Praktičan i personaliziran vodič kroz prve mjesece razvoja.",
      },
    },
  },
} as const;

type GroupKey = keyof (typeof COPY)["en"]["groups"];

const FEATURED_KEYS = [
  "clock",
  "name-in-binary",
  "color-mixer",
  "developmental-leaps",
] as const;

const GROUPS: { key: GroupKey; toolKeys: readonly string[] }[] = [
  {
    key: "math",
    toolKeys: ["tower-of-hanoi", "fraction-visualizer", "find-birthday-in-pi", "clock"],
  },
  {
    key: "codes",
    toolKeys: ["name-in-binary", "caesar-cipher", "morse-code"],
  },
  {
    key: "create",
    toolKeys: ["pattern-maker", "color-mixer", "activity-spinner"],
  },
  {
    key: "parents",
    toolKeys: ["developmental-leaps"],
  },
];

function resolveTools(keys: readonly string[]): Tool[] {
  return keys
    .map((key) => tools.find((tool) => tool.key === key))
    .filter((tool): tool is Tool => Boolean(tool));
}

export default function ToolsHub({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const base = TOOLS_SLUG[lang];
  const featured = resolveTools(FEATURED_KEYS);
  const groups = GROUPS.map((group) => ({
    ...group,
    tools: resolveTools(group.toolKeys),
  })).filter((group) => group.tools.length > 0);
  const visibleOrder = groups.flatMap((group) => group.tools);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    description: t.intro,
    numberOfItems: visibleOrder.length,
    itemListElement: visibleOrder.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${lang}/${base}/${tool.slug[lang]}`,
      name: tool.title[lang],
    })),
  };

  return (
    <ToolsHubAnalytics lang={lang}>
      <JsonLd data={jsonLd} />

      <div className="max-w-3xl">
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand">
          {t.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-700">{t.intro}</p>
      </div>

      <section className="mt-10" aria-labelledby="featured-tools-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-tools-heading" className="font-sans text-2xl font-bold text-gray-900">
              {t.featuredTitle}
            </h2>
            <p className="mt-1 text-gray-600">{t.featuredIntro}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {featured.map((tool) => (
            <Link
              key={tool.key}
              data-tool-key={tool.key}
              data-tool-placement="featured"
              href={`/${lang}/${base}/${tool.slug[lang]}`}
              className="group relative overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft/70 via-white to-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-4xl" aria-hidden="true">{tool.icon}</span>
                <span className="rounded-full bg-white/90 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-brand shadow-sm">
                  {t.featuredBadge}
                </span>
              </div>
              <h3 className="mt-5 font-sans text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-hover">
                {tool.title[lang]}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{tool.tagline[lang]}</p>
              <span className="mt-5 inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand">
                {t.tryTool} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="all-tools-heading">
        <h2 id="all-tools-heading" className="font-sans text-2xl font-bold text-gray-900">
          {t.browse}
        </h2>
        <nav aria-label={t.browseLabel} className="mt-4 flex flex-wrap gap-2 font-sans text-sm">
          {groups.map((group) => (
            <a
              key={group.key}
              href={`#${group.key}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:border-brand/40 hover:bg-brand-soft hover:text-brand-hover"
            >
              {t.groups[group.key].label}
            </a>
          ))}
        </nav>

        <div className="mt-9 space-y-12">
          {groups.map((group) => {
            const groupCopy = t.groups[group.key];
            return (
              <section key={group.key} id={group.key} className="scroll-mt-24" aria-labelledby={`${group.key}-heading`}>
                <h3 id={`${group.key}-heading`} className="font-sans text-xl font-bold text-gray-900">
                  {groupCopy.label}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">{groupCopy.description}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.tools.map((tool) => (
                    <Link
                      key={tool.key}
                      data-tool-key={tool.key}
                      data-tool-placement="group"
                      href={`/${lang}/${base}/${tool.slug[lang]}`}
                      className={`group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:border-brand/40 hover:bg-brand-soft/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${group.tools.length === 1 ? "sm:col-span-2" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
                        <div className="min-w-0">
                          <h4 className="font-sans text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-hover">
                            {tool.title[lang]}
                          </h4>
                          <p className="mt-1 text-[15px] leading-relaxed text-gray-600">{tool.tagline[lang]}</p>
                          <span className="mt-3 inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand">
                            {t.tryTool} <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </ToolsHubAnalytics>
  );
}
