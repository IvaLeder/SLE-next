import Link from "next/link";
import ToolLinksAnalytics from "@/components/tools/ToolLinksAnalytics";
import {
  FEATURED_TOOL_KEYS,
  recommendedTools,
  toolForRelatedPost,
  toolsByKey,
  TOOLS_SLUG,
  type Lang,
  type Tool,
} from "@/lib/tools";

const COPY = {
  en: {
    homeTitle: "Popular free tools & games",
    homeIntro: "Turn screen time into hands-on learning — no account or download needed.",
    allTools: "Explore all free tools",
    tryTool: "Try it now",
    articleEyebrow: "Try it yourself",
    articleTitle: "Continue with the interactive tool",
    articleIntro: "Put the idea into practice directly in your browser.",
    moreTitle: "Keep exploring",
    moreIntro: "More free tools and games you can try next.",
  },
  hr: {
    homeTitle: "Popularni besplatni alati i igre",
    homeIntro: "Pretvorite vrijeme pred ekranom u aktivno učenje — bez računa i preuzimanja.",
    allTools: "Istražite sve besplatne alate",
    tryTool: "Isprobajte sada",
    articleEyebrow: "Isprobajte sami",
    articleTitle: "Nastavite s interaktivnim alatom",
    articleIntro: "Primijenite ideju iz članka izravno u pregledniku.",
    moreTitle: "Nastavite istraživati",
    moreIntro: "Još besplatnih alata i igara koje možete isprobati.",
  },
} as const;

function toolHref(lang: Lang, tool: Tool) {
  return `/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`;
}

export function HomeToolsPromo({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const featured = toolsByKey(FEATURED_TOOL_KEYS);

  return (
    <ToolLinksAnalytics lang={lang} source="home">
      <section
        data-no-print
        aria-labelledby="home-tools-heading"
        className="mb-12 rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft/70 via-white to-white p-6 shadow-sm md:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="home-tools-heading" className="font-sans text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {t.homeTitle}
            </h2>
            <p className="mt-2 text-gray-600">{t.homeIntro}</p>
          </div>
          <Link
            href={`/${lang}/${TOOLS_SLUG[lang]}`}
            className="font-sans text-sm font-semibold text-brand hover:text-brand-hover hover:underline"
          >
            {t.allTools} →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((tool) => (
            <Link
              key={tool.key}
              data-tool-key={tool.key}
              href={toolHref(lang, tool)}
              className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
              <h3 className="mt-3 font-sans font-bold leading-snug text-gray-900 group-hover:text-brand-hover">
                {tool.title[lang]}
              </h3>
              <span className="mt-3 inline-block font-sans text-sm font-semibold text-brand">
                {t.tryTool} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </ToolLinksAnalytics>
  );
}

export function ArticleToolPromo({ lang, postSlug }: { lang: Lang; postSlug: string }) {
  const t = COPY[lang];
  const tool = toolForRelatedPost(lang, postSlug);
  if (!tool) return null;

  return (
    <ToolLinksAnalytics lang={lang} source="article">
      <aside data-no-print className="mt-10 rounded-2xl border border-brand/20 bg-brand-soft/60 p-5 md:p-6">
        <Link
          data-tool-key={tool.key}
          href={toolHref(lang, tool)}
          className="group flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
        >
          <span className="text-4xl" aria-hidden="true">{tool.icon}</span>
          <div className="min-w-0">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-brand">
              {t.articleEyebrow}
            </p>
            <h2 className="mt-1 font-sans text-xl font-bold text-gray-900 group-hover:text-brand-hover">
              {t.articleTitle}: {tool.title[lang]}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.articleIntro}</p>
            <span className="mt-3 inline-block font-sans text-sm font-semibold text-brand">
              {t.tryTool} →
            </span>
          </div>
        </Link>
      </aside>
    </ToolLinksAnalytics>
  );
}

export function ToolRecommendations({ lang, toolKey }: { lang: Lang; toolKey: string }) {
  const t = COPY[lang];
  const recommendations = recommendedTools(toolKey);
  if (!recommendations.length) return null;

  return (
    <section data-no-print className="mt-12 border-t border-gray-200 pt-8" aria-labelledby="more-tools-heading">
      <h2 id="more-tools-heading" className="font-sans text-2xl font-bold text-gray-900">{t.moreTitle}</h2>
      <p className="mt-1 text-gray-600">{t.moreIntro}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {recommendations.map((tool) => (
          <Link
            key={tool.key}
            data-tool-recommendation={tool.key}
            href={toolHref(lang, tool)}
            className="group rounded-2xl border border-gray-100 p-4 shadow-sm transition hover:border-brand/40 hover:bg-brand-soft/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <span className="text-2xl" aria-hidden="true">{tool.icon}</span>
            <h3 className="mt-2 font-sans font-semibold leading-snug text-gray-900 group-hover:text-brand-hover">
              {tool.title[lang]}
            </h3>
            <span className="mt-2 inline-block font-sans text-sm font-semibold text-brand">
              {t.tryTool} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
