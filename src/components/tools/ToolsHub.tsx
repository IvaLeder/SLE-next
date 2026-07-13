import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { tools, TOOLS_SLUG, type Lang } from "@/lib/tools";

const COPY = {
  en: {
    eyebrow: "Free interactive tools",
    title: "STEM tools & games",
    intro:
      "Collection of small interactive tools to tinker with. Try encrypting a message with Caesar cipher, play Hanoi Tower or try sending SOS with Morse code. No sign-up, just play.",
  },
  hr: {
    eyebrow: "Besplatni interaktivni alati",
    title: "STEM alati i igre",
    intro:
      "Kolekcija malih interaktivnih alata za igru. Šifrirajte poruke s Cezarovom šifrom, igrajte Hanojski toranj ili pokušajte poslati SOS Morseovim kodom. Bez registracije, samo se igrajte.",
  },
} as const;

export default function ToolsHub({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const base = TOOLS_SLUG[lang];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    description: t.intro,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${lang}/${base}/${tool.slug[lang]}`,
      name: tool.title[lang],
    })),
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand">
        {t.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-700">{t.intro}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.key}
            href={`/${lang}/${base}/${tool.slug[lang]}`}
            className="group rounded-2xl border border-gray-100 p-5 shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
              <div>
                <p className="font-sans text-lg font-semibold text-gray-900 group-hover:text-brand">
                  {tool.title[lang]}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-gray-600">{tool.tagline[lang]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
